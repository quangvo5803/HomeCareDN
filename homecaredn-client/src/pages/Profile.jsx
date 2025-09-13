import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { profileService } from '../services/profileService';
import { addressService } from '../services/addressService';
import { geoService } from '../services/geoService';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */
const emptyAddrForm = { id: null, city: '', district: '', ward: '', detail: '' };

/* -------------------------------------------------------------------------- */
/*                                Main Screen                                  */
/* -------------------------------------------------------------------------- */
export default function ProfilePage() {
  const { reload } = useAuth();
  const { t } = useTranslation();

  // Tabs
  const [active, setActive] = useState('profile'); // 'profile' | 'service_requests'

  // Profile form
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', gender: null, email: '' });
  const [saving, setSaving] = useState(false);

  // Address states
  const [addrItems, setAddrItems] = useState([]);
  const [addrForm, setAddrForm] = useState(emptyAddrForm);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrSubmitting, setAddrSubmitting] = useState(false);

  // Geo data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Selected codes
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');

  /* --------------------------------- Loaders -------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await profileService.getMine();
        setForm({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender ?? null,
          email: data.email || data.userName || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      }
    })();
  }, []);

  const loadAddresses = useCallback(async () => {
    setAddrLoading(true);
    try {
      const { data } = await addressService.getAll();
      setAddrItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error(t('address.load_error', 'Tải địa chỉ thất bại'));
    } finally {
      setAddrLoading(false);
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
      await loadAddresses();
    })();
  }, [loadAddresses]);

  /* ------------------------------- Profile save ------------------------------ */
  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await profileService.update({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber || null,
        gender: form.gender === '' ? null : Number(form.gender),
      });

      try {
        await reload();
      } catch (re) {
        console.warn('Reload profile failed:', re);
      }

      toast.success(t('profile.update_success', 'Cập nhật hồ sơ thành công'));
    } catch (err) {
      const data = err?.response?.data;
      const firstError =
        (data?.errors && Object.values(data.errors)[0]?.[0]) ||
        data?.title ||
        data?.message ||
        t('profile.update_error', 'Cập nhật hồ sơ thất bại');
      toast.error(firstError);
    } finally {
      setSaving(false);
    }
  };


  /* ------------------------------- Address CRUD ------------------------------ */
  const addrHandleSubmit = async (e) => {
    e.preventDefault();
    if (addrSubmitting) return;
    setAddrSubmitting(true);

    const payload = {
      city: addrForm.city.trim(),
      district: addrForm.district.trim(),
      ward: addrForm.ward.trim(),
      detail: addrForm.detail.trim(),
    };

    try {
      if (addrForm.id) {
        await addressService.update(addrForm.id, payload);
        toast.success(t('address.update_success', 'Đã cập nhật địa chỉ'));
      } else {
        await addressService.create(payload);
        toast.success(t('address.add_success', 'Đã thêm địa chỉ'));
      }

      // reset
      resetAddressForm();
      await loadAddresses();
    } catch (err) {
      console.error('Address save error:', err?.response?.status, err?.response?.data);
      const data = err?.response?.data;
      const firstError =
        (data?.errors && Object.values(data.errors)[0]?.[0]) ||
        data?.message ||
        t('address.save_error', 'Lưu địa chỉ thất bại');
      toast.error(firstError);
    } finally {
      setAddrSubmitting(false);
    }
  };

  const editAddrItem = async (it) => {
    setAddrForm({ id: it.id, city: it.city, district: it.district, ward: it.ward, detail: it.detail });

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
        resetGeoSelections();
      }
    } catch {
      // ignore — UX support only
    }
  };

  const deleteAddrItem = async (id) => {
    if (!confirm(t('address.confirm_delete', 'Xoá địa chỉ này?'))) return;
    try {
      await addressService.remove(id);
      toast.success(t('address.delete_success', 'Đã xoá địa chỉ'));
      await loadAddresses();
    } catch {
      toast.error(t('address.delete_error', 'Xoá địa chỉ thất bại'));
    }
  };

  /* --------------------------- Geo change handlers --------------------------- */
  const onProvinceChange = async (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    setSelectedDistrictCode('');
    setSelectedWardCode('');
    setDistricts([]);
    setWards([]);
    setAddrForm((s) => ({ ...s, city: '', district: '', ward: '' }));

    if (!code) return;

    try {
      const { data: province } = await geoService.getDistrictsByProvince(Number(code));
      const ds = province?.districts || [];
      setDistricts(ds);
      setAddrForm((s) => ({ ...s, city: province?.name || '' }));
    } catch {
      setDistricts([]);
    }
  };

  const onDistrictChange = async (e) => {
    const code = e.target.value;
    setSelectedDistrictCode(code);
    setSelectedWardCode('');
    setWards([]);
    setAddrForm((s) => ({ ...s, district: '', ward: '' }));

    if (!code) return;

    try {
      const { data: district } = await geoService.getWardsByDistrict(Number(code));
      const ws = district?.wards || [];
      setWards(ws);
      setAddrForm((s) => ({ ...s, district: district?.name || '' }));
    } catch {
      setWards([]);
    }
  };

  const onWardChange = (e) => {
    const code = e.target.value;
    setSelectedWardCode(code);
    const w = wards.find((x) => String(x.code) === code);
    setAddrForm((s) => ({ ...s, ward: w?.name || '' }));
  };

  const addrHandleChange = (e) => setAddrForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  /* ---------------------------------- UI Derivations ---------------------------------- */
  const avatarChar = (form.fullName?.trim()?.[0] || form.email?.trim()?.[0] || '?').toUpperCase();
  const addrPreview = [addrForm.detail, addrForm.ward, addrForm.district, addrForm.city].filter(Boolean).join(', ');

  /* ---------------------------------- Helpers --------------------------------- */
  const resetGeoSelections = () => {
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');
    setSelectedWardCode('');
    setDistricts([]);
    setWards([]);
  };

  const resetAddressForm = () => {
    setAddrForm(emptyAddrForm);
    resetGeoSelections();
  };

  /* --------------------------------- Render --------------------------------- */
  return (
    <div className="relative">
      <div className="container mx-auto max-w-7xl px-4 py-8">

        {/* Title */}
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-700 to-amber-600 bg-clip-text text-transparent">
            {t('profile.title')}
          </h1>
          <p className="text-sm text-gray-600">
            {t('profile.subtitle')}
          </p>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
            <aside className="col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-3">
              <nav
                className="sticky top-24 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl ring-1 ring-gray-100 p-0 overflow-visible"
                role="tablist"
                aria-label={t('profile.tabs.nav_label')}
              >
                {/* inner padding giữ khoảng cách, tabs sẽ chiếm 100% vùng này */}
                <div className="p-3 space-y-2">
                  <TabButton
                    id="tab-profile"
                    aria-controls="panel-profile"
                    role="tab"
                    active={active === 'profile'}
                    onClick={() => setActive('profile')}
                    icon={UserCircleIcon}
                  >
                    {t('profile.tabs.profile', 'Hồ sơ')}
                  </TabButton>

                  <TabButton
                    id="tab-requests"
                    aria-controls="panel-requests"
                    role="tab"
                    active={active === 'service_requests'}
                    onClick={() => setActive('service_requests')}
                    icon={ClipboardIcon}
                  >
                    {t('profile.tabs.service_requests', 'Yêu cầu dịch vụ')}
                  </TabButton>
                </div>
              </nav>
            </aside>


          {/* Main */}
          <main className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
            {active === 'profile' && (
              <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" className="space-y-6">
                {/* Profile form */}
                <SectionCard as="form" onSubmit={onSave} ariaBusy={saving}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-200 to-amber-100 text-orange-700 flex items-center justify-center font-semibold shadow-inner">
                      {avatarChar}
                    </div>
                    <div>
                      <div className="font-semibold leading-tight text-gray-900">
                        {form.fullName || t('profile.form.full_name', 'Họ và tên')}
                      </div>
                      <div className="text-sm text-gray-500">{form.email || '—'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('profile.form.full_name', 'Họ và tên')}
                      name="fullName"
                      value={form.fullName}
                      onChange={onChange}
                      required
                    />
                    <Input
                      label={t('profile.form.phone', 'Số điện thoại')}
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={onChange}
                      inputMode="tel"
                    />
                    <Input
                      label={t('profile.form.email', 'Email')}
                      name="email"
                      type="email"
                      value={form.email}
                      disabled
                      readOnly
                      iconLock
                      title={t('profile.form.email_readonly', 'Email không thể thay đổi')}
                    />
                    <div>
                      <Label>{t('profile.form.gender', 'Giới tính')}</Label>
                      <div className="relative">
                        <select
                          name="gender"
                          className="w-full rounded-xl border border-gray-200 bg-white p-3 pr-9 text-gray-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 hover:border-gray-300"
                          value={form.gender ?? ''}
                          onChange={onChange}
                          aria-label={t('profile.form.gender', 'Giới tính')}
                        >
                          <option value="">{t('profile.gender.none', 'Không chọn')}</option>
                          <option value="0">{t('profile.gender.male', 'Nam')}</option>
                          <option value="1">{t('profile.gender.female', 'Nữ')}</option>
                          <option value="2">{t('profile.gender.other', 'Khác')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <Button type="submit" loading={saving}>
                      {saving ? t('profile.form.saving', 'Đang lưu...') : t('profile.form.save', 'Lưu thay đổi')}
                    </Button>
                  </div>
                </SectionCard>

                {/* Address block (merged) */}
                <SectionCard>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">{t('profile.addresses', 'Địa chỉ của bạn')}</h2>
                    <p className="text-sm text-gray-600">{t('address.subtitle', 'Quản lý & thêm địa chỉ nhận hàng')}</p>
                  </div>

                  {/* List */}
                  <div className="mb-6 space-y-3">
                    {addrLoading && (
                      <div className="space-y-2" role="status" aria-live="polite">
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                      </div>
                    )}

                    {!addrLoading && addrItems.length === 0 && (
                      <EmptyAddressHint t={t} />
                    )}

                    {!addrLoading &&
                      addrItems.map((it) => (
                        <AddressRow
                          key={it.id}
                          it={it}
                          onEdit={() => editAddrItem(it)}
                          onDelete={() => deleteAddrItem(it.id)}
                          t={t}
                        />
                      ))}
                  </div>

                  {/* Form */}
                  <form onSubmit={addrHandleSubmit} className="grid grid-cols-1 gap-4" aria-busy={addrSubmitting}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <SelectField
                        label={t('address.select.province', 'Tỉnh / Thành phố')}
                        value={selectedProvinceCode}
                        onChange={onProvinceChange}
                        options={provinces}
                      />

                      <SelectField
                        label={t('address.select.district', 'Quận / Huyện')}
                        value={selectedDistrictCode}
                        onChange={onDistrictChange}
                        options={districts}
                        disabled={!selectedProvinceCode}
                      />

                      <SelectField
                        label={t('address.select.ward', 'Phường / Xã')}
                        value={selectedWardCode}
                        onChange={onWardChange}
                        options={wards}
                        disabled={!selectedDistrictCode}
                      />
                    </div>

                    {/* hidden fields giữ nguyên logic */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="hidden" name="city" value={addrForm.city} onChange={addrHandleChange} required />
                      <input type="hidden" name="district" value={addrForm.district} onChange={addrHandleChange} required />
                      <input type="hidden" name="ward" value={addrForm.ward} onChange={addrHandleChange} required />
                    </div>

                    {/* Detail */}
                    <div>
                      <Label>{t('address.detail_placeholder', 'Địa chỉ chi tiết (số nhà, đường,...)')}</Label>
                      <input
                        name="detail"
                        value={addrForm.detail}
                        onChange={addrHandleChange}
                        placeholder={t('address.detail_placeholder', 'Địa chỉ chi tiết (số nhà, đường,...)')}
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition placeholder:text-gray-400 hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
                        required
                        aria-describedby="addr-preview"
                      />
                      {addrPreview && (
                        <FieldHint>
                          <span id="addr-preview">
                            {t('address.preview_label', 'Xem trước')}: <span className="text-gray-900">{addrPreview}</span>
                          </span>
                        </FieldHint>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 justify-end">
                      <Button type="submit" loading={addrSubmitting}>
                        {addrSubmitting
                          ? t('address.saving', 'Đang lưu...')
                          : addrForm.id
                          ? t('address.update_button', 'Cập nhật địa chỉ')
                          : t('address.add_button', 'Thêm địa chỉ')}
                      </Button>

                      {addrForm.id && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={resetAddressForm}
                        >
                          {t('address.cancel', 'Huỷ chỉnh sửa')}
                        </Button>
                      )}
                    </div>
                  </form>
                </SectionCard>
              </div>
            )}

            {active === 'service_requests' && (
              <SectionCard>
                <div role="tabpanel" id="panel-requests" aria-labelledby="tab-requests">
                  <h2 className="text-xl font-semibold mb-4">{t('profile.service_requests.title', 'Yêu cầu dịch vụ')}</h2>
                  <p className="text-gray-700">{t('profile.service_requests.placeholder', 'Tính năng đang được phát triển.')}</p>
                </div>
              </SectionCard>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Atoms                                    */
/* -------------------------------------------------------------------------- */
function SectionCard({ as, children, onSubmit, ariaBusy }) {
  // Fix ESLint no-unused-vars by aliasing tag locally
  const Tag = as || 'section';
  return (
    <Tag
      onSubmit={onSubmit}
      aria-busy={ariaBusy || undefined}
      className="relative p-6 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl ring-1 ring-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-orange-200"
    >
      {/* Side glows instead of bottom shadow */}
      <div aria-hidden className="pointer-events-none absolute inset-y-4 -left-6 w-12 rounded-full bg-gradient-to-r from-gray-300/40 to-transparent blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute inset-y-4 -right-6 w-12 rounded-full bg-gradient-to-l from-gray-300/40 to-transparent blur-2xl" />
      {children}
    </Tag>
  );
}

function Button({ children, variant = 'primary', loading = false, ...rest }) {
  const base =
    'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition disabled:opacity-60 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-300';
  const styles =
    variant === 'secondary'
      ? 'border border-gray-200 bg-white/80 hover:bg-gray-50 ring-1 ring-inset ring-white/60'
      : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:brightness-105 active:brightness-95 ring-1 ring-orange-500/20';
  return (
    <button {...rest} className={`${base} ${styles}`} disabled={loading || rest.disabled}>
      {loading && <Spinner className="h-4 w-4" />}
      <span>{children}</span>
    </button>
  );
}

function SelectField({ label, value, onChange, options, disabled }) {
  const { t } = useTranslation();
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <select
          className="w-full rounded-xl border border-gray-200 bg-white p-3 pr-8 text-gray-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 hover:border-gray-300 disabled:opacity-60"
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          <option value="">{t('address.select.choose', '— Chọn —')}</option>
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block text-sm font-medium mb-1 text-gray-800">
      <span className="inline-flex items-center gap-1">
        {children}
      </span>
    </label>
  );
}

function FieldHint({ children }) {
  return <p className="mt-1.5 text-xs text-gray-500">{children}</p>;
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

function Input({ label, iconLock = false, disabled = false, readOnly = false, ...props }) {
  const readonlyLike = disabled || readOnly;
  return (
    <div>
      <Label>
        <span className="inline-flex items-center gap-1">
          {label}
          {readonlyLike && (
            <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600" title={props.title}>
              <LockIcon className="h-3 w-3" />
            </span>
          )}
        </span>
      </Label>
      <div className="relative">
        <input
          {...props}
          disabled={disabled}
          readOnly={readOnly}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          className={
            'w-full rounded-xl border p-3 shadow-sm transition placeholder:text-gray-400 ' +
            (readonlyLike
              ? 'bg-gray-50 text-gray-600 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200')
          }
        />
        {iconLock && readonlyLike && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
            <LockIcon className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, children, icon: Icon, ...rest }) {
  return (
    <button
      {...rest}
      aria-current={active ? 'page' : undefined}
      className={
        'group relative w-full text-left rounded-2xl border transition overflow-hidden ' +
        'flex items-center gap-3 px-5 py-4 min-h-[56px] ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 ' +
        (active
          ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-sm'
          : 'border-gray-200 hover:bg-gray-50')
      }
    >
      <span
        className={
          'absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl transition ' +
          (active ? 'bg-orange-500' : 'bg-transparent group-hover:bg-gray-200')
        }
        aria-hidden
      />
      {Icon && (
        <span
          className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center
                     rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-100"
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span className={'relative z-10 font-medium leading-6 ' + (active ? 'text-gray-900' : 'text-gray-700')}>
        {children}
      </span>
    </button>
  );
}


function AddressRow({ it, onEdit, onDelete, t }) {
  return (
    <div className="relative group border rounded-xl p-4 flex items-start justify-between bg-white/80 transition">
      {/* side glow */}
      <div aria-hidden className="pointer-events-none absolute inset-y-2 -left-3 w-8 bg-gradient-to-r from-orange-200/30 to-transparent blur-xl opacity-0 group-hover:opacity-100" />
      <div aria-hidden className="pointer-events-none absolute inset-y-2 -right-3 w-8 bg-gradient-to-l from-orange-200/30 to-transparent blur-xl opacity-0 group-hover:opacity-100" />
      <div className="flex items-start gap-3">
        <div className="mt-1 h-9 w-9 shrink-0 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center" aria-hidden>
          <MapPinIcon className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900 break-words max-w-[60ch]">{it.detail}</div>
          <div className="text-sm text-gray-500">
            {it.ward}, {it.district}, {it.city}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 text-orange-700 bg-orange-50/50 hover:bg-orange-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
        >
          <PencilIcon className="h-4 w-4" aria-hidden />
          <span className="text-sm font-medium">{t('address.edit', 'Sửa')}</span>
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
        >
          <TrashIcon className="h-4 w-4" aria-hidden />
          <span className="text-sm font-medium">{t('address.delete', 'Xoá')}</span>
        </button>
      </div>
    </div>
  );
}

function EmptyAddressHint({ t }) {
  return (
    <div className="relative rounded-xl border border-dashed border-gray-300 bg-white/80 p-6 text-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-y-3 -left-6 w-12 rounded-full bg-gradient-to-r from-gray-300/30 to-transparent blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute inset-y-3 -right-6 w-12 rounded-full bg-gradient-to-l from-gray-300/30 to-transparent blur-2xl" />
      <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center" aria-hidden>
        <MapPinIcon className="h-5 w-5 text-orange-600" />
      </div>
      <div className="font-medium">{t('address.empty', 'Chưa có địa chỉ')}</div>
      <div className="text-sm text-gray-500">{t('address.empty_hint', 'Hãy thêm địa chỉ mới bên dưới.')}</div>
    </div>
  );
}

/* -------------------------------- Icons (SVG) ------------------------------- */
function LockIcon({ className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm3 8H9V7a3 3 0 116 0v3z"/>
    </svg>
  );
}
function ArrowLeftIcon({ className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4A1 1 0 0110 6v2h6a1 1 0 110 2h-6v2a1 1 0 01-.293.707z" clipRule="evenodd" />
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
function UserCircleIcon({ className = 'h-5 w-5', strokeWidth = 1.75 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M8 17c1.6-1.2 3.2-1.8 4-1.8s2.4.6 4 1.8" />
    </svg>
  );
}

function ClipboardIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 2h6a2 2 0 012 2v1h1a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h1V4a2 2 0 012-2zm0 3V4h6v1H9z" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-y-2 -left-3 w-8 bg-gradient-to-r from-gray-300/30 to-transparent blur-xl" />
      <div aria-hidden className="pointer-events-none absolute inset-y-2 -right-3 w-8 bg-gradient-to-l from-gray-300/30 to-transparent blur-xl" />
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

/** Chuẩn hoá tên địa lý để match ổn định hơn */
function normalize(s) {
  const base = (s || '').normalize('NFD');
  // Safari fallback for \p{Diacritic}
  const noDiacritics = (base.replace(/[\u0300-\u036f]/g, '') || base)
    .toLowerCase();

  return noDiacritics
    .replace(/\b(thanh pho thuoc tinh|thanh pho|tinh|quan|huyen|thi xa|thi tran|phuong|xa)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
