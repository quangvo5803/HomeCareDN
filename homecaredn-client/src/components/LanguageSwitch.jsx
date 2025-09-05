import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from 'react-country-flag';

export default function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = (i18n.language || 'en').startsWith('vi') ? 'vi' : 'en';
  const flagCode = current === 'vi' ? 'VN' : 'US';
  const label = current.toUpperCase();

  const setLang = (lng) => {
    if (i18n.language !== lng) i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 px-3 rounded-full border border-gray-300 hover:border-blue-500 hover:bg-gray-50 transition-all"
        title={t('partnerDashboard.change_language')}
      >
        <ReactCountryFlag countryCode={flagCode} svg className="text-lg" />
        <span className="text-sm font-medium hidden md:inline">{label}</span>
        <i
          className={`fas fa-chevron-down text-xs ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border p-2 space-y-1 z-20">
          <button
            onClick={() => setLang('en')}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
          >
            <ReactCountryFlag countryCode="US" svg className="text-lg" />
            <span>English</span>
          </button>
          <button
            onClick={() => setLang('vi')}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
          >
            <ReactCountryFlag countryCode="VN" svg className="text-lg" />
            <span>Tiếng Việt</span>
          </button>
        </div>
      )}
    </div>
  );
}
