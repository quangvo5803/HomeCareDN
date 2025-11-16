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
          to: '/Distributor/MaterialRequest',
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
          to: '/Contractor/service-requests',
          badge: serviceRequestsCount,
        },
        {
          key: 'my_projects',
          label: t('partnerDashboard.my_projects'),
          icon: <i className="fa-solid fa-project-diagram"></i>,
          to: '/Contractor/my-projects',
        },
        {
          key: 'applications',
          label: t('partnerDashboard.applications'),
          icon: <i className="fa-solid fa-file-signature"></i>,
          to: '/Contractor/applications',
        },
        {
          key: 'profile',
          label: t('partnerDashboard.profile'),
          icon: <i className="fa-solid fa-id-card"></i>,
          to: '/Contractor/profile',
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

  const handleClick = (it) =>
    typeof it.onClick === 'function' ? it.onClick() : it.to && navigate(it.to);
  return (
    <aside
      className={
        'bg-white border-r border-gray-200 sticky top-0 h-screen flex flex-col ' +
        className
      }
    >
      {/* Brand */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-200">
        <Link
          to="/"
          aria-label={brand.title || 'HomeCareDN'}
          className="shrink-0 rounded-lg p-1.5 hover:bg-gray-50 transition"
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
          <div className="text-xs text-gray-500 whitespace-normal">
            {brand.subtitleKey ? t(brand.subtitleKey) : brand.subtitle || ''}
          </div>
          <div className="text-xs text-gray-700">{t(`roles.${user.role}`)}</div>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-3 space-y-1 text-gray-600">
        {menu.map((it) =>
          it.onClick ? (
            <button
              key={it.key}
              type="button"
              onClick={() => handleClick(it)}
              className="block w-full px-3 py-2 text-left text-red-500 rounded-xl hover:bg-gray-100"
            >
              <span className="mr-2">{it.icon}</span>
              <span>{it.label}</span>
            </button>
          ) : (
            <NavLink
              key={it.key}
              to={it.to}
              end={it.key === 'dashboard'} // Dashboard chỉ active khi đúng "/Distributor"
              className={({ isActive }) =>
                'w-full text-left block px-3 py-2 rounded-xl hover:bg-gray-100 ' +
                (isActive
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'text-gray-700')
              }
            >
              <span className="mr-2">{it.icon}</span>
              <span>{it.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="p-4 mt-auto text-xs text-gray-500 border-t border-gray-200">
        © {new Date().getFullYear()} {brand.title || 'HomeCareDN'}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  serviceRequestsCount: PropTypes.number,
  className: PropTypes.string,
  brand: PropTypes.shape({
    logoUrl: PropTypes.string,
    title: PropTypes.string,
    subtitleKey: PropTypes.string,
  }),
};
