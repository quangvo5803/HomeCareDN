import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Pagination } from 'antd';
import { formatVND, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/StatusBadge';
import { contractorApplicationService } from '../../services/contractorApplicationService';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { useAuth } from '../../hook/useAuth';
import Loading from '../../components/Loading';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import PropTypes from 'prop-types';
import LoadingComponent from '../../components/LoadingComponent';
import { withMinLoading } from '../../utils/withMinLoading';
import { handleApiError } from '../../utils/handleApiError';
import { StatisticService } from '../../services/statisticService';
import { toast } from 'react-toastify';
import BarChart from '../../components/BarChart';

const INITIAL_KPI_STATE = {
  totalRequests: 0,
  pendingApplications: 0,
  pendingCommissions: 0,
  approvedApplications: 0,
};

const ServiceRequestRow = React.memo(function ServiceRequestRow({
  req,
  t,
  i18n,
  onView,
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
        {req.serviceRequestID}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <i className="fas fa-hammer text-orange-500"></i>
          <span className="text-sm font-medium text-gray-900">
            {t(`Enums.ServiceType.${req.serviceType}`)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
        {req.estimatePrice
          ? formatVND(req.estimatePrice)
          : t('contractorServiceRequestManager.negotiable')}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatDate(req.createdAt, i18n.language)}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={req.status} type="Request" />
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onView(req.serviceRequestID)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
        >
          <i className="fas fa-eye"></i>
          {t('partnerDashboard.view')}
        </button>
      </td>
    </tr>
  );
});

ServiceRequestRow.propTypes = {
  serviceRequestID: PropTypes.string.isRequired,
  serviceType: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  estimatePrice: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf([null]),
  ]),
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
  status: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  i18n: PropTypes.shape({ language: PropTypes.string.isRequired }).isRequired,
  onView: PropTypes.func.isRequired,
};

