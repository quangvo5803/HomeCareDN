import LineChart from '../../components/LineChart';
import PieChart from '../../components/PieChart';
import { useTranslation } from 'react-i18next';
import Avatar from 'react-avatar';
import { useEffect, useState } from "react";
import { StatisticService } from '../../services/statisticService';
import { toast } from 'react-toastify';
import { handleApiError } from '../../utils/handleApiError';
import LoadingComponent from '../../components/LoadingComponent';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const [lineYear, setLineYear] = useState(new Date().getFullYear());
  const [pieYear, setPieYear] = useState(new Date().getFullYear());
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
  const [topStats, setTopStats] = useState({ topContractors: [], topDistributors: [] });
  const [stats, setStats] = useState({
    totalCustomer: 0,
    totalContactor: 0,
    totalDistributor: 0,
    totalPending: 0,
    totalPendingCommission: 0,
    totalCommission: 0,
  });
  const [loadingStat, setLoadingStat] = useState(false);
  const [loadingLineChart, setLoadingLineChart] = useState(false);
  const [loadingPieChart, setLoadingPieChart] = useState(false);
  const [loadingTop, setLoadingTop] = useState(false);

  //Line
  const getMonthlyValue = (data, month, key) => {
    const found = data.find((d) => d.month === month);
    return found ? found[key] : 0;
  };

  const getMonthlyDataset = (data, labels, key) =>
    labels.map((_, i) => getMonthlyValue(data, i + 1, key));

  const processLineChartData = (data, labels) => ({
    repair: getMonthlyDataset(data, labels, "repairCount"),
    construction: getMonthlyDataset(data, labels, "constructionCount"),
    material: getMonthlyDataset(data, labels, "materialCount")
  });

  useEffect(() => {
    const fetchLineChartData = async () => {
      setLoadingLineChart(true);
      try {
        const res = await StatisticService.getLineChart(lineYear);
        const data = res.data;

        const labels = [
          t("adminDashboard.lineChart.months.jan"),
          t("adminDashboard.lineChart.months.feb"),
          t("adminDashboard.lineChart.months.mar"),
          t("adminDashboard.lineChart.months.apr"),
          t("adminDashboard.lineChart.months.may"),
          t("adminDashboard.lineChart.months.jun"),
          t("adminDashboard.lineChart.months.jul"),
          t("adminDashboard.lineChart.months.aug"),
          t("adminDashboard.lineChart.months.sep"),
          t("adminDashboard.lineChart.months.oct"),
          t("adminDashboard.lineChart.months.nov"),
          t("adminDashboard.lineChart.months.dec"),
        ];

        const { repair, construction, material } = processLineChartData(data, labels);

        setLineChartData({
          labels,
          datasets: [
            {
              label: t("adminDashboard.repair"),
              data: repair,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.2)",
              fill: true,
            },
            {
              label: t("adminDashboard.construction"),
              data: construction,
              borderColor: "#10b981",
              backgroundColor: "rgba(16,185,129,0.2)",
              fill: true,
            },
            {
              label: t("adminDashboard.material"),
              data: material,
              borderColor: "#f97316",
              backgroundColor: "rgba(249,115,22,0.2)",
              fill: true,
            }
          ],
        });
      } catch (err) {
        toast.error(t(handleApiError(err)));
      } finally {
        setLoadingLineChart(false);
      }
    };

    fetchLineChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineYear, t]);


  //Pie
  useEffect(() => {
    const fetchPieChartChart = async () => {
      setLoadingPieChart(true)
      try {
        const res = await StatisticService.getPieChart(pieYear);
        const rawData = res.data;

        let construction = 0, repair = 0, material = 0;

        for (const item of rawData) {
          if (item.label === "Construction") construction = item.count;
          if (item.label === "Repair") repair = item.count;
          if (item.label === "Material") material = item.count;
        }

        const labels = [
          t("adminDashboard.construction"),
          t("adminDashboard.repair"),
          t("adminDashboard.material"),
        ];

        const values = [construction, repair, material];

        setPieChartData({
          labels,
          datasets: [
            {
              label: t("adminDashboard.pieChart.serviceRequests"),
              data: values,
              backgroundColor: [
                "rgba(99, 102, 241, 0.7)",
                "rgba(236, 72, 153, 0.7)",
                "rgba(14, 165, 233, 0.7)",
              ],
              borderColor: [
                "rgb(79, 70, 229)",
                "rgb(219, 39, 119)",
                "rgb(2, 132, 199)",
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        toast.error(t(handleApiError(err)));
      } finally {
        setLoadingPieChart(false);
      }
    };
    fetchPieChartChart();
  }, [pieYear, t]);

  //top
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingTop(true);
      try {
        const response = await StatisticService.getTopStatistic();
        setTopStats(response.data);
      } catch (err) {
        toast.error(t(handleApiError(err)));
      } finally {
        setLoadingTop(false);
      }
    };
    fetchStats();
  }, [t]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await StatisticService.getStatStatistic();
        setStats(response.data);
      } catch (err) {
        toast.error(t(handleApiError(err)));
      } finally {
        setLoadingStat(false)
      }
    }
    fetchStats();
  }, [t]);

  return (
    <div className="w-full px-6 py-6 mx-auto">
      {/* Stats Cards */}
      {loadingStat ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 -mt-4">
          <LoadingComponent />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 -mt-4">
          {/* Card 1 - Total Users */}
          <div className="bg-white shadow-lg rounded-2xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t('adminDashboard.totalUser')}
                </p>
                <h5 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalCustomer}</h5>
              </div>

              <div className="flex-shrink-0">
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg hover:scale-105 transition-transform">
                  <i className="fas fa-users text-white text-2xl"></i>
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
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md hover:scale-105 transition-transform">
                <i className="fas fa-handshake text-white text-base"></i>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500 mb-0.5">
                    <i className="fas fa-hard-hat text-white text-base"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">{t('adminDashboard.contractor')}</p>
                  <h6 className="text-xl font-bold text-gray-900">{stats.totalContactor}</h6>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-500 mb-0.5">
                    <i className="fas fa-truck text-white text-base"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">{t('adminDashboard.distributor')}</p>
                  <h6 className="text-xl font-bold text-gray-900">{stats.totalDistributor}</h6>
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
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-md hover:scale-105 transition-transform">
                <i className="fas fa-clipboard-list text-white text-base"></i>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-500 mb-0.5">
                    <i className="fas fa-clock text-white text-base"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">{t('adminDashboard.pending')}</p>
                  <h6 className="text-xl font-bold text-gray-900">{stats.totalPending}</h6>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-4 hover:border-yellow-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-yellow-500 mb-0.5">
                    <i className="fas fa-dollar-sign text-white text-base"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">{t('adminDashboard.PendingCommission')}</p>
                  <h6 className="text-xl font-bold text-gray-900">{stats.totalPendingCommission}</h6>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 - Total Commission */}
          <div className="bg-white shadow-lg rounded-2xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t('adminDashboard.totalCommission')}
                </p>
                <h5 className="text-3xl font-bold text-gray-900 mb-2">
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
      )
      }

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
        {/* Line Chart */}
        <div className="lg:col-span-7">
          <LineChart
            type='Admin'
            title={t("adminDashboard.lineChart.salesOverview")}
            data={lineChartData}
            year={lineYear}
            onYearChange={setLineYear}
            loading={loadingLineChart}
          />
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-5">
          <PieChart
            type="Admin"
            title={t("adminDashboard.pieChart.serviceRequests")}
            data={pieChartData}
            year={pieYear}
            onYearChange={setPieYear}
            loading={loadingPieChart}
          />
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
                        <tr key={contractor.contractorEmail} className="hover:bg-blue-50 transition-colors">
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
                  onClick={() => console.log('View all clicked')}
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
                        <tr key={distributor.distributorEmail} className="hover:bg-green-50 transition-colors">
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
                                {t('adminDashboard.distributors.materialRequest')}
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
                  onClick={() => console.log('View all clicked')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 px-4 py-2 transition-colors"
                >
                  {t('adminDashboard.viewAll')}
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
