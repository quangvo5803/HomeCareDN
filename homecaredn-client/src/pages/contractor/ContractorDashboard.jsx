import { useTranslation } from 'react-i18next';

export default function ContractorDashboard() {
  const { t } = useTranslation();

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
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('partnerDashboard.id')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('partnerDashboard.description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('partnerDashboard.estimate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('partnerDashboard.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('partnerDashboard.action')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sample Data */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  APP-2025-0001
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Electrical repair – replace breaker
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  1.800.000 ₫
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {t('partnerDashboard.pending')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-800">
                    {t('partnerDashboard.view')}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  APP-2025-0002
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Paint 60m² apartment (materials included)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  9.200.000 ₫
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {t('partnerDashboard.approved')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-800">
                    {t('partnerDashboard.view')}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  APP-2025-0003
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Plumbing leak fix – kitchen sink
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  1.500.000 ₫
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {t('partnerDashboard.pending')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-800">
                    {t('partnerDashboard.view')}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
