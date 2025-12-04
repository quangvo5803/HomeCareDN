import { useMemo, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import AuthContext from '../../context/AuthContext';
import PropTypes from 'prop-types';

export default function Sidebar({
  serviceRequestsCount = 0,
  className = '',
  brand = {
    logoUrl:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png',
    title: 'HomeCareDN',
    subtitleKey: 'partnerDashboard.contractor_portal',
  },
  isOpen = false,
  onClose = () => {},
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout: ctxLogout } = useContext(AuthContext) || {};

  const menu = useMemo(() => {
    // Menu cho Distributor
    if (user?.role === 'Distributor') {
      return [
        {
          key: 'dashboard',
          label: t('partnerDashboard.dashboard'),
          icon: <i className="fa-solid fa-house"></i>,
          to: '/Distributor',
        },
        {
          key: 'material-request',
          label: t('partnerDashboard.material_requests'),
          icon: <i className="fas fa-boxes"></i>,
          to: '/Distributor/MaterialRequestManager',
          badge: serviceRequestsCount,
        },
        {
          key: 'categories',
          label: t('partnerDashboard.category'),
          icon: <i className="fa-solid fa-tags"></i>,
          to: '/Distributor/CategoryManager',
        },
        {
          key: 'materials',
          label: t('partnerDashboard.materials'),
          icon: <i className="fa-solid fa-box"></i>,
          to: '/Distributor/MaterialManager',
        },
        {
          key: 'profile',
          label: t('partnerDashboard.profile'),
          icon: <i className="fa-solid fa-id-card"></i>,
          to: '/Distributor/Profile',
        },
        {
          key: 'logout',
          label: t('header.logout'),
          icon: <i className="text-red-500 fa-solid fa-right-from-bracket"></i>,
          onClick: () => {
            if (typeof ctxLogout === 'function') ctxLogout();
            authService.logout();
            navigate('/login', { replace: true });
          },
        },
      ];
    }

    // Menu cho Contractor
    if (user?.role === 'Contractor') {
      return [
        {
          key: 'dashboard',
          label: t('partnerDashboard.dashboard'),
          icon: <i className="fa-solid fa-house"></i>,
          to: '/Contractor',
        },
        {
          key: 'service_requests',
          label: t('partnerDashboard.service_requests'),
          icon: <i className="fa-solid fa-list-alt"></i>,
          to: '/Contractor/ServiceRequestManager',
          badge: serviceRequestsCount,
        },
        {
          key: 'profile',
          label: t('partnerDashboard.profile'),
          icon: <i className="fa-solid fa-id-card"></i>,
          to: '/Contractor/Profile',
        },
        {
          key: 'logout',
          label: t('header.logout'),
          icon: <i className="text-red-500 fa-solid fa-right-from-bracket"></i>,
          onClick: () => {
            if (typeof ctxLogout === 'function') ctxLogout();
            authService.logout();
            navigate('/login', { replace: true });
          },
        },
      ];
    }
    return [
      {
        key: 'logout',
        label: t('header.logout'),
        icon: <i className="text-red-500 fa-solid fa-right-from-bracket"></i>,
        onClick: () => {
          if (typeof ctxLogout === 'function') ctxLogout();
          authService.logout();
          navigate('/login', { replace: true });
        },
      },
    ];
  }, [t, serviceRequestsCount, ctxLogout, navigate, user?.role]);

  const handleClick = (it) => {
    if (typeof it.onClick === 'function') it.onClick();
    else if (it.to) navigate(it.to);

    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:sticky md:top-0 md:h-screen
          ${className}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link
              to="/"
              aria-label={brand.title || 'HomeCareDN'}
              className="shrink-0 rounded-lg p-1.5 hover:bg-gray-50 transition"
              onClick={() => window.innerWidth < 768 && onClose()}
            >
              <img
                src={brand.logoUrl}
                alt="Logo"
                className="object-contain w-auto h-10"
              />
            </Link>
            <div className="min-w-0 leading-tight">
              <div className="font-semibold tracking-wide truncate">
                {brand.title || 'HomeCareDN'}
              </div>
              <div className="text-xs text-gray-500 whitespace-normal line-clamp-1">
                {brand.subtitleKey
                  ? t(brand.subtitleKey)
                  : brand.subtitle || ''}
              </div>
              <div className="text-xs text-gray-700 font-medium mt-0.5">
                {t(`roles.${user?.role}`)}
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none p-1"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1 text-gray-600 flex-1 overflow-y-auto custom-scrollbar">
          {menu.map((it) =>
            it.onClick ? (
              <button
                key={it.key}
                type="button"
                onClick={() => handleClick(it)}
                className="flex items-center w-full px-3 py-2.5 text-left text-red-500 rounded-xl hover:bg-red-50 transition-colors duration-200"
              >
                <span className="mr-3 w-6 text-center">{it.icon}</span>
                <span className="font-medium">{it.label}</span>
              </button>
            ) : (
              <NavLink
                key={it.key}
                to={it.to}
                end={it.key === 'dashboard'}
                onClick={() => handleClick(it)}
                className={({ isActive }) =>
                  'flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-200 ' +
                  (isActive
                    ? 'bg-orange-50 text-orange-600 font-semibold shadow-sm border border-orange-100'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                }
              >
                <span
                  className={`mr-3 w-6 text-center transition-transform duration-200 ${
                    it.badge ? 'relative' : ''
                  }`}
                >
                  {it.icon}
                  {/* Badge Notification */}
                  {it.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center border-2 border-white">
                      {it.badge > 99 ? '99+' : it.badge}
                    </span>
                  )}
                </span>
                <span className="truncate">{it.label}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 mt-auto text-xs text-gray-500 border-t border-gray-200 bg-gray-50/50">
          <div className="text-center">
            © {new Date().getFullYear()} {brand.title || 'HomeCareDN'}
            <p className="mt-1 text-[10px] text-gray-400">
              All rights reserved
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  serviceRequestsCount: PropTypes.number,
  className: PropTypes.string,
  brand: PropTypes.shape({
    logoUrl: PropTypes.string,
    title: PropTypes.string,
    subtitleKey: PropTypes.string,
    subtitle: PropTypes.string,
  }),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
