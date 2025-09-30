import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const partnerTypes = [
  { type: 'Distributor', icon: 'fa-store', color: 'blue',  title: 'partner.distributor',  desc: 'partner.distributor_desc' },
  { type: 'Contractor',  icon: 'fa-tools', color: 'green', title: 'partner.contractor',   desc: 'partner.contractor_desc' }
];

export default function PartnerTypeSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  const canContinue = Boolean(selectedType);

  const handleSelect = useCallback(type => setSelectedType(type), []);
  const handleContinue = useCallback(() => {
    if (selectedType) navigate(`/PartnerRegistration?type=${selectedType}`);
  }, [selectedType, navigate]);
  const goHome  = useCallback(() => navigate('/'),      [navigate]);
  const goLogin = useCallback(() => navigate('/Login'), [navigate]);

  const onKeySelect = useCallback((e, type) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedType(type);
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'url(https://res.cloudinary.com/dl4idg6ey/image/upload/v1749267431/loginBg_q3gjez.png) center/cover no-repeat' }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex overflow-hidden">
        {/* Banner left */}
        <button
          type="button"
          onClick={goHome}
          aria-label={t('common.home', 'Go home')}
          className="hidden md:flex md:w-1/2 items-center justify-center p-8 focus:ring-2 focus:ring-blue-500"
        >
          <img
            src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749217489/loginBanner_vsrezl.png"
            alt="HomeCareDN Banner"
            className="max-w-full h-auto transform hover:scale-105 transition"
          />
        </button>

        {/* Selection right */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center">
          <div className="max-w-sm w-full mx-auto">
            {/* Mobile banner */}
            <button
              type="button"
              onClick={goHome}
              aria-label={t('common.home', 'Go home')}
              className="md:hidden mb-8 focus:ring-2 focus:ring-blue-500"
            >
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749217489/loginBanner_vsrezl.png"
                alt="HomeCareDN Banner"
                className="max-w-full h-auto transform hover:scale-105 transition"
              />
            </button>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t('partner.choose_partner_type')}
              </h1>
              <p className="text-gray-600">{t('partner.select_type_description')}</p>
            </div>

            <fieldset className="space-y-4 mb-8">
              <legend className="sr-only">{t('partner.choose_partner_type')}</legend>
              {partnerTypes.map(pt => (
                <button
                  key={pt.type}
                  type="button"
                  onClick={() => handleSelect(pt.type)}
                  onKeyDown={e => onKeySelect(e, pt.type)}
                  aria-pressed={selectedType === pt.type}
                  aria-describedby={`${pt.type}-desc`}
                  className={`w-full flex items-center p-4 border-2 rounded-lg transition focus:ring-2 focus:ring-blue-500 ${
                    selectedType === pt.type
                      ? `border-${pt.color}-500 bg-${pt.color}-50`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 mr-4 flex-shrink-0 rounded-full border-2 ${
                      selectedType === pt.type
                        ? `border-${pt.color}-500 bg-${pt.color}-500`
                        : 'border-gray-300'
                    } flex items-center justify-center`}
                    aria-hidden="true"
                  >
                    {selectedType === pt.type && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div
                    className={`w-12 h-12 mr-4 flex-shrink-0 rounded-full flex items-center justify-center ${
                      selectedType === pt.type ? `bg-${pt.color}-100` : 'bg-gray-100'
                    }`}
                    aria-hidden="true"
                  >
                    <i
                      className={`fas ${pt.icon} text-lg ${
                        selectedType === pt.type ? `text-${pt.color}-600` : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-800 mb-1">{t(pt.title)}</h3>
                    <p id={`${pt.type}-desc`} className="text-sm text-gray-600">
                      {t(pt.desc)}
                    </p>
                  </div>
                  <span className="sr-only">
                    {selectedType === pt.type
                      ? t('common.selected', 'Selected')
                      : t('common.not_selected', 'Not selected')}
                  </span>
                </button>
              ))}
            </fieldset>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              aria-describedby={canContinue ? undefined : 'continue-help'}
              className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition focus:ring-2 focus:ring-offset-2 ${
                canContinue
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-300'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300'
              }`}
            >
              {canContinue ? (
                <>
                  <i className="fas fa-arrow-right mr-2" aria-hidden="true" />
                  {t('partner.continue_as')} {t(`partner.${selectedType.toLowerCase()}`)}
                </>
              ) : (
                <>
                  <span>{t('partner.select_type_first')}</span>
                  <span id="continue-help" className="sr-only">
                    {t('partner.select_type_help', 'Please select a partner type above to continue')}
                  </span>
                </>
              )}
            </button>

            <div className="relative my-6">
              <hr className="border-gray-300" aria-label={t('common.or', 'Or')} />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500 pointer-events-none">
                {t('common.or')}
              </span>
            </div>

            <div className="text-center">
              <span className="text-gray-600">{t('partner.already_have_account')}</span>
              <button
                type="button"
                onClick={goLogin}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium focus:ring-2 focus:ring-blue-500"
              >
                {t('header.login')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
