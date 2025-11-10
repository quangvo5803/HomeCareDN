import LineChart from '../../components/LineChart';
import PieChart from '../../components/PieChart';
import BarChart from '../../components/BarChart';
import { useTranslation } from 'react-i18next';
import Avatar from 'react-avatar';
import { useEffect, useState } from 'react';
import { StatisticService } from '../../services/statisticService';
import { toast } from 'react-toastify';
import { handleApiError } from '../../utils/handleApiError';
import LoadingComponent from '../../components/LoadingComponent';
import { useNavigate } from 'react-router-dom';
import { withMinLoading } from '../../utils/withMinLoading';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [lineYear, setLineYear] = useState(new Date().getFullYear());
  const [pieYear, setPieYear] = useState(new Date().getFullYear());
  const [barYear, setBarYear] = useState(new Date().getFullYear());

  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [topStats, setTopStats] = useState({
    topContractors: [],
    topDistributors: [],
  });
  const [stats, setStats] = useState({
    totalCustomer: 0,
    totalContactor: 0,
    totalDistributor: 0,
    totalPending: 0,
    totalPendingCommission: 0,
    totalCommission: 0,
  });

  const [loadingLineChart, setLoadingLineChart] = useState(false);
  const [loadingPieChart, setLoadingPieChart] = useState(false);
  const [loadingBarChart, setLoadingBarChart] = useState(false);
  const [loadingTop, setLoadingTop] = useState(false);

  const getMonthlyValue = (data, month, key) =>
    data.find((d) => d.month === month)?.[key] ?? 0;

  const getMonthlyDataset = (data, labels, key) =>
    labels.map((_, i) => getMonthlyValue(data, i + 1, key));

  const processBarChartData = (data, labels) => ({
    repair: getMonthlyDataset(data, labels, 'repairCount'),
    construction: getMonthlyDataset(data, labels, 'constructionCount'),
    material: getMonthlyDataset(data, labels, 'materialCount'),
  });

  const processLineChartData = (data, labels) => ({
    commission: getMonthlyDataset(data, labels, 'totalCommission'),
  });

  //Bar
  useEffect(() => {
    const fetchBarChartData = async () => {
      await withMinLoading(
        async () => {
          try {
            const res = await StatisticService.getBarChart(barYear);
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

            const { repair, construction, material } = processBarChartData(
              data,
              labels
            );

            setBarChartData({
              labels,
              datasets: [
                {
                  label: t('adminDashboard.repair'),
                  data: repair,
                  backgroundColor: 'rgba(59,130,246,0.8)',
                },
                {
                  label: t('adminDashboard.construction'),
                  data: construction,
                  backgroundColor: 'rgba(249,115,22,0.8)',
                },
                {
                  label: t('adminDashboard.material'),
                  data: material,
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

  //Line
  useEffect(() => {
    const fetchLineChartData = async () => {
      await withMinLoading(
        async () => {
          try {
            const res = await StatisticService.getLineChart(lineYear);
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

            const { commission } = processLineChartData(data, labels);

            setLineChartData({
              labels,
              datasets: [
                {
                  label: t('adminDashboard.lineChart.commission'),
                  data: commission,
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

  //Pie
  useEffect(() => {
    const fetchPieChartChart = async () => {
      await withMinLoading(
        async () => {
          try {
            const res = await StatisticService.getPieChart(pieYear);
            const rawData = res.data;

            let construction = 0,
              repair = 0,
              material = 0;

            for (const item of rawData) {
              if (item.label === 'Construction') construction = item.count;
              if (item.label === 'Repair') repair = item.count;
              if (item.label === 'Material') material = item.count;
            }

            const labels = [
              t('adminDashboard.construction'),
              t('adminDashboard.repair'),
              t('adminDashboard.material'),
            ];

            const values = [construction, repair, material];

            setPieChartData({
              labels,
              datasets: [
                {
                  label: t('adminDashboard.pieChart.serviceRequests'),
                  data: values,
                  backgroundColor: [
                    'rgba(99, 102, 241, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(14, 165, 233, 0.7)',
                  ],
                  borderColor: [
                    'rgb(79, 70, 229)',
                    'rgb(219, 39, 119)',
                    'rgb(2, 132, 199)',
                  ],
                  borderWidth: 1,
                },
              ],
            });
          } catch (err) {
            toast.error(t(handleApiError(err)));
          }
        },
        setLoadingPieChart,
        1000
      );
    };
    fetchPieChartChart();
  }, [pieYear, t]);

  //top
  useEffect(() => {
    const fetchStats = async () => {
      await withMinLoading(
        async () => {
          try {
            const response = await StatisticService.getTopStatistic();
            setTopStats(response.data);
          } catch (err) {
            toast.error(t(handleApiError(err)));
          }
        },
        setLoadingTop,
        1000
      );
    };
    fetchStats();
  }, [t]);

  //stat
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await StatisticService.getStatStatistic();
        setStats(response.data);
      } catch (err) {
        toast.error(t(handleApiError(err)));
      }
    };
    fetchStats();
  }, [t]);

  return (
    <div className="w-full px-6 py-6 mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 -mt-4">
        {/* Card 1 - Total Users */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg rounded-2xl p-4 hover:shadow-xl transition-all duration-300 border border-blue-100 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {t('adminDashboard.totalUser')}
              </p>
              <h5 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalCustomer}
              </h5>
            </div>

            <div className="flex-shrink-0">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg hover:scale-105 transition-transform">
                <i className="fas fa-user-friends text-white text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 - Total Partners */}
        <div className="bg-white shadow-lg rounded-2xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              {t('adminDashboard.totalPartner')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500 mb-0.5">
                  <i className="fas fa-hard-hat text-white text-base"></i>
                </div>
                <p className="text-xs font-medium text-gray-600 mb-0.5 whitespace-nowrap">
                  {t('adminDashboard.contractor')}
                </p>
                <h6 className="text-xl font-bold text-gray-900">
                  {stats.totalContactor}
                </h6>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-500 mb-0.5">
                  <i className="fas fa-truck text-white text-base"></i>
                </div>
                <p className="text-xs font-medium text-gray-600 mb-0.5 whitespace-nowrap">
                  {t('adminDashboard.distributor')}
                </p>
                <h6 className="text-xl font-bold text-gray-900">
                  {stats.totalDistributor}
                </h6>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 - Service Requests */}
        <div className="bg-white shadow-lg rounded-2xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              {t('adminDashboard.serviceRequest')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500 mb-0.5">
                  <i className="fas fa-folder-open text-white text-base"></i>
                </div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">
                  {t('adminDashboard.opening')}
                </p>
                <h6 className="text-xl font-bold text-gray-900">
                  {stats.totalOpening}
                </h6>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-4 hover:border-yellow-500 hover:shadow-md transition-all cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-yellow-500 mb-0.5">
                  <i className="fas fa-dollar-sign text-white text-base"></i>
                </div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">
                  {t('adminDashboard.pendingCommission')}
                </p>
                <h6 className="text-xl font-bold text-gray-900">
                  {stats.totalPendingCommission}
                </h6>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-500 mb-0.5">
                  <i className="fas fa-check-circle text-white text-base"></i>
                </div>
                <p className="text-xs font-medium text-gray-600 mb-0.5 whitespace-nowrap truncate max-w-[100px]">
                  {t('adminDashboard.approved')}
                </p>
                <h6 className="text-xl font-bold text-gray-900">
                  {stats.totalApproved}
                </h6>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4 - Total Commission */}
        <div className="bg-white shadow-lg rounded-2xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {t('adminDashboard.totalCommission')}
              </p>

              <h5
                className="text-2xl font-bold text-gray-900 mb-2 truncate max-w-[180px] sm:max-w-[220px] md:max-w-[260px]"
                title={new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(stats.totalCommission)}
              >
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(stats.totalCommission)}
              </h5>
            </div>

            <div className="flex-shrink-0">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg hover:scale-105 transition-transform">
                <i className="fas fa-hand-holding-dollar text-white text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
        {/* Line Chart */}
        <div className="lg:col-span-7 relative">
          {loadingLineChart && (
            <div className="absolute inset-0 bg-white backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
              <LoadingComponent />
            </div>
          )}
          <LineChart
            type="Admin"
            title={t('adminDashboard.lineChart.commissionRevenue')}
            data={lineChartData}
            year={lineYear}
            onYearChange={setLineYear}
            loading={loadingLineChart}
          />
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-5 relative">
          {loadingPieChart && (
            <div className="absolute inset-0 bg-white backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
              <LoadingComponent />
            </div>
          )}
          <PieChart
            type="Admin"
            title={t('adminDashboard.pieChart.serviceRequests')}
            data={pieChartData}
            year={pieYear}
            onYearChange={setPieYear}
            loading={loadingPieChart}
          />
        </div>
      </div>

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

      {/* Top Contractors & Distributors */}
      {loadingTop ? (
        <div className="mt-6">
          <LoadingComponent />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Top Contractors */}
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h6 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fas fa-trophy text-yellow-300"></i>
                  {t('adminDashboard.contractors.title')}
                </h6>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20">
                  <i className="fas fa-hard-hat text-white text-sm"></i>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-100">
                    {topStats?.topContractors?.length > 0 ? (
                      topStats.topContractors.map((contractor, index) => (
                        <tr
                          key={contractor.contractorEmail}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar
                                  name={contractor?.contractorEmail || 'User'}
                                  round={true}
                                  size="48"
                                  className="ring-2 ring-blue-100"
                                />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-0.5">
                                  {t('adminDashboard.contractors.email')}
                                </p>
                                <h6 className="text-sm font-semibold text-gray-900">
                                  {contractor.contractorEmail}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <div className="inline-flex flex-col items-center px-3 py-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                {t('adminDashboard.contractors.serviceRequest')}
                              </p>
                              <h6 className="text-base font-bold text-gray-800">
                                {contractor.contractorApprovedCount}
                              </h6>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                {t('adminDashboard.contractors.revenue')}
                              </p>
                              <h6 className="text-sm font-bold text-green-600">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(contractor.contractorTotalRevenue)}
                              </h6>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-8 text-center">
                          <i className="fas fa-inbox text-gray-300 text-4xl mb-2"></i>
                          <p className="text-gray-500 italic">
                            {t('adminDashboard.contractors.noTop')}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() =>
                    navigate(`/Admin/UserManager?filter=contractor`)
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 px-4 py-2 transition-colors"
                >
                  {t('adminDashboard.viewAll')}
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Top Distributors */}
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h6 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fas fa-trophy text-yellow-300"></i>
                  {t('adminDashboard.distributors.title')}
                </h6>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20">
                  <i className="fas fa-truck text-white text-sm"></i>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-100">
                    {topStats?.topDistributors?.length > 0 ? (
                      topStats.topDistributors.map((distributor, index) => (
                        <tr
                          key={distributor.distributorEmail}
                          className="hover:bg-green-50 transition-colors"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar
                                  name={distributor?.distributorEmail || 'User'}
                                  round={true}
                                  size="48"
                                  className="ring-2 ring-green-100"
                                />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-0.5">
                                  {t('adminDashboard.distributors.email')}
                                </p>
                                <h6 className="text-sm font-semibold text-gray-900">
                                  {distributor.distributorEmail}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <div className="inline-flex flex-col items-center px-3 py-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                {t(
                                  'adminDashboard.distributors.materialRequest'
                                )}
                              </p>
                              <h6 className="text-base font-bold text-gray-800">
                                {distributor.distributorApprovedCount}
                              </h6>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                {t('adminDashboard.distributors.revenue')}
                              </p>
                              <h6 className="text-sm font-bold text-green-600">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(distributor.distributorTotalRevenue)}
                              </h6>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-8 text-center">
                          <i className="fas fa-inbox text-gray-300 text-4xl mb-2"></i>
                          <p className="text-gray-500 italic">
                            {t('adminDashboard.distributors.noTop')}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() =>
                    navigate(`/Admin/UserManager?filter=distributor`)
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 px-4 py-2 transition-colors"
                >
                  {t('adminDashboard.viewAll')}
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
