import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hook/useAuth';
import { profileService } from '../../services/profileService';
import { addressService } from '../../services/addressService';
import { geoService } from '../../services/geoService';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { handleApiError } from '../../utils/handleApiError';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import Loading from '../../components/Loading';

const emptyAddrForm = {
  id: null,
  city: '',
  district: '',
  ward: '',
  detail: '',
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  // Tabs
  const [active, setActive] = useState('profile');

  // Profile form
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    gender: null,
    email: '',
  });
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
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');

  /* --------------------------------- Loaders -------------------------------- */
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await profileService.getProfile(user.id);
        setForm({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender ?? null,
          email: data.email || data.userName || '',
        });
      } catch (error) {
        handleApiError(error, t('ERROR.LOAD_ERROR'));
      }
    })();
  }, [user?.id, t]);

  const loadAddresses = useCallback(async () => {
    if (!user?.id) return;
    setAddrLoading(true);
    try {
      const { data } = await addressService.getUserAddress(user.id);
      setAddrItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(handleApiError(err, t('ERROR.LOAD_ERROR')));
    } finally {
      setAddrLoading(false);
    }
  }, [t, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await geoService.getProvinces(1);
        setProvinces(Array.isArray(data) ? data : []);
      } catch {
        setProvinces([]);
      }
      await loadAddresses();
    })();
  }, [authLoading, user?.id, loadAddresses]);

  /* ------------------------------- Profile save ------------------------------ */
  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await profileService.updateProfile({
        userId: user.id,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber || null,
        gender: form.gender === '' ? null : Number(form.gender),
      });
      toast.success(t('SUCCESS.PROFILE_UPDATE'));
    } catch (err) {
      toast.error(handleApiError(err, t('ERROR.UPDATE_ERROR')));
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------- Address CRUD ------------------------------ */
  const isEditingAddr = Boolean(addrForm.id);

  let addrSubmitText;
  if (addrSubmitting) {
    addrSubmitText = t('BUTTON.Saving');
  } else if (isEditingAddr) {
    addrSubmitText = t('BUTTON.Save');
  } else {
    addrSubmitText = t('BUTTON.AddAddress');
  }

  const addrHandleSubmit = async (e) => {
    e.preventDefault();
    if (addrSubmitting) return;
    setAddrSubmitting(true);

    const payload = {
      UserId: user.id,
      AddressId: addrForm.id,
      city: addrForm.city.trim(),
      district: addrForm.district.trim(),
      ward: addrForm.ward.trim(),
      detail: addrForm.detail.trim(),
    };

    try {
      if (addrForm.id) {
        await addressService.updateAddress(payload);
        toast.success(t('SUCCESS.ADDRESS_UPDATE'));
      } else {
        await addressService.createAddress(payload);
        toast.success(t('SUCCESS.ADDRESS_ADD'));
      }

      resetAddressForm();
      await loadAddresses();
    } catch (err) {
      toast.error(handleApiError(err, t('ERROR.SUBMIT_ERROR')));
    } finally {
      setAddrSubmitting(false);
    }
  };

  const editAddrItem = async (it) => {
    setAddrForm({
      id: it.addressId,
      city: it.city,
      district: it.district,
      ward: it.ward,
      detail: it.detail,
    });

    try {
      let provs = provinces;
      if (!provs?.length) {
        const { data } = await geoService.getProvinces(1);
        provs = Array.isArray(data) ? data : [];
        setProvinces(provs);
      }

      const provinceMatch = provs.find(
        (p) => normalize(p.name) === normalize(it.city)
      );
      if (provinceMatch?.code) {
        const provCode = String(provinceMatch.code);
        setSelectedProvinceCode(provCode);

        const { data: provObj } = await geoService.getDistrictsByProvince(
          provinceMatch.code
        );
        const ds = provObj?.districts || [];
        setDistricts(ds);

        const districtMatch = ds.find(
          (d) => normalize(d.name) === normalize(it.district)
        );
        if (districtMatch?.code) {
          const distCode = String(districtMatch.code);
          setSelectedDistrictCode(distCode);

          const { data: distObj } = await geoService.getWardsByDistrict(
            districtMatch.code
          );
          const ws = distObj?.wards || [];
          setWards(ws);

          const wardMatch = ws.find(
            (w) => normalize(w.name) === normalize(it.ward)
          );
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
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteAddressModal.title',
      textKey: 'ModalPopup.DeleteAddressModal.text',
      onConfirm: async () => {
        await addressService.removeAddress(id);
        await loadAddresses();

        toast.success(t('SUCCESS.DELETE'));
      },
    });
  };

  /* --------------------------- Geo change handlers --------------------------- */
  const handleGeoChange = async (level, e) => {
    const code = e.target.value;

    if (level === 'province') {
      setSelectedProvinceCode(code);
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setDistricts([]);
      setWards([]);
      setAddrForm((s) => ({ ...s, city: '', district: '', ward: '' }));

      if (!code) return;
      try {
        const { data: province } = await geoService.getDistrictsByProvince(
          Number(code)
        );
        const ds = province?.districts || [];
        setDistricts(ds);
        setAddrForm((s) => ({ ...s, city: province?.name || '' }));
      } catch {
        setDistricts([]);
      }
    }

    if (level === 'district') {
      setSelectedDistrictCode(code);
      setSelectedWardCode('');
      setWards([]);
      setAddrForm((s) => ({ ...s, district: '', ward: '' }));

      if (!code) return;
      try {
        const { data: district } = await geoService.getWardsByDistrict(
          Number(code)
        );
        const ws = district?.wards || [];
        setWards(ws);
        setAddrForm((s) => ({ ...s, district: district?.name || '' }));
      } catch {
        setWards([]);
      }
    }

    if (level === 'ward') {
      setSelectedWardCode(code);
      const w = wards.find((x) => String(x.code) === code);
      setAddrForm((s) => ({ ...s, ward: w?.name || '' }));
    }
  };

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

  const avatarChar = (
    form.fullName?.trim()?.[0] ||
    form.email?.trim()?.[0] ||
    '?'
  ).toUpperCase();
  const addrPreview = [
    addrForm.detail,
    addrForm.ward,
    addrForm.district,
    addrForm.city,
  ]
    .filter(Boolean)
    .join(', ');
  if (authLoading || addrLoading) return <Loading />;
  /* --------------------------------- Render --------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="max-w-6xl mx-auto p-4 mt-5">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {active === 'profile'
              ? t('userPage.profile.title')
              : t('userPage.service_request.title')}
          </h1>
          <p className="text-gray-600">
            {active === 'profile'
              ? t('userPage.profile.subtitle')
              : t('userPage.service_request.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Navigation - Left Column */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActive('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-3 ${
                    active === 'profile'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <i className="fas fa-user"></i>
                  {t('userPage.profile.title')}
                </button>
                <button
                  onClick={() => setActive('service_requests')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-3 ${
                    active === 'service_requests'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <i className="fas fa-clipboard-list"></i>
                  {t('userPage.service_request.title')}
                </button>
              </nav>
            </div>
          </div>

          {/* Content - Right Column */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-md p-6">
              {active === 'profile' && (
                <div className="space-y-8">
                  {/* Profile Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <i className="fas fa-user-circle text-orange-600 text-xl"></i>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {t('userPage.profile.header_profile')}
                      </h2>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-6 p-4 bg-orange-50 rounded-lg">
                      <div className="h-16 w-16 rounded-full bg-orange-600 text-white flex items-center justify-center text-xl font-semibold">
                        {avatarChar}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {form.fullName || 'Chưa có tên'}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {form.email}
                        </div>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={onSave} className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          <i className="fas fa-id-card mr-2"></i>
                          {t('userPage.profile.form.name')}
                        </label>
                        <input
                          name="fullName"
                          value={form.fullName}
                          onChange={onChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          <i className="fas fa-phone mr-2"></i>
                          {t('userPage.profile.form.phone')}
                        </label>
                        <input
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={onChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          <i className="fas fa-envelope mr-2"></i>
                          {t('userPage.profile.form.email')}
                        </label>
                        <input
                          name="email"
                          value={form.email}
                          disabled
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          <i className="fas fa-venus-mars mr-2"></i>
                          {t('userPage.profile.form.gender')}
                        </label>
                        <select
                          name="gender"
                          value={form.gender ?? ''}
                          onChange={onChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">
                            {t('userPage.profile.form.gender_choice')}
                          </option>
                          <option value="0">
                            {t('userPage.profile.form.gender_male')}
                          </option>
                          <option value="1">
                            {t('userPage.profile.form.gender_female')}
                          </option>
                          <option value="2">
                            {t('userPage.profile.form.gender_other')}
                          </option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="ml-auto bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                        >
                          <i className="fas fa-save"></i>
                          {saving
                            ? t('BUTTON.Saving')
                            : t('BUTTON.SaveProfile')}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Address Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <i className="fas fa-map-marker-alt text-orange-600 text-xl"></i>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {t('userPage.profile.header_address')}
                      </h2>
                    </div>

                    {/* Address List */}
                    <div className="mb-6">
                      {!addrLoading && addrItems.length === 0 && (
                        <div className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                          <i className="fas fa-map-marker-alt text-3xl mb-2"></i>
                          <div>{t('userPage.profile.noAddress')}</div>
                        </div>
                      )}

                      {!addrLoading &&
                        addrItems.map((it) => (
                          <div
                            key={it.addressId}
                            className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <i className="fas fa-home text-orange-600 mt-1"></i>
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {it.detail}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {it.ward}, {it.district}, {it.city}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => editAddrItem(it)}
                                  className="text-orange-600 hover:text-orange-700 px-2 py-1 rounded hover:bg-orange-50 transition-colors duration-200"
                                >
                                  <i className="fas fa-edit mr-1"></i>
                                  {t('BUTTON.Edit')}
                                </button>
                                <button
                                  onClick={() => deleteAddrItem(it.addressId)}
                                  className="text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors duration-200"
                                >
                                  <i className="fas fa-trash mr-1"></i>
                                  {t('BUTTON.Delete')}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Address Form */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium mb-4 text-gray-800">
                        <i className="fas fa-plus mr-2"></i>
                        {isEditingAddr
                          ? t('userPage.profile.editAddress')
                          : t('userPage.profile.addAddress')}
                      </h3>
                      <form onSubmit={addrHandleSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                              {t('userPage.profile.provice')}
                            </label>
                            <select
                              value={selectedProvinceCode}
                              onChange={(e) => handleGeoChange('province', e)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="">
                                {t('userPage.profile.provicePlaceholder')}
                              </option>
                              {provinces.map((p) => (
                                <option key={p.code} value={p.code}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                              {t('userPage.profile.district')}
                            </label>
                            <select
                              value={selectedDistrictCode}
                              onChange={(e) => handleGeoChange('district', e)}
                              disabled={!selectedProvinceCode}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="">
                                {' '}
                                {t('userPage.profile.districtPlaceholder')}
                              </option>
                              {districts.map((d) => (
                                <option key={d.code} value={d.code}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                              {t('userPage.profile.ward')}
                            </label>
                            <select
                              value={selectedWardCode}
                              onChange={(e) => handleGeoChange('ward', e)}
                              disabled={!selectedDistrictCode}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="">
                                {' '}
                                {t('userPage.profile.wardPlaceholder')}
                              </option>
                              {wards.map((w) => (
                                <option key={w.code} value={w.code}>
                                  {w.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Hidden fields */}
                        <input
                          type="hidden"
                          name="city"
                          value={addrForm.city}
                        />
                        <input
                          type="hidden"
                          name="district"
                          value={addrForm.district}
                        />
                        <input
                          type="hidden"
                          name="ward"
                          value={addrForm.ward}
                        />

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            {t('userPage.profile.addressDetail')}
                          </label>
                          <input
                            name="detail"
                            value={addrForm.detail}
                            onChange={(e) =>
                              setAddrForm((s) => ({
                                ...s,
                                [e.target.name]: e.target.value,
                              }))
                            }
                            placeholder="Số nhà, tên đường..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            required
                          />
                          {addrPreview && (
                            <div className="text-xs text-gray-500 mt-2 p-2 bg-white rounded border-l-4 border-orange-500">
                              <i className="fas fa-eye mr-2"></i>
                              {t('userPage.profile.preview')} {addrPreview}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={addrSubmitting}
                            className="ml-auto bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                          >
                            <i
                              className={`fas ${
                                isEditingAddr ? 'fa-save' : 'fa-plus'
                              }`}
                            ></i>
                            {addrSubmitText}
                          </button>
                          {isEditingAddr && (
                            <button
                              type="button"
                              onClick={resetAddressForm}
                              disabled={addrSubmitting}
                              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                            >
                              <i className="fas fa-times"></i>
                              {t('BUTTON.Cancel')}
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {active === 'service_requests' && (
                <div className="text-center py-12">
                  <i className="fas fa-tools text-6xl text-gray-300 mb-4"></i>
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    {t('userPage.service_request.noRequest')}
                  </h2>
                  <p className="text-gray-600">
                    {t('userPage.service_request.letStart')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Chuẩn hoá tên địa lý để match ổn định hơn */
function normalize(s) {
  const base = (s || '').normalize('NFD');
  const noDiacritics = (
    base.replace(/[\u0300-\u036f]/g, '') || base
  ).toLowerCase();

  return noDiacritics
    .replace(
      /\b(thanh pho thuoc tinh|thanh pho|tinh|quan|huyen|thi xa|thi tran|phuong|xa)\b/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}
