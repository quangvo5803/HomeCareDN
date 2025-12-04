import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatVND, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/StatusBadge';
import { distributorApplicationService } from '../../services/distributorApplicationService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import LoadingComponent from '../../components/LoadingComponent';
import { withMinLoading } from '../../utils/withMinLoading';
import { handleApiError } from '../../utils/handleApiError';
import { StatisticService } from '../../services/statisticService';
import { toast } from 'react-toastify';
import BarChart from '../../components/BarChart';
import LineChart from '../../components/LineChart';

const INITIAL_KPI_STATE = {
  totalRequests: 0,
  pendingApplications: 0,
  pendingCommissions: 0,
  approvedApplications: 0,
};

export default function DistributorDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [barYear, setBarYear] = useState(new Date().getFullYear());
  const [lineYear, setLineYear] = useState(new Date().getFullYear());

  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [],
  });
  const isDistributor = !!(user?.id && user.role === 'Distributor');
  // KPI State
  const [kpiData, setKpiData] = useState(INITIAL_KPI_STATE);
  const [kpiError, setKpiError] = useState(null);
  const [latestApplications, setLatestApplications] = useState([]);
  const [loadingDashboardStats, setLoadingDashboardStats] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingBarChart, setLoadingBarChart] = useState(false);
  const [loadingLineChart, setLoadingLineChart] = useState(false);

  const getMonthlyValue = (data, month, key) =>
    data.find((d) => d.month === month)?.[key] ?? 0;

  const getMonthlyDataset = (data, labels, key) =>
    labels.map((_, i) => getMonthlyValue(data, i + 1, key));

  const processBarChartData = (data, labels) => ({
    material: getMonthlyDataset(data, labels, 'materialCount'),
  });

  const processLineChartData = (data, labels) => ({
    revenue: getMonthlyDataset(data, labels, 'totalValue'),
  });

  const fetchLatestApplications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const result = await distributorApplicationService.getLatestApplications({
        PageNumber: 1,
        PageSize: 5,
        SortBy: 'CreatedAt',
        SortDirection: 'DESC',
      });
      setLatestApplications(result.items || []);
    } catch (err) {
      toast.error(handleApiError(err));
    }
  }, [user?.id]);

  const handleView = useCallback(
    (id) => navigate(`/Distributor/MaterialRequestManager/${id}`),
    [navigate]
  );
  //Bar
  useEffect(() => {
    const fetchBarChartData = async () => {
      await withMinLoading(
        async () => {
          try {
            const res = await StatisticService.getBarChart(
              barYear,
              user.role,
              null,
              user.id
            );
            const data = res.data;

            const labels = [
              t('adminDashboard.months.jan'),
              t('adminDashboard.months.feb'),
              t('adminDashboard.months.mar'),
              t('adminDashboard.months.apr'),
              t('adminDashboard.months.may'),
              t('adminDashboard.months.jun'),
              t('adminDashboard.months.jul'),
              t('adminDashboard.months.aug'),
              t('adminDashboard.months.sep'),
              t('adminDashboard.months.oct'),
              t('adminDashboard.months.nov'),
              t('adminDashboard.months.dec'),
            ];

            const { material } = processBarChartData(data, labels);

            setBarChartData({
              labels,
              datasets: [
                {
                  label: t('partnerDashboard.material'),
                  data: material,
                  backgroundColor: 'rgba(59,130,246,0.8)',
                  borderRadius: 4,
                },
              ],
            });
          } catch (err) {
            toast.error(t(handleApiError(err)));
          }
        },
        setLoadingBarChart,
        1000
      );
    };
    fetchBarChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barYear, t]);
  //Line
  useEffect(() => {
    const fetchLineChartData = async () => {
      await withMinLoading(
        async () => {
          try {
            const res = await StatisticService.getLineChart(
              lineYear,
              user.role,
              null,
              user.id
            );
            const data = res.data;

            const labels = [
              t('adminDashboard.months.jan'),
              t('adminDashboard.months.feb'),
              t('adminDashboard.months.mar'),
              t('adminDashboard.months.apr'),
              t('adminDashboard.months.may'),
              t('adminDashboard.months.jun'),
              t('adminDashboard.months.jul'),
              t('adminDashboard.months.aug'),
              t('adminDashboard.months.sep'),
              t('adminDashboard.months.oct'),
              t('adminDashboard.months.nov'),
              t('adminDashboard.months.dec'),
            ];

            const { revenue } = processLineChartData(data, labels);

            setLineChartData({
              labels,
              datasets: [
                {
                  label: t('adminDashboard.lineChart.commissionRevenue'),
                  data: revenue,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16,185,129,0.2)',
                  fill: true,
                },
              ],
            });
          } catch (err) {
            toast.error(t(handleApiError(err)));
          }
        },
        setLoadingLineChart,
        1000
      );
    };

    fetchLineChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineYear, t]);

  const fetchDashboard = useCallback(async () => {
    if (!isDistributor) return;
    setLoadingDashboardStats(true);
    setKpiError(null);
    try {
      const data = await StatisticService.getStatStatisticForDistributor();
      setKpiData({
        totalRequests: data?.openRequests ?? data?.OpenRequests ?? 0,
        pendingApplications: data?.applied ?? data?.Applied ?? 0,
        pendingCommissions: data?.pendingPayments ?? data?.PendingPayments ?? 0,
        approvedApplications: data?.won ?? data?.Won ?? 0,
      });
    } catch (error) {
      setKpiError(
        error?.response?.data?.title ||
          error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          t('partnerDashboard.errors.kpi_load_failed')
      );
    } finally {
      setLoadingDashboardStats(false);
    }
  }, [isDistributor, t]);

  // Initial load
  useEffect(() => {
    if (!isDistributor) return;

    const loadData = async () => {
      setLoadingApplications(true);
      await Promise.all([fetchDashboard(), fetchLatestApplications()]);
      setLoadingApplications(false);
    };

    loadData();
  }, [isDistributor, fetchDashboard, fetchLatestApplications]);

  useRealtime({
    [RealtimeEvents.MaterialRequestCreated]: () => {
      setKpiData((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));
    },

    [RealtimeEvents.MaterialRequestDeleted]: () => {
      setKpiData((prev) => ({
        ...prev,
        totalRequests: Math.max(0, prev.totalRequests - 1),
      }));
    },

    onNewDistributorApplication: (payload) => {
      if (payload.distributorID === user?.id) {
        setKpiData((prev) => ({
          ...prev,
          pendingApplications: prev.pendingApplications + 1,
        }));
        fetchLatestApplications();
      }
    },

    onAcceptedDistributorApplication: (payload) => {
      if (payload.distributorID === user?.id) {
        setKpiData((prev) => ({
          ...prev,
          pendingApplications: Math.max(0, prev.pendingApplications - 1),
          pendingCommissions: prev.pendingCommissions + 1,
          totalRequests: Math.max(0, prev.totalRequests - 1),
        }));
      }
      fetchLatestApplications();
    },

    [RealtimeEvents.DistributorApplicationRejected]: (payload) => {
      if (payload.distributorID === user?.id) {
        setKpiData((prev) => ({
          ...prev,
          pendingApplications: Math.max(0, prev.pendingApplications - 1),
        }));
        fetchLatestApplications();
      }
    },

    onDeleteDistributorApplication: (payload) => {
      if (payload.distributorID === user?.id) {
        setKpiData((prev) => ({
          ...prev,
          pendingApplications: Math.max(0, prev.pendingApplications - 1),
        }));
      }
      fetchLatestApplications();
    },

    onPaymentUpdate: (payload) => {
      if (payload.distributorID === user?.id && payload.status === 'Approved') {
        setKpiData((prev) => ({
          ...prev,
          pendingCommissions: Math.max(0, prev.pendingCommissions - 1),
          approvedApplications: prev.approvedApplications + 1,
        }));
        fetchLatestApplications();
      }
    },
  });

  // Guard role
  if (!isDistributor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">{t('partnerDashboard.access_denied')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full px-4 py-4 md:px-6 md:py-6 mx-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {t('partnerDashboard.title_dis')}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {t('partnerDashboard.subtitle')}
        </p>
      </div>

      {/* KPI Error */}
      {kpiError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
              <div>
                <p className="font-semibold text-red-800">
                  {t('partnerDashboard.errors.kpi_load_failed')}
                </p>
                <p className="text-sm text-red-700">{kpiError}</p>
              </div>
            </div>
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              disabled={loadingDashboardStats}
            >
              {loadingDashboardStats ? (
                <i className="fas fa-spinner fa-spin" />
              ) : (
                t('partnerDashboard.retry')
              )}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {loadingDashboardStats ? (
        <div className="flex justify-center py-8">
          <LoadingComponent />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Open Material Requests */}
          <div className="bg-white rounded-xl shadow-md p-5 md:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('partnerDashboard.kpi.open_requests')}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {kpiData.totalRequests}
                </p>
              </div>
              <div className="p-3 md:p-4 bg-blue-100 rounded-full">
                <i className="fas fa-box-open text-blue-600 text-xl md:text-2xl"></i>
              </div>
            </div>
          </div>

          {/* Applied */}
          <div className="bg-white rounded-xl shadow-md p-5 md:p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('partnerDashboard.kpi.applied')}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {kpiData.pendingApplications}
                </p>
              </div>
              <div className="p-3 md:p-4 bg-yellow-100 rounded-full">
                <i className="fas fa-file-signature text-yellow-600 text-xl md:text-2xl"></i>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-xl shadow-md p-5 md:p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('partnerDashboard.kpi.pending_payments')}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {kpiData.pendingCommissions}
                </p>
              </div>
              <div className="p-3 md:p-4 bg-orange-100 rounded-full">
                <i className="fas fa-credit-card text-orange-600 text-xl md:text-2xl"></i>
              </div>
            </div>
          </div>

          {/* Won (Approved) */}
          <div className="bg-white rounded-xl shadow-md p-5 md:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('partnerDashboard.kpi.won')}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {kpiData.approvedApplications}
                </p>
              </div>
              <div className="p-3 md:p-4 bg-green-100 rounded-full">
                <i className="fas fa-handshake text-green-600 text-xl md:text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 md:mt-10">
        {/* Bar Chart - 50% */}
        <div className="lg:col-span-6 bg-white rounded-xl relative shadow-md border border-gray-100 min-h-[350px] md:min-h-[400px]">
          {loadingBarChart && (
            <div className="absolute inset-0 bg-white backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
              <LoadingComponent />
            </div>
          )}
          <div className="h-full w-full p-2 md:p-0">
            <BarChart
              type="Distributor"
              title={t('adminDashboard.barChart.salesOverview')}
              data={barChartData}
              year={barYear}
              onYearChange={setBarYear}
              loading={loadingBarChart}
            />
          </div>
        </div>
        {/* Line Chart - 50% */}
        <div className="lg:col-span-6 bg-white rounded-xl relative shadow-md border border-gray-100 min-h-[350px] md:min-h-[400px]">
          {loadingLineChart && (
            <div className="absolute inset-0 bg-white backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
              <LoadingComponent />
            </div>
          )}
          <div className="h-full w-full p-2 md:p-0">
            <LineChart
              type="Distributor"
              title={t('adminDashboard.lineChart.commissionRevenue')}
              data={lineChartData}
              year={lineYear}
              onYearChange={setLineYear}
              loading={loadingLineChart}
            />
          </div>
        </div>
      </div>

      {/* Table: Latest Applications */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mt-6 md:mt-10">
        <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                {t('partnerDashboard.latest_applications')}
              </h2>
            </div>
          </div>
        </div>

        {loadingApplications ? (
          <div className="flex justify-center py-12">
            <LoadingComponent />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.no')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.estimate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.commission_due')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.apply_at')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!latestApplications || latestApplications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                          <p className="text-gray-500 font-medium">
                            {t('partnerDashboard.no_applications')}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    latestApplications.map((app, index) => (
                      <tr
                        key={app.distributorApplicationID}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {app.totalEstimatePrice
                            ? formatVND(app.totalEstimatePrice)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {app.dueCommisionTime
                            ? formatDate(app.dueCommisionTime, i18n.language)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(app.createdAt, i18n.language)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status} type="Application" />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleView(app.materialRequestID)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                          >
                            <i className="fas fa-eye"></i>
                            {t('partnerDashboard.view')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden">
              {!latestApplications || latestApplications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                    <p className="text-gray-500 font-medium">
                      {t('partnerDashboard.no_applications')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col p-4 gap-4">
                  {latestApplications.map((app, index) => (
                    <div
                      key={app.distributorApplicationID}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-orange-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-mono font-bold text-gray-600">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(app.createdAt, i18n.language)}
                          </span>
                        </div>
                        <StatusBadge status={app.status} type="Application" />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {t('partnerDashboard.estimate')}:
                          </span>
                          <span className="font-bold text-gray-900">
                            {app.totalEstimatePrice
                              ? formatVND(app.totalEstimatePrice)
                              : '-'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {t('partnerDashboard.commission_due')}:
                          </span>
                          <span className="text-gray-900">
                            {app.dueCommisionTime
                              ? formatDate(app.dueCommisionTime, i18n.language)
                              : '-'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleView(app.materialRequestID)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg active:bg-orange-700 transition-colors shadow-sm"
                      >
                        <i className="fas fa-eye"></i>
                        {t('partnerDashboard.view')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
