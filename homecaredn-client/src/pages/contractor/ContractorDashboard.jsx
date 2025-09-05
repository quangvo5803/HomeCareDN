import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MenuList from '../../components/MenuList';
import AvatarMenu from '../../components/AvatarMenu';
import LanguageSwitch from '../../components/LanguageSwitch';
import NotificationBell from '../../components/NotificationBell';
import StatusBadge from '../../components/StatusBadge';
import { formatVND, formatDate } from '../../utils/formatters';
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

export default function DistributorDashboard() {
  const { t, i18n } = useTranslation();
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
      <MenuList serviceRequestsCount={10} />

      <div className="flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500">
              <i className="fa-solid fa-magnifying-glass"></i>
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
          <section className="bg-white border border-gray-200 rounded-2xl p-4">
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
