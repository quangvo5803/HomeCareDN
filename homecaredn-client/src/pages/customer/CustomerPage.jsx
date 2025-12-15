import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';
import Profile from '../../components/customer/Profile';
import ServiceRequestManager from '../../components/customer/ServiceRequestManager';
import MaterialRequestManager from '../../components/customer/MaterialRequestManager';
import Loading from '../../components/Loading';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';

export default function CustomerPage({ defaultTab = 'profile' }) {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const initialTab = location.state?.tab || defaultTab;
  const [active, setActive] = useState(initialTab);

  useRealtime({
    [RealtimeEvents.ContractorApplicationRejected]: (payload) => {
      if (payload.reason === 'Commission payment expired') {
        toast.warning(t('userPage.serviceRequest.serviceApplicationExpired'));
      }
    },

    [RealtimeEvents.DistributorApplicationRejected]: (payload) => {
      if (payload.reason === 'Commission payment expired') {
        toast.warning(t('userPage.materialRequest.materialApplicationExpired'));
      }
    },
  });

  if (authLoading) return <Loading />;

  const titleMap = {
    profile: t('userPage.profile.title'),
    service_requests: t('userPage.serviceRequest.title'),
    material_requests: t('userPage.materialRequest.title'),
  };
  const subtitleMap = {
    profile: t('userPage.profile.subtitle'),
    service_requests: t('userPage.serviceRequest.subtitle'),
    material_requests: t('userPage.materialRequest.subtitle'),
  };

  const title = titleMap[active] || t('userPage.profile.title');
  const subtitle = subtitleMap[active] || t('userPage.profile.subtitle');

  const menuItems = [
    {
      key: 'profile',
      label: t('userPage.profile.title'),
      icon: 'fa-user',
    },
    {
      key: 'service_requests',
      label: t('userPage.serviceRequest.title'),
      icon: 'fa-clipboard-list',
    },
    {
      key: 'material_requests',
      label: t('userPage.materialRequest.title'),
      icon: 'fa-boxes',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-6xl mx-auto p-3 md:p-6">
        {/* Page Header */}
        <div className="text-center mb-6 md:mb-8 mt-4 md:mt-5">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {title}
          </h1>
          <p className="text-sm md:text-base text-gray-600 px-4">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Sidebar / Mobile Tabs */}
          <div className="col-span-1 md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm md:shadow-md p-2 md:p-4 sticky top-16 md:top-24 z-10">
              {/* Sử dụng Grid 3 cột cho mobile để chia đều */}
              <nav className="grid grid-cols-3 md:flex md:flex-col gap-2">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className={`
                      flex flex-col md:flex-row items-center justify-center md:justify-start 
                      gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-lg transition-all duration-200 
                      text-[11px] sm:text-xs md:text-base font-medium
                      ${
                        active === item.key
                          ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm'
                          : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                      }
                    `}
                  >
                    <i
                      className={`fas ${item.icon} w-5 text-center text-sm md:text-lg mb-0.5 md:mb-0`}
                    ></i>
                    <span className="text-center md:text-left leading-tight md:leading-normal line-clamp-2 md:line-clamp-1">
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-1 md:col-span-9">
            <div className="bg-white rounded-xl shadow-sm md:shadow-md p-4 md:p-6 min-h-[300px]">
              {active === 'profile' && <Profile user={user} />}
              {active === 'service_requests' && <ServiceRequestManager />}
              {active === 'material_requests' && (
                <MaterialRequestManager user={user} />
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
