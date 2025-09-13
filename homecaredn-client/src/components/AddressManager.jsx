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

  // UI-only preview (không đổi logic)
  const preview = [form.detail, form.ward, form.district, form.city].filter(Boolean).join(', ');

  return (
    <div className="relative">
      {/* nền trang trí */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-1/4 translate-y-1/4 rounded-full bg-amber-200/25 blur-3xl" />
      </div>

      <div className="p-6 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl ring-1 ring-gray-100">
        <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-orange-700 to-amber-600 bg-clip-text text-transparent">
          {t('address.title')}
        </h2>
        <p className="text-sm text-gray-600 mb-6">{t('address.subtitle', 'Quản lý & thêm địa chỉ nhận hàng')}</p>

        {/* List */}
        <div className="mb-6 space-y-3">
          {loading && (
            <div className="space-y-2" role="status" aria-live="polite">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white/80 p-6 text-center">
              <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <MapPinIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="font-medium">{t('address.empty')}</div>
              <div className="text-sm text-gray-500">{t('address.empty_hint', 'Hãy thêm địa chỉ mới bên dưới.')}</div>
            </div>
          )}

          {!loading &&
            items.map((it) => (
              <div
                key={it.id}
                className="group border rounded-xl p-4 flex items-start justify-between bg-white/80 hover:bg-white transition shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-9 w-9 shrink-0 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <MapPinIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{it.detail}</div>
                    <div className="text-sm text-gray-500">
                      {it.ward}, {it.district}, {it.city}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editItem(it)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 text-orange-700 bg-orange-50/50 hover:bg-orange-50 hover:shadow-sm transition"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('address.edit')}</span>
                  </button>
                  <button
                    onClick={() => deleteItem(it.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50 hover:shadow-sm transition"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('address.delete')}</span>
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          {/* Select theo mã để lấy đúng tên lưu vào form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>{t('address.select.province')}</Label>
              <div className="relative">
                <select
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 pr-8 text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-orange-200 hover:border-gray-300"
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
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <Label>{t('address.select.district')}</Label>
              <div className="relative">
                <select
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 pr-8 text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-orange-200 hover:border-gray-300 disabled:opacity-60"
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
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <Label>{t('address.select.ward')}</Label>
              <div className="relative">
                <select
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 pr-8 text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-orange-200 hover:border-gray-300 disabled:opacity-60"
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
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Hidden inputs giữ nguyên logic */}
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

          {/* Detail */}
          <div>
            <Label>{t('address.detail_placeholder')}</Label>
            <input
              name="detail"
              value={form.detail}
              onChange={handleChange}
              placeholder={t('address.detail_placeholder')}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
              required
            />
            {preview && (
              <FieldHint>
                {t('address.preview.label', 'Xem trước')}: <span className="text-gray-900">{preview}</span>
              </FieldHint>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:shadow-xl hover:brightness-105 active:brightness-95 disabled:opacity-60 transition"
              disabled={submitting}
            >
              {submitting && <Spinner className="h-4 w-4" />}
              <span className="font-medium">
                {submitting ? t('address.saving') : form.id ? t('address.update_button') : t('address.add_button')}
              </span>
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white/80 hover:bg-gray-50 shadow-sm hover:shadow-md transition"
              >
                {t('address.cancel')}
              </button>
            )}
          </div>
        </form>
      </div>
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

/* ---------- UI atoms (chỉ giao diện) ---------- */

function Label({ children }) {
  return (
    <label className="block text-sm font-medium mb-1 text-gray-800">
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 inline-block" aria-hidden />
        {children}
      </span>
    </label>
  );
}

function FieldHint({ children }) {
  return <p className="mt-1.5 text-xs text-gray-500">{children}</p>;
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
        <div>
          <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

function MapPinIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
    </svg>
  );
}

function PencilIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5L5 16l1.086-2.914 8.5-8.5zM4 17h12v2H4a1 1 0 01-1-1v-1h1z"/>
    </svg>
  );
}

function TrashIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6 7h8l-.8 9.2A2 2 0 0111.2 18H8.8a2 2 0 01-2-1.8L6 7zm3-3h2l1 1h4v2H4V5h4l1-1z"/>
    </svg>
  );
}

function ChevronDown({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 11.94 1.16l-4.2 3.32a.75.75 0 01-.92 0L5.21 8.39a.75.75 0 01.02-1.18z" clipRule="evenodd" />
    </svg>
  );
}
