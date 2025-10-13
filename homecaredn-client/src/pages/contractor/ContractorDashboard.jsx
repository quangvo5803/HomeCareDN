import { useTranslation } from 'react-i18next';
import MenuList from '../../components/partner/MenuList';
import AvatarMenu from '../../components/AvatarMenu';
import LanguageSwitch from '../../components/LanguageSwitch';
import NotificationBell from '../../components/NotificationBell';
import { formatVND, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/StatusBadge';

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
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t('partnerDashboard.title')}
        </h1>
        <p className="text-gray-600">
          {t('partnerDashboard.subtitle')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('partnerDashboard.kpi.open_requests')}</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-xs text-green-600">{t('partnerDashboard.kpi_meta.open_requests')}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <i className="fa-solid fa-clipboard-list text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('partnerDashboard.kpi.applied')}</p>
              <p className="text-2xl font-bold text-gray-900">14</p>
              <p className="text-xs text-blue-600">{t('partnerDashboard.kpi_meta.applied')}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <i className="fa-solid fa-hand-paper text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('partnerDashboard.kpi.won')}</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-xs text-green-600">{t('partnerDashboard.kpi_meta.won')}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <i className="fa-solid fa-trophy text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('partnerDashboard.kpi.pending_payments')}</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-xs text-red-600">{t('partnerDashboard.kpi_meta.pending_payments')}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <i className="fa-solid fa-credit-card text-red-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Applications */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('partnerDashboard.latest_applications')}
            </h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {t('partnerDashboard.view_all')}
            </button>
          </div>
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
                        <StatusBadge status={app.status} />
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
    </>
  );
}
