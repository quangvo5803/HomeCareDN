import { useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import AuthContext from '../../context/AuthContext';
import ReactCountryFlag from 'react-country-flag';
import MenuList from '../../components/MenuList';

/* ========= Helpers ========= */
function formatVND(n) {
  const num = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}
function formatDate(iso, lng) {
  const d = new Date(iso);
  const locale = lng?.startsWith('vi') ? 'vi-VN' : 'en-US';
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
function StatusBadge({ status, t }) {
  const map = {
    Pending: {
      text: t('partnerDashboard.pending'),
      cls: 'bg-yellow-100 text-yellow-700',
    },
    Approved: {
      text: t('partnerDashboard.approved'),
      cls: 'bg-green-100 text-green-700',
    },
    Rejected: {
      text: t('partnerDashboard.rejected'),
      cls: 'bg-red-100 text-red-700',
    },
  };
  const cfg = map[status] || { text: status, cls: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${cfg.cls}`}>
      {cfg.text}
    </span>
  );
}

/* ========= Seed data (5 items) ========= */
const SEED_APPS = [
  {
    id: 'APP-2025-0001',
    description: 'Electrical repair — replace breaker',
    estimatePrice: 1800000,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    status: 'Pending',
    notifications: 2,
  },
  {
    id: 'APP-2025-0002',
    description: 'Paint 60m² apartment (materials included)',
    estimatePrice: 9200000,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: 'Approved',
    notifications: 0,
  },
  {
    id: 'APP-2025-0003',
    description: 'Plumbing leak fix — kitchen sink',
    estimatePrice: 1500000,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    status: 'Pending',
    notifications: 1,
  },
  {
    id: 'APP-2025-0004',
    description: 'AC installation (1.5HP) — Binh Thanh',
    estimatePrice: 6500000,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    status: 'Approved',
    notifications: 3,
  },
  {
    id: 'APP-2025-0005',
    description: 'Socket replacement — 4 rooms',
    estimatePrice: 1200000,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    status: 'Rejected',
    notifications: 0,
  },
];

/* ========= Small UI parts ========= */
function BellIcon() {
  return <i class="fa-solid fa-bell"></i>;
}

function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const flagCode = i18n.language === 'vi' ? 'VN' : 'US';
  const label = i18n.language.toUpperCase();

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

function NotificationBell({ total }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 grid place-items-center rounded-full border hover:bg-gray-50"
        title={t('partnerDashboard.notifications')}
      >
        <BellIcon className="w-5 h-5 text-gray-700" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white">
            {total}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg p-2 z-20">
          <div className="text-sm text-gray-700 px-2 py-1">
            {t('partnerDashboard.you_have_notifications', { count: total })}
          </div>
          <div className="max-h-64 overflow-auto">
            {[...Array(Math.max(total, 1))].slice(0, 5).map((_, i) => (
              <div
                key={i}
                className="px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                {t('partnerDashboard.notification_item', { number: i + 1 })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ========= Main ========= */
export default function ContractorDashboard() {
  const { t, i18n } = useTranslation();

  function AvatarMenu() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Lấy user từ AuthContext (đa số context sẽ có user + logout)
    const { user, logout: ctxLogout } = useContext(AuthContext) || {};

    const name = user?.displayName || user?.email || 'User';
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&color=fff`;
    const primary = user?.photoURL || user?.avatarUrl || fallback;
    const avatarSrc = imgError ? fallback : primary;

    const handleLogout = () => {
      try {
        authService.logout();
        if (typeof ctxLogout === 'function') ctxLogout();
        navigate('/login', { replace: true });
      } finally {
        setOpen(false);
      }
    };

    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded-full overflow-hidden
                    border border-gray-300 hover:border-blue-500 hover:bg-gray-50
                    inline-flex items-center justify-center align-middle transition"
          title={t('partnerDashboard.account')}
          aria-label="Account menu"
        >
          <img
            src={avatarSrc}
            onError={() => setImgError(true)}
            alt={name}
            className="w-full h-full object-cover block" // <-- block để hết lệch baseline
            loading="lazy"
          />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden z-20">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/profile');
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
            >
              👤 {t('header.profile')}
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              {' '}
              <i class="fa-solid fa-right-from-bracket text-red-500"></i>{' '}
              {t('header.logout')}
            </button>
          </div>
        )}
      </div>
    );
  }

  const navigate = useNavigate();

  const kpis = useMemo(
    () => [
      {
        label: t('partnerDashboard.kpi.open_requests'),
        value: 8,
        meta: t('partnerDashboard.kpi_meta.open_requests'),
        cls: 'text-green-600',
      },
      {
        label: t('partnerDashboard.kpi.applied'),
        value: 14,
        meta: t('partnerDashboard.kpi_meta.applied'),
        cls: 'text-gray-600',
      },
      {
        label: t('partnerDashboard.kpi.won'),
        value: 5,
        meta: t('partnerDashboard.kpi_meta.won'),
        cls: 'text-green-600',
      },
      {
        label: t('partnerDashboard.kpi.pending_payments'),
        value: 3,
        meta: t('partnerDashboard.kpi_meta.pending_payments'),
        cls: 'text-red-600',
      },
    ],
    [t]
  );

  const items = SEED_APPS;
  const totalNotifications = items.reduce(
    (s, it) => s + (it.notifications || 0),
    0
  );

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] bg-gray-50">
      {/* MenuList */}
      <MenuList serviceRequestsCount={10} />

      {/* Content */}
      <div className="flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                placeholder={t('partnerDashboard.search_placeholder')}
              />
            </div>

            <NotificationBell total={totalNotifications} />

            <LanguageSwitch />

            <AvatarMenu />
          </div>
        </header>

        {/* Main */}
        <main className="p-6 space-y-6">
          {/* KPI cards */}
          <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="bg-white border border-gray-200 rounded-2xl p-4"
              >
                <div className="text-xs text-gray-500">{k.label}</div>
                <div className="mt-1 text-2xl font-extrabold">{k.value}</div>
                <div className={`mt-1 text-xs ${k.cls}`}>{k.meta}</div>
              </div>
            ))}
          </section>

          {/* Latest Applications */}
          <section
            id="applications"
            className="bg-white border border-gray-200 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {t('partnerDashboard.latest_applications')}
              </h3>
              <button
                onClick={() => navigate('/applications')}
                className="text-sm px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              >
                {t('partnerDashboard.view_all')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500">
                  <tr className="border-b">
                    <th className="py-2 px-3 text-left">
                      {t('partnerDashboard.id')}
                    </th>
                    <th className="py-2 px-3 text-left">
                      {t('partnerDashboard.description')}
                    </th>
                    <th className="py-2 px-3 text-left">
                      {t('partnerDashboard.estimate')}
                    </th>
                    <th className="py-2 px-3 text-left">
                      {t('partnerDashboard.last_update')}
                    </th>
                    <th className="py-2 px-3 text-left">
                      {t('partnerDashboard.notifications')}
                    </th>
                    <th className="py-2 px-3 text-left">
                      {t('partnerDashboard.status')}
                    </th>
                    <th className="py-2 px-3 text-left">
                      {t('partnerDashboard.action')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SEED_APPS.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3">{app.id}</td>
                      <td className="py-3 px-3">{app.description}</td>
                      <td className="py-3 px-3">
                        {formatVND(app.estimatePrice)}
                      </td>
                      <td className="py-3 px-3">
                        {formatDate(app.createdAt, i18n.language)}
                      </td>
                      <td className="py-3 px-3">
                        {app.notifications > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-red-200 text-red-700">
                            {app.notifications}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-1000">
                            0
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={app.status} t={t} />
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                        >
                          {t('partnerDashboard.view')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <footer className="p-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} HomeCareDN
        </footer>
      </div>
    </div>
  );
}
