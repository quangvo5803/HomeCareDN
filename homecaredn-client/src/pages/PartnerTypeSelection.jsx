import { useState } from 'react';
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

  const handleContinue = () => {
    if (selectedType) {
      navigate(`/PartnerRegistration?type=${selectedType}`);
    }
  };

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
          className="hidden md:flex md:w-1/2 bg-white items-center justify-center p-8 cursor-pointer"
          onClick={() => navigate('/')}
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
              className="md:hidden text-center mb-8 cursor-pointer p-0 border-0 bg-transparent"
              onClick={() => navigate('/')}
            >
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749217489/loginBanner_vsrezl.png"
                alt="HomeCareDN Banner"
                className="max-w-full h-auto object-contain transition-transform duration-300 transform hover:scale-105"
              />
            </button>

            {/* Title and Subtitle */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {t('partner.choose_partner_type')}
              </h2>
              <p className="text-gray-600">{t('partner.select_type_description')}</p>
            </div>

            {/* Partner Type Options */}
            <div className="space-y-4 mb-8">
              {partnerTypes.map((partner) => (
                <div
                  key={partner.type}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                    selectedType === partner.type
                      ? `border-${partner.color}-500 bg-${partner.color}-50`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedType(partner.type)}
                >
                  <div className="flex items-center">
                    {/* Radio Button */}
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedType === partner.type
                        ? `border-${partner.color}-500 bg-${partner.color}-500`
                        : 'border-gray-300'
                    }`}>
                      {selectedType === partner.type && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full mr-4 flex items-center justify-center ${
                      selectedType === partner.type
                        ? `bg-${partner.color}-100`
                        : 'bg-gray-100'
                    }`}>
                      <i className={`fas ${partner.icon} text-lg ${
                        selectedType === partner.type
                          ? `text-${partner.color}-600`
                          : 'text-gray-600'
                      }`}></i>
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {t(partner.title)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t(partner.desc)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedType}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                selectedType
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedType ? (
                <>
                  <i className="fas fa-arrow-right mr-2"></i>
                  {t('partner.continue_as')} {t(`partner.${selectedType.toLowerCase()}`)}
                </>
              ) : (
                t('partner.select_type_first')
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500 bg-white">
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
                onClick={() => navigate('/Login')}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200 ml-1"
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
