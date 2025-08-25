import { useMemo, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import AuthContext from '../context/AuthContext';

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
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: ctxLogout } = useContext(AuthContext) || {};

  const menu = useMemo(
    () => [
      {
        key: 'dashboard',
        label: t('partnerDashboard.dashboard'),
        icon: <i class="fa-solid fa-house"></i>,
        to: '/contractor',
      },
      {
        key: 'service_requests',
        label: t('partnerDashboard.service_requests'),
        icon: <i class="fa-solid fa-calendar"></i>,
        to: '/service-requests',
        badge: serviceRequestsCount,
      },
      {
        key: 'applications',
        label: t('partnerDashboard.my_applications'),
        icon: <i class="fa-solid fa-calendar-check"></i>,
        to: '/applications',
      },
      {
        key: 'payments',
        label: t('partnerDashboard.commission_payments'),
        icon: <i class="fa-solid fa-money-bill"></i>,
        to: '/payments',
      },
      {
        key: 'reviews',
        label: t('partnerDashboard.reviews'),
        icon: <i class="fa-solid fa-star"></i>,
        to: '/reviews',
      },
      {
        key: 'profile',
        label: t('partnerDashboard.profile_management'),
        icon: <i class="fa-solid fa-user-tie"></i>,
        to: '/profile',
      },
      {
        key: 'logout',
        label: t('header.logout'),
        icon: <i class="fa-solid fa-right-from-bracket text-red-500"></i>,
        onClick: () => {
          if (typeof ctxLogout === 'function') ctxLogout();
          authService.logout();
          navigate('/login', { replace: true });
        },
      },
    ],
    [t, serviceRequestsCount, ctxLogout, navigate]
  );

  const isActive = (it) =>
    it.exact
      ? location.pathname === it.to
      : it.to && location.pathname.startsWith(it.to);
  const handleClick = (it) =>
    typeof it.onClick === 'function' ? it.onClick() : it.to && navigate(it.to);

  return (
    <aside
      className={
        'bg-white border-r border-gray-200 sticky top-0 h-screen flex flex-col ' +
        className
      }
    >
      <div className="p-5 border-b border-gray-200 flex items-center gap-3">
        <Link
          to="/"
          aria-label={brand.title || 'HomeCareDN'}
          className="shrink-0 rounded-lg p-1.5 hover:bg-gray-50 transition"
        >
          <img
            src={brand.logoUrl}
            alt="Logo"
            className="h-10 w-auto object-contain"
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

      <nav className="p-3 text-gray-600 space-y-1">
        {menu.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={() => handleClick(it)}
            className={
              // <-- added
              'w-full text-left block px-3 py-2 rounded-xl hover:bg-gray-100 ' +
              (isActive(it)
                ? 'bg-gray-100 font-medium text-gray-900'
                : 'text-gray-700') +
              (it.key === 'logout' ? ' text-red-500' : '')
            }
          >
            <span className="mr-2">{it.icon}</span>
            <span>{it.label}</span>
            {typeof it.badge === 'number' && it.badge > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 align-middle">
                {it.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 text-xs text-gray-500 border-t border-gray-200">
        © {new Date().getFullYear()} {brand.title || 'HomeCareDN'}
      </div>
    </aside>
  );
}
