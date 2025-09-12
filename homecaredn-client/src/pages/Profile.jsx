import { useEffect, useState } from 'react';
import { useAuth } from '../hook/useAuth';
import AddressManager from '../components/AddressManager';
import { profileService } from '../services/profileService';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // NEW

export default function ProfilePage() {
  const { reload } = useAuth();
  const navigate = useNavigate(); // NEW
  const [active, setActive] = useState('profile'); // 'profile' | 'partner'
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', gender: null });
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation(); // không namespace
  const backLabel = t('common.back', 'Quay lại'); 

  useEffect(() => {
    (async () => {
      try {
        const { data } = await profileService.getMine();
        setForm({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender ?? null,
        });
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      }
    })();
  }, []);

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

      toast.success(t('profile.update_success'));
    } catch (err) {
      const data = err?.response?.data;
      const firstError =
        (data?.errors && Object.values(data.errors)[0]?.[0]) ||
        data?.title ||
        data?.message ||
        t('profile.update_error');
      toast.error(firstError);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-4">
        <BackButton onClick={handleBack} label={backLabel} />
      </div>

      {/* Layout grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="space-y-2 sticky top-24">
            <button
              className={`w-full text-left p-3 rounded-xl border ${active === 'profile' ? 'bg-gray-100' : ''}`}
              onClick={() => setActive('profile')}
            >
              {t('profile.tabs.profile')}
            </button>
            <button
              className={`w-full text-left p-3 rounded-xl border ${active === 'partner' ? 'bg-gray-100' : ''}`}
              onClick={() => setActive('partner')}
            >
              {t('profile.tabs.partner')}
            </button>
          </div>
        </aside>

        {/* Right column */}
        <main className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
          {active === 'profile' && (
            <>
              {/* Profile form */}
              <form onSubmit={onSave} className="p-6 rounded-2xl border shadow-sm bg-white/80">
                <h2 className="text-xl font-semibold mb-4">{t('profile.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('profile.form.full_name')}
                    name="fullName"
                    value={form.fullName}
                    onChange={onChange}
                    required
                  />
                  <Input
                    label={t('profile.form.phone')}
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={onChange}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('profile.form.gender')}</label>
                    <select
                      name="gender"
                      className="w-full border rounded-xl p-3"
                      value={form.gender ?? ''}
                      onChange={onChange}
                      aria-label={t('profile.form.gender')}
                    >
                      <option value="">{t('profile.gender.none')}</option>
                      <option value="0">{t('profile.gender.male')}</option>
                      <option value="1">{t('profile.gender.female')}</option>
                      <option value="2">{t('profile.gender.other')}</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl border">
                    {saving ? t('profile.form.saving') : t('profile.form.save')}
                  </button>
                </div>
              </form>

              {/* Addresses */}
              <AddressManager />
            </>
          )}

          {active === 'partner' && (
            <div className="p-6 rounded-2xl border shadow-sm bg-white/80">
              <h2 className="text-xl font-semibold mb-4">{t('profile.partner.title')}</h2>
              <p>{t('profile.partner.placeholder')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
        aria-label={label}
      />
    </div>
  );
}

function BackButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50"
      aria-label={label}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4A1 1 0 0110 6v2h6a1 1 0 110 2h-6v2a1 1 0 01-.293.707z" clipRule="evenodd" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