export default function ContractorDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [barYear, setBarYear] = useState(new Date().getFullYear());

  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [],
  });

  const isContractor = !!(user?.id && user.role === 'Contractor');

  // KPI State
  const [kpiData, setKpiData] = useState(INITIAL_KPI_STATE);
  const [kpiError, setKpiError] = useState(null);
  const [loadingDashboardStats, setLoadingDashboardStats] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingBarChart, setLoadingBarChart] = useState(false);

  const getMonthlyValue = (data, month, key) =>
    data.find((d) => d.month === month)?.[key] ?? 0;

  const getMonthlyDataset = (data, labels, key) =>
    labels.map((_, i) => getMonthlyValue(data, i + 1, key));

  const processBarChartData = (data, labels) => ({
    repair: getMonthlyDataset(data, labels, 'repairCount'),
    construction: getMonthlyDataset(data, labels, 'constructionCount'),
    revenue: getMonthlyDataset(data, labels, 'revenueCount'),
  });

  // Table State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    fetchServiceRequests,
    serviceRequests,
    totalServiceRequests,
    loading: isLoadingTable,
    setServiceRequests,
    setTotalServiceRequests,
  } = useServiceRequest();
  //Bar
  useEffect(() => {
    const fetchBarChartData = async () => {
      await withMinLoading(
        async () => {
          try {
            const res = await StatisticService.getBarChartForContractor(
              barYear,
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

            const { repair, construction, revenue } = processBarChartData(
              data,
              labels
            );

            setBarChartData({
              labels,
              datasets: [
                {
                  label: t('partnerDashboard.repair'),
                  data: repair,
                  backgroundColor: 'rgba(59,130,246,0.8)',
                },
                {
                  label: t('partnerDashboard.construction'),
                  data: construction,
                  backgroundColor: 'rgba(249,115,22,0.8)',
                },
                {
                  label: t('partnerDashboard.revenue'),
                  data: revenue,
                  backgroundColor: 'rgba(139,92,246,0.8)',
                  borderRadius: {
                    topLeft: 6,
                    topRight: 6,
                  },
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
  const fetchDashboard = useCallback(async () => {
    if (!isContractor) return;
    setLoadingDashboardStats(true);
    setKpiError(null);
    try {
      const data = await contractorApplicationService.getDashboardData();
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
  }, [isContractor, t]);

  // Initial load
  useEffect(() => {
    if (!isContractor) return;

    const loadData = async () => {
      setLoadingApplications(true);
      await Promise.all([
        fetchDashboard(),
        fetchServiceRequests({ PageNumber: currentPage, PageSize: pageSize }),
      ]);
      setLoadingApplications(false);
    };

    loadData();
  }, [isContractor, currentPage, fetchDashboard, fetchServiceRequests]);

  // Realtime
  const handleView = useCallback(
    (id) => navigate(`/Contractor/service-request/${id}`),
    [navigate]
  );

  useRealtime({
    [RealtimeEvents.ServiceRequestCreated]: (payload) => {
      setKpiData((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));
      setServiceRequests((prev) => {
        if (prev.some((r) => r.serviceRequestID === payload.serviceRequestID))
          return prev;
        const newList = [payload, ...prev];
        return newList.slice(0, pageSize);
      });
      setTotalServiceRequests((prev) => prev + 1);
    },

    [RealtimeEvents.ServiceRequestDelete]: (payload) => {
      setKpiData((prev) => {
        const wasOpen = serviceRequests.some(
          (r) =>
            r.serviceRequestID === payload.serviceRequestID &&
            r.status !== 'Closed' &&
            (r.selectedContractorApplicationID === null ||
              r.selectedContractorApplicationID === undefined)
        );
        return wasOpen
          ? { ...prev, totalRequests: Math.max(0, prev.totalRequests - 1) }
          : prev;
      });
      setServiceRequests((prev) =>
        prev.filter((r) => r.serviceRequestID !== payload.serviceRequestID)
      );
      setTotalServiceRequests((prev) => Math.max(0, prev - 1));
    },

    [RealtimeEvents.ServiceRequestClosed]: (payload) => {
      setKpiData((prev) => ({
        ...prev,
        totalRequests: Math.max(0, prev.totalRequests - 1),
      }));
      setServiceRequests((prev) =>
        prev.map((sr) =>
          sr.serviceRequestID === payload.serviceRequestID
            ? { ...sr, status: 'Closed' }
            : sr
        )
      );
    },

    onNewContractorApplication: (payload) => {
      if (payload.contractorID === user?.id) {
        setKpiData((prev) => ({
          ...prev,
          pendingApplications: prev.pendingApplications + 1,
        }));
      }
      setServiceRequests((prev) =>
        prev.map((sr) =>
          sr.serviceRequestID === payload.serviceRequestID
            ? {
                ...sr,
                contractorApplyCount: (sr.contractorApplyCount || 0) + 1,
              }
            : sr
        )
      );
    },

    onAcceptedContractorApplication: (payload) => {
      if (payload.contractorID === user?.id) {
        setKpiData((prev) => ({
          ...prev,
          pendingApplications: Math.max(0, prev.pendingApplications - 1),
          pendingCommissions: prev.pendingCommissions + 1,
          totalRequests: Math.max(0, prev.totalRequests - 1),
        }));
      }
      setServiceRequests((prev) =>
        prev.map((sr) =>
          sr.serviceRequestID === payload.serviceRequestID
            ? { ...sr, status: 'Closed' }
            : sr
        )
      );
    },

    [RealtimeEvents.ContractorApplicationRejected]: (payload) => {
      if (payload.contractorID === user?.id) {
        setKpiData((prev) => ({
          ...prev,
          pendingApplications: Math.max(0, prev.pendingApplications - 1),
        }));
      }
    },

    onDeleteContractorApplication: (payload) => {
      if (payload.contractorID === user?.id) {
        setKpiData((prev) => ({
          ...prev,
          pendingApplications: Math.max(0, prev.pendingApplications - 1),
        }));
      }
      setServiceRequests((prev) =>
        prev.map((sr) =>
          sr.serviceRequestID === payload.serviceRequestID
            ? {
                ...sr,
                contractorApplyCount: Math.max(
                  0,
                  (sr.contractorApplyCount || 1) - 1
                ),
              }
            : sr
        )
      );
    },

    onPaymentUpdate: (payload) => {
      if (payload.contractorID === user?.id && payload.status === 'Approved') {
        setKpiData((prev) => ({
          ...prev,
          pendingCommissions: Math.max(0, prev.pendingCommissions - 1),
          approvedApplications: prev.approvedApplications + 1,
        }));
      }
    },
  });

  const tableBody = useMemo(() => {
    if (isLoadingTable) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-12 text-center">
            <Loading />
          </td>
        </tr>
      );
    }
    if (!serviceRequests || serviceRequests.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500 font-medium">
                {t('partnerDashboard.no_requests')}
              </p>
            </div>
          </td>
        </tr>
      );
    }
    return serviceRequests.map((req) => (
      <ServiceRequestRow
        key={req.serviceRequestID}
        req={req}
        t={t}
        i18n={i18n}
        onView={handleView}
      />
    ));
  }, [isLoadingTable, serviceRequests, t, i18n, handleView]);

  // Guard role
  if (!isContractor) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('partnerDashboard.title')}
          </h1>
          <p className="text-gray-600">{t('partnerDashboard.subtitle')}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Open Requests */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t('partnerDashboard.kpi.open_requests')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {kpiData.totalRequests}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('partnerDashboard.kpi_meta.open_requests')}
                  </p>
                </div>
                <div className="p-4 bg-blue-100 rounded-full">
                  <i className="fas fa-clipboard-list text-blue-600 text-2xl"></i>
                </div>
              </div>
            </div>

            {/* Applied */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t('partnerDashboard.kpi.applied')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {kpiData.pendingApplications}
                  </p>
                </div>
                <div className="p-4 bg-yellow-100 rounded-full">
                  <i className="fas fa-clock text-yellow-600 text-2xl"></i>
                </div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t('partnerDashboard.kpi.pending_payments')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {kpiData.pendingCommissions}
                  </p>
                </div>
                <div className="p-4 bg-orange-100 rounded-full">
                  <i className="fas fa-credit-card text-orange-600 text-2xl"></i>
                </div>
              </div>
            </div>

            {/* Won */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t('partnerDashboard.kpi.won')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {kpiData.approvedApplications}
                  </p>
                </div>
                <div className="p-4 bg-green-100 rounded-full">
                  <i className="fas fa-trophy text-green-600 text-2xl"></i>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
          <div className="col-span-12 bg-white rounded-xl p-4 relative">
            {loadingBarChart && (
              <div className="absolute inset-0 bg-white backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
                <LoadingComponent />
              </div>
            )}
            <div className="h-full w-full">
              <BarChart
                type="Admin"
                title={t('adminDashboard.barChart.salesOverview')}
                data={barChartData}
                year={barYear}
                onYearChange={setBarYear}
                loading={loadingBarChart}
              />
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {t('partnerDashboard.latest_applications')}
                </h2>
              </div>
            </div>
          </div>
          {loadingApplications ? (
            <div className="flex justify-center py-8">
              <LoadingComponent />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.id')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.description')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.estimate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('partnerDashboard.last_update')}
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
                  {tableBody}
                </tbody>
              </table>
            </div>
          )}
          {totalServiceRequests > 0 && (
            <div className="flex justify-center py-6 border-t border-gray-100 bg-gray-50/50">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalServiceRequests}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
