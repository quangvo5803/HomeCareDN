import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PartnerTypeSelection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');

  const partnerTypes = [
    {
      type: 'Distributor',
      icon: 'fa-store',
      color: 'blue',
      title: 'partner.distributor',
      desc: 'partner.distributor_desc'
    },
    {
      type: 'Contractor',
      icon: 'fa-tools',
      color: 'green',
      title: 'partner.contractor',
      desc: 'partner.contractor_desc'
    }
  ];

  const handleContinue = useCallback(() => {
    if (selectedType) {
      navigate(`/PartnerRegistration?type=${selectedType}`);
    }
  }, [selectedType, navigate]);

  const handleNavigateHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleNavigateLogin = useCallback(() => {
    navigate('/Login');
  }, [navigate]);

  // Handler for partner type selection
  const handlePartnerTypeSelect = useCallback((partnerType) => {
    setSelectedType(partnerType);
  }, []);

  // Keyboard handler for partner type selection
  const handlePartnerTypeKeyDown = useCallback((e, partnerType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedType(partnerType);
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dl4idg6ey/image/upload/v1749267431/loginBg_q3gjez.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Main Container - giống Login */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex relative z-10">
        {/* Left Side - Banner Image (giống Login) */}
        <button
          type="button"
          className="hidden md:flex md:w-1/2 bg-white items-center justify-center p-8 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          onClick={handleNavigateHome}
          aria-label={t('common.home', 'Go to home')}
        >
          <img
            src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749217489/loginBanner_vsrezl.png"
            alt="HomeCareDN Banner"
            className="max-w-full h-auto object-contain transition-transform duration-300 transform hover:scale-105"
          />
        </button>

        {/* Right Side - Partner Type Selection Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center">
          <div className="max-w-sm mx-auto w-full">
            {/* Mobile Banner */}
            <button
              type="button"
              className="md:hidden text-center mb-8 cursor-pointer p-0 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              onClick={handleNavigateHome}
              aria-label={t('common.home', 'Go to home')}
            >
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749217489/loginBanner_vsrezl.png"
                alt="HomeCareDN Banner"
                className="max-w-full h-auto object-contain transition-transform duration-300 transform hover:scale-105"
              />
            </button>

            {/* Title and Subtitle */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t('partner.choose_partner_type')}
              </h1>
              <p className="text-gray-600">{t('partner.select_type_description')}</p>
            </div>

            {/* Partner Type Options */}
            <fieldset className="space-y-4 mb-8">
              <legend className="sr-only">
                {t('partner.choose_partner_type', 'Choose partner type')}
              </legend>
              {partnerTypes.map((partner) => (
                <button
                  key={partner.type}
                  type="button"
                  className={`w-full relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 text-left focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selectedType === partner.type
                      ? `border-${partner.color}-500 bg-${partner.color}-50`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handlePartnerTypeSelect(partner.type)}
                  onKeyDown={(e) => handlePartnerTypeKeyDown(e, partner.type)}
                  aria-pressed={selectedType === partner.type}
                  aria-describedby={`${partner.type}-description`}
                >
                  <div className="flex items-center">
                    {/* Radio Button Visual */}
                    <div 
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        selectedType === partner.type
                          ? `border-${partner.color}-500 bg-${partner.color}-500`
                          : 'border-gray-300'
                      }`}
                      aria-hidden="true"
                    >
                      {selectedType === partner.type && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    
                    {/* Icon */}
                    <div 
                      className={`flex-shrink-0 w-12 h-12 rounded-full mr-4 flex items-center justify-center ${
                        selectedType === partner.type
                          ? `bg-${partner.color}-100`
                          : 'bg-gray-100'
                      }`}
                      aria-hidden="true"
                    >
                      <i className={`fas ${partner.icon} text-lg ${
                        selectedType === partner.type
                          ? `text-${partner.color}-600`
                          : 'text-gray-600'
                      }`} aria-hidden="true"></i>
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {t(partner.title)}
                      </h3>
                      <p id={`${partner.type}-description`} className="text-sm text-gray-600">
                        {t(partner.desc)}
                      </p>
                    </div>
                  </div>

                  {/* Screen reader only selection status */}
                  <span className="sr-only">
                    {selectedType === partner.type 
                      ? t('common.selected', 'Selected')
                      : t('common.not_selected', 'Not selected')
                    }
                  </span>
                </button>
              ))}
            </fieldset>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedType}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                selectedType
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-300'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300'
              }`}
              aria-describedby={selectedType ? undefined : "continue-help"}
            >
              {selectedType ? (
                <>
                  <i className="fas fa-arrow-right mr-2" aria-hidden="true"></i>
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

            {/* Divider */}
            <div className="flex items-center my-6" role="separator" aria-label={t('common.or', 'Or')}>
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500 bg-white" aria-hidden="true">
                {t('common.or')}
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Back to Login Link */}
            <div className="text-center">
              <span className="text-gray-600">
                {t('partner.already_have_account')}
              </span>
              <button
                type="button"
                onClick={handleNavigateLogin}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200 ml-1 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                {t('header.login')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerTypeSelection;
