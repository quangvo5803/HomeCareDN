import { useCallback, useEffect, useState } from 'react';
import { addressService } from '../services/addressService';
import { geoService } from '../services/geoService';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const emptyForm = { id: null, city: '', district: '', ward: '', detail: '' };

export default function AddressManager() {
  const { t } = useTranslation(); // không namespace
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Geo data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Selected codes
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');

  // Load provinces & addresses on mount
    const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await addressService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error(t('address.load_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await geoService.getProvinces(1);
        setProvinces(Array.isArray(data) ? data : []);
      } catch {
        setProvinces([]);
      }
      await load();
    })();
  }, [load]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      city: form.city.trim(),
      district: form.district.trim(),
      ward: form.ward.trim(),
      detail: form.detail.trim(),
    };

    try {
      if (form.id) {
        await addressService.update(form.id, payload);
        toast.success(t('address.update_success'));
      } else {
        await addressService.create(payload);
        toast.success(t('address.add_success'));
      }

      setForm(emptyForm);
      setSelectedProvinceCode('');
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setDistricts([]);
      setWards([]);

      await load();
    } catch (err) {
      console.error('Address save error:', err?.response?.status, err?.response?.data);
      const data = err?.response?.data;
      const firstError =
        (data?.errors && Object.values(data.errors)[0]?.[0]) ||
        data?.message ||
        t('address.save_error');
      toast.error(firstError);
    } finally {
      setSubmitting(false);
    }
  };

  const editItem = async (it) => {
    setForm({ id: it.id, city: it.city, district: it.district, ward: it.ward, detail: it.detail });

    try {
      let provs = provinces;
      if (!provs?.length) {
        const { data } = await geoService.getProvinces(1);
        provs = Array.isArray(data) ? data : [];
        setProvinces(provs);
      }

      const provinceMatch = provs.find((p) => normalize(p.name) === normalize(it.city));
      if (provinceMatch?.code) {
        const provCode = String(provinceMatch.code);
        setSelectedProvinceCode(provCode);

        const { data: provObj } = await geoService.getDistrictsByProvince(provinceMatch.code);
        const ds = provObj?.districts || [];
        setDistricts(ds);

        const districtMatch = ds.find((d) => normalize(d.name) === normalize(it.district));
        if (districtMatch?.code) {
          const distCode = String(districtMatch.code);
          setSelectedDistrictCode(distCode);

          const { data: distObj } = await geoService.getWardsByDistrict(districtMatch.code);
          const ws = distObj?.wards || [];
          setWards(ws);

          const wardMatch = ws.find((w) => normalize(w.name) === normalize(it.ward));
          setSelectedWardCode(wardMatch ? String(wardMatch.code) : '');
        } else {
          setSelectedDistrictCode('');
          setSelectedWardCode('');
          setWards([]);
        }
      } else {
        setSelectedProvinceCode('');
        setSelectedDistrictCode('');
        setSelectedWardCode('');
        setDistricts([]);
        setWards([]);
      }
    } catch {
      // im lặng, vì chỉ hỗ trợ UX
    }
  };

  const deleteItem = async (id) => {
    if (!confirm(t('address.confirm_delete'))) return;
    try {
      await addressService.remove(id);
      toast.success(t('address.delete_success'));
      await load();
    } catch {
      toast.error(t('address.delete_error'));
    }
  };

  // ===== Geo Handlers =====
  const onProvinceChange = async (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    setSelectedDistrictCode('');
    setSelectedWardCode('');
    setDistricts([]);
    setWards([]);
    setForm((s) => ({ ...s, city: '', district: '', ward: '' }));

    if (!code) return;

    try {
      const { data: province } = await geoService.getDistrictsByProvince(Number(code));
      const ds = province?.districts || [];
      setDistricts(ds);
      setForm((s) => ({ ...s, city: province?.name || '' }));
    } catch {
      setDistricts([]);
    }
  };

  const onDistrictChange = async (e) => {
    const code = e.target.value;
    setSelectedDistrictCode(code);
    setSelectedWardCode('');
    setWards([]);
    setForm((s) => ({ ...s, district: '', ward: '' }));

    if (!code) return;

    try {
      const { data: district } = await geoService.getWardsByDistrict(Number(code));
      const ws = district?.wards || [];
      setWards(ws);
      setForm((s) => ({ ...s, district: district?.name || '' }));
    } catch {
      setWards([]);
    }
  };

  const onWardChange = (e) => {
    const code = e.target.value;
    setSelectedWardCode(code);
    const w = wards.find((x) => String(x.code) === code);
    setForm((s) => ({ ...s, ward: w?.name || '' }));
  };

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  return (
    <div className="p-6 rounded-2xl border shadow-sm bg-white/80">
      <h2 className="text-xl font-semibold mb-4">{t('address.title')}</h2>

      {/* List */}
      <div className="mb-6 space-y-3">
        {loading && <div>{t('address.loading')}</div>}
        {!loading && items.length === 0 && <div className="text-gray-500">{t('address.empty')}</div>}

        {items.map((it) => (
          <div key={it.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.detail}</div>
              <div className="text-sm text-gray-500">
                {it.ward}, {it.district}, {it.city}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editItem(it)} className="px-3 py-1 rounded-lg border">
                {t('address.edit')}
              </button>
              <button onClick={() => deleteItem(it.id)} className="px-3 py-1 rounded-lg border">
                {t('address.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
        {/* Select theo mã để lấy đúng tên lưu vào form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t('address.select.province')}</label>
            <select
              className="border rounded-xl p-3 w-full"
              value={selectedProvinceCode}
              onChange={onProvinceChange}
            >
              <option value="">{t('address.select.choose')}</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('address.select.district')}</label>
            <select
              className="border rounded-xl p-3 w-full"
              value={selectedDistrictCode}
              onChange={onDistrictChange}
              disabled={!selectedProvinceCode}
            >
              <option value="">{t('address.select.choose')}</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('address.select.ward')}</label>
            <select
              className="border rounded-xl p-3 w-full"
              value={selectedWardCode}
              onChange={onWardChange}
              disabled={!selectedDistrictCode}
            >
              <option value="">{t('address.select.choose')}</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview & chỉnh chi tiết */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input 
            type="hidden"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder={t('address.preview.city')}
            className="border rounded-xl p-3"
            required
          />
          <input
            type="hidden"
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder={t('address.preview.district')}
            className="border rounded-xl p-3"
            required
          />
          <input
            type="hidden"
            name="ward"
            value={form.ward}
            onChange={handleChange}
            placeholder={t('address.preview.ward')}
            className="border rounded-xl p-3"
            required
          />
        </div>

        <input
          name="detail"
          value={form.detail}
          onChange={handleChange}
          placeholder={t('address.detail_placeholder')}
          className="border rounded-xl p-3"
          required
        />

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-xl border" disabled={submitting}>
            {submitting ? t('address.saving') : form.id ? t('address.update_button') : t('address.add_button')}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setSelectedProvinceCode('');
                setSelectedDistrictCode('');
                setSelectedWardCode('');
                setDistricts([]);
                setWards([]);
              }}
              className="px-4 py-2 rounded-xl border"
            >
              {t('address.cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/** Chuẩn hoá tên địa lý để match ổn định hơn */
function normalize(s) {
  const noDiacritics = (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  return noDiacritics
    .replace(/\b(thanh pho thuoc tinh|thanh pho|tinh|quan|huyen|thi xa|thi tran|phuong|xa)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
