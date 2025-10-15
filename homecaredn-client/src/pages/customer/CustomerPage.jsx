import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';
import Profile from '../../components/customer/Profile';
import ServiceRequestManager from '../../components/customer/ServiceRequestManager';
import Loading from '../../components/Loading';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export default function CustomerPage({ defaultTab = 'profile' }) {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const initialTab = location.state?.tab || defaultTab;
  const [active, setActive] = useState(initialTab);

  if (authLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-3">
        <div className="text-center mb-8 mt-5">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {active === 'profile'
              ? t('userPage.profile.title')
              : t('userPage.serviceRequest.title')}
          </h1>
          <p className="text-gray-600">
            {active === 'profile'
              ? t('userPage.profile.subtitle')
              : t('userPage.serviceRequest.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-28">
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
                  {t('userPage.serviceRequest.title')}
                </button>
              </nav>
            </div>
          </div>

          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-md p-6">
              {active === 'profile' && <Profile user={user} />}
              {active === 'service_requests' && (
                <ServiceRequestManager user={user} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
CustomerPage.propTypes = {
  defaultTab: PropTypes.string,
};
