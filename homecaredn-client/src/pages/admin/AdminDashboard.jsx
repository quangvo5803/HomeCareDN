import LineChart from '../../components/LineChart';
import PieChart from '../../components/PieChart';
import { useTranslation } from 'react-i18next';
import Avatar from 'react-avatar';
import { useEffect, useState } from "react";
import { StatisticService } from '../../services/statisticService';
import { toast } from 'react-toastify';
import { handleApiError } from '../../utils/handleApiError';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const [lineYear, setLineYear] = useState(new Date().getFullYear());
  const [pieYear, setPieYear] = useState(new Date().getFullYear());
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
  const [topStats, setTopStats] = useState({ topContractors: [], topDistributors: [] });

  // đường
  // 👉 Hàm xử lý dữ liệu tách riêng
  const processLineChartData = (data, labels) => {
    const getMonthlyValues = (key) =>
      labels.map((_, i) => {
        const found = data.find((d) => d.month === i + 1);
        return found ? found[key] : 0;
      });

    return {
      repair: getMonthlyValues("repairCount"),
      construction: getMonthlyValues("constructionCount"),
    };
  };

  useEffect(() => {
    const fetchLineChartData = async () => {
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

        // 👉 Dữ liệu đã được xử lý gọn gàng hơn
        const { repair, construction } = processLineChartData(data, labels);

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
          ],
        });
      } catch (error) {
        console.error("Error fetching line chart data:", error);
      }
    };

    fetchLineChartData();
  }, [lineYear, t]);


  //tròn
  useEffect(() => {
    const fetchPieChartChart = async () => {
      try {
        const res = await StatisticService.getPieChart(pieYear);
        const rawData = res.data;

        let construction = 0, repair = 0, material = 0;

        for (const item of rawData) {
          if (item.serviceType === "Construction") construction = item.count;
          if (item.serviceType === "Repair") repair = item.count;
          if (item.serviceType === "Material") material = item.count;
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
                "rgba(79, 70, 229, 0.7)",   // xanh indigo
                "rgba(251, 146, 60, 0.7)",  // cam
                "rgba(16, 185, 129, 0.7)",  // xanh ngọc
              ],
              borderColor: [
                "rgb(67, 56, 202)",
                "rgb(234, 88, 12)",
                "rgb(5, 150, 105)",
              ],

              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        toast.error(t(handleApiError(err)));
      }
    };
    fetchPieChartChart();
  }, [pieYear, t]);



  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await StatisticService.getTopStatistic();
        setTopStats(response.data);
      } catch (err) {
        toast.error(t(handleApiError(err)));
      }
    };
    fetchStats();
  }, [t]);

  return (
    <div className="w-full px-6 py-6 mx-auto">
      {/* row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="flex flex-col h-full bg-white shadow-xl  rounded-2xl p-4">
          <div className="flex flex-row -mx-3">
            <div className="flex-none w-2/3 max-w-full px-3">
              <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase ">
                {t('adminDashboard.statisticMoney.todayMoney')}
              </p>
              <h5 className="mb-2 font-bold ">$53,000</h5>
              <p className="mb-0 ">
                <span className="text-sm font-bold leading-normal text-emerald-500">
                  +55%
                </span>
                {t('adminDashboard.statisticMoney.sinceLastMonth')}
              </p>
            </div>
            {/* Icon */}
            <div className="px-3 text-right basis-1/3">
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-gradient-to-tl  from-emerald-500 to-teal-400">
                <i className="fa-solid fa-money-bill-trend-up text-lg text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col h-full bg-white shadow-xl rounded-2xl p-4">
          <div className="flex flex-row -mx-3">
            <div className="flex-none w-2/3 max-w-full px-3">
              <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase">
                {t('adminDashboard.statisticUser.todayUsers')}
              </p>
              <h5 className="mb-2 font-bold ">2,300</h5>
              <p className="mb-0">
                <span className="text-sm font-bold leading-normal text-emerald-500">
                  +3%
                </span>
                {t('adminDashboard.statisticUser.sinceLastMonth')}
              </p>
            </div>
            <div className="px-3 text-right basis-1/3">
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-gradient-to-tl from-red-600 to-orange-600">
                <i className="fa-solid fa-users text-lg text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col h-full bg-white shadow-xl rounded-2xl p-4">
          <div className="flex flex-row -mx-3">
            <div className="flex-none w-2/3 max-w-full px-3">
              <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase">
                {t('adminDashboard.statisticServiceRequest.newServiceRequest')}
              </p>
              <h5 className="mb-2 font-bold">+3,462</h5>
              <p className="mb-0 ">
                <span className="text-sm font-bold leading-normal text-red-600">
                  -2%
                </span>
                {t('adminDashboard.statisticServiceRequest.sinceLastMonth')}
              </p>
            </div>
            <div className="px-3 text-right basis-1/3">
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-gradient-to-tl from-orange-500 to-yellow-400">
                <i className="fa-solid fa-clipboard-list text-lg text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col h-full bg-white shadow-xl rounded-2xl p-4">
          <div className="flex flex-row -mx-3">
            <div className="flex-none w-2/3 max-w-full px-3">
              <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase ">
                {t('adminDashboard.statisticSales.sales')}
              </p>
              <h5 className="mb-2 font-bold">$103,430</h5>
              <p className="mb-0">
                <span className="text-sm font-bold leading-normal text-emerald-500">
                  +5%
                </span>
                {t('adminDashboard.statisticSales.sinceLastMonth')}
              </p>
            </div>
            <div className="px-3 text-right basis-1/3">
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-gradient-to-tl from-blue-500 to-violet-500">
                <i className="fa-solid fa-truck text-lg text-white"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* biểu đồ*/}
      <div className="flex flex-wrap mt-6 -mx-3">
        {/* biểu đồ đường*/}
        <div className="w-full max-w-full px-3 mt-0 lg:w-7/12 lg:flex-none">
          <LineChart
            type='Admin'
            title={t("adminDashboard.lineChart.salesOverview")}
            data={lineChartData}
            year={lineYear}
            onYearChange={setLineYear}
          />
        </div>

        {/* biểu đồ tròn */}
        <div className="w-full max-w-full px-3 lg:w-5/12 lg:flex-none">
          <PieChart
            type="Admin"
            title={t("adminDashboard.pieChart.serviceRequests")}
            data={pieChartData}
            year={pieYear}
            onYearChange={setPieYear}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-stretch mt-6 -mx-3">
        {/* Card 1 */}
        <div className="w-full px-3 mb-6 lg:mb-0 lg:w-6/12 flex">
          <div className="flex flex-col flex-1 bg-white border border-gray-200 shadow-xl rounded-2xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 rounded-t-2xl">
              <h6 className="text-base font-semibold text-black">
                {t('adminDashboard.contractors.title')}
              </h6>
            </div>

            {/* Body + nút */}
            <div className="flex flex-col justify-between flex-1 p-4 overflow-x-auto">
              <div>
                {/* Bảng nội dung */}
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-200">
                    {topStats?.topContractors?.length > 0 ? (
                      topStats.topContractors.map((contractor) => (
                        <tr key={contractor.email}>
                          <td className="p-3">
                            <div className="flex items-center">
                              <Avatar
                                name={contractor?.email || 'User'}
                                round={true}
                                size="48"
                                className="w-12 h-12 rounded-full"
                              />
                              <div className="ml-4">
                                <p className="text-xs font-semibold text-gray-500">
                                  {t('adminDashboard.contractors.email')}
                                </p>
                                <h6 className="text-sm font-medium text-black">
                                  {contractor.email}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <p className="text-xs font-semibold text-gray-500">
                              {t('adminDashboard.contractors.serviceRequest')}
                            </p>
                            <h6 className="text-sm text-black">{contractor.approvedCount}</h6>
                          </td>
                          <td className="p-3 text-center">
                            <p className="text-xs font-semibold text-gray-500">
                              {t('adminDashboard.contractors.revenue')}
                            </p>
                            <h6 className="text-sm text-black">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(contractor.totalRevenue)}
                            </h6>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 text-center text-gray-500 italic">
                          {t('adminDashboard.contractors.noTop')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Button luôn ở đáy */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => console.log('View all clicked')}
                  className="text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 px-3 py-1"
                >
                  {t('adminDashboard.viewAll')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="w-full px-3 mb-6 lg:mb-0 lg:w-6/12 flex">
          <div className="flex flex-col flex-1 bg-white border border-gray-200 shadow-xl rounded-2xl">
            <div className="p-4 border-b border-gray-200 rounded-t-2xl">
              <h6 className="text-base font-semibold text-black">
                {t('adminDashboard.distributors.title')}
              </h6>
            </div>

            <div className="flex flex-col justify-between flex-1 p-4 overflow-x-auto">
              <div>
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-200">
                    {topStats?.topDistributors?.length > 0 ? (
                      topStats.topDistributors.map((distributor) => (
                        <tr key={distributor.email}>
                          <td className="p-3">
                            <div className="flex items-center">
                              <Avatar
                                name={distributor?.email || 'User'}
                                round={true}
                                size="48"
                                className="w-12 h-12 rounded-full"
                              />
                              <div className="ml-4">
                                <p className="text-xs font-semibold text-gray-500">
                                  {t('adminDashboard.distributors.email')}
                                </p>
                                <h6 className="text-sm font-medium text-black">
                                  {distributor.email}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <p className="text-xs font-semibold text-gray-500">
                              {t('adminDashboard.distributors.materialRequest')}
                            </p>
                            <h6 className="text-sm text-black">{distributor.approvedCount}</h6>
                          </td>
                          <td className="p-3 text-center">
                            <p className="text-xs font-semibold text-gray-500">
                              {t('adminDashboard.distributors.revenue')}
                            </p>
                            <h6 className="text-sm text-black">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(distributor.totalRevenue)}
                            </h6>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 text-center text-gray-500 italic">
                          {t('adminDashboard.distributors.noTop')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => console.log('View all clicked')}
                  className="text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 px-3 py-1"
                >
                  {t('adminDashboard.viewAll')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
