import SalesChart from '../../components/LineChart';
import PieChart from '../../components/PieChart';
import { useTranslation } from 'react-i18next';
import Avatar from 'react-avatar';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const contractorsList = [
    {
      id: 1,
      email: 'phuc@example.com',
      serviceRequest: 2500,
      values: 230900,
    },
    {
      id: 2,
      email: 'lan@example.com',
      serviceRequest: 1800,
      values: 150300,
    },
    {
      id: 3,
      email: 'huy@example.com',
      serviceRequest: 3100,
      values: 420000,
    },
    {
      id: 4,
      email: 'minh@example.com',
      serviceRequest: 2900,
      values: 380750,
    },
    {
      id: 5,
      email: 'anh@example.com',
      serviceRequest: 2000,
      values: 195600,
    },
  ];

  const distributorsList = [
    {
      id: 1,
      email: 'phuc@example.com',
      serviceRequest: 2500,
      values: 230900,
    },
    {
      id: 2,
      email: 'lan@example.com',
      serviceRequest: 1800,
      values: 15030,
    },
    {
      id: 3,
      email: 'huy@example.com',
      serviceRequest: 3100,
      values: 420000,
    },
    {
      id: 4,
      email: 'minh@example.com',
      serviceRequest: 2900,
      values: 380750,
    },
    {
      id: 5,
      email: 'anh@example.com',
      serviceRequest: 2000,
      values: 195600,
    },
  ];

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
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-gradient-to-tl from-blue-500 to-violet-500">
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
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-gradient-to-tl from-emerald-500 to-teal-400">
                <i className="fa-solid fa-hippo text-lg text-white"></i>
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
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-gradient-to-tl from-orange-500 to-yellow-500">
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
          <SalesChart />
        </div>

        {/* biểu đồ tròn */}
        <div className="w-full max-w-full px-3 lg:w-5/12 lg:flex-none">
          <PieChart />
        </div>
      </div>
      {/* top thầu */}
      <div className="flex flex-wrap mt-6 -mx-3">
        {/* Top Contractors */}
        <div className="w-full px-3 mb-6 lg:mb-0 lg:w-6/12">
          <div className="relative flex flex-col min-w-0 break-words bg-white  border border-gray-200 shadow-xl rounded-2xl">
            <div className="p-4 border-b border-gray-200  rounded-t-2xl">
              <h6 className="text-base font-semibold text-black ">
                {t('adminDashboard.contractors.title')}
              </h6>
            </div>
            <div className="flex-auto p-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-gray-200 ">
                  {contractorsList.map((contractor) => {
                    return (
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
                              <h6 className="text-sm font-medium text-black ">
                                {contractor.email}
                              </h6>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <p className="text-xs font-semibold text-gray-500">
                            {t('adminDashboard.contractors.serviceRequest')}
                          </p>
                          <h6 className="text-sm text-black ">
                            {contractor.serviceRequest}
                          </h6>
                        </td>
                        <td className="p-3 text-center">
                          <p className="text-xs font-semibold text-gray-500">
                            {t('adminDashboard.contractors.values')}
                          </p>
                          <h6 className="text-sm text-black ">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(contractor.values)}
                          </h6>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Nút View All */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => console.log('View all clicked')}
                  className="text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  {t('adminDashboard.viewAll')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Distributors */}
        <div className="w-full px-3 mb-6 lg:mb-0 lg:w-6/12">
          <div className="relative flex flex-col min-w-0 break-words bg-white  border-gray-200 shadow-xl rounded-2xl">
            <div className="p-4 border-b border-gray-200  rounded-t-2xl">
              <h6 className="text-base font-semibold text-black ">
                {t('adminDashboard.distributors.title')}
              </h6>
            </div>
            <div className="flex-auto p-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-gray-200 ">
                  {distributorsList.map((distributor) => {
                    return (
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
                              <h6 className="text-sm font-medium text-black ">
                                {distributor.email}
                              </h6>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <p className="text-xs font-semibold text-gray-500">
                            {t('adminDashboard.contractors.serviceRequest')}
                          </p>
                          <h6 className="text-sm text-black ">
                            {distributor.serviceRequest}
                          </h6>
                        </td>
                        <td className="p-3 text-center">
                          <p className="text-xs font-semibold text-gray-500">
                            {t('adminDashboard.contractors.values')}
                          </p>
                          <h6 className="text-sm text-black ">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(distributor.values)}
                          </h6>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Nút View All */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => console.log('View all clicked')}
                  className="text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
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
