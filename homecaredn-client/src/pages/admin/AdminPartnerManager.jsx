import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import { usePartner } from '../../hook/usePartner';
import { useEnums } from '../../hook/useEnums';
import PartnerModal from '../../components/modal/PartnerModal';
import Loading from '../../components/Loading';
import { useDebounce } from 'use-debounce';
import i18n from '../../configs/i18n';

export default function AdminPartnerManager() {
  const { t } = useTranslation();
  const enums = useEnums();
  const pageSize = 5;

  const { partners, totalPartners, loading, fetchPartners } = usePartner();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 1000);
  const [selected, setSelected] = useState(null);

  // fetch data
  useEffect(() => {
    fetchPartners({
      PageNumber: currentPage,
      PageSize: pageSize,
      Search: debouncedSearch || '',
      ...(statusFilter !== 'All' && { FilterPartnerStatus: statusFilter }),
    });
  }, [currentPage, pageSize, debouncedSearch, statusFilter, fetchPartners]);
  const partnerTypeColors = {
    Contractor: 'bg-blue-100 text-blue-800', // màu xanh
    Distributor: 'bg-purple-100 text-purple-800', // màu tím
  };
  if (loading) return <Loading />;

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
            <i className="mr-3 fa-solid fa-handshake" aria-hidden="true" />
            {t('adminPartnerManager.title', 'Partners')}
          </h2>
          <p className="text-gray-600">{t('adminPartnerManager.subtitle')}</p>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
          {/* Table Header Actions */}
          <div className="flex flex-col items-start justify-between gap-3 px-4 py-4 border-b border-gray-200 lg:px-6 bg-gray-50 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-gray-700">
                {totalPartners || 0}{' '}
                {t('adminPartnerManager.partners', 'Partners')}
              </span>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Filter by status */}
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">
                  {i18n.language === 'vi' ? 'Tất cả' : 'All'}
                </option>
                {enums?.partnerStatus?.map((s) => (
                  <option key={s.value} value={s.value}>
                    {t(`Enums.PartnerStatus.${s.value}`)}
                  </option>
                ))}
              </select>

              {/* Search */}
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.search')}
                className="px-3 py-2 text-sm border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      #
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('partner.full_name')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('partner.company_name')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('partner.phone_number')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('partner.type')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('common.status')}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminServiceManager.action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {partners && partners.length > 0 ? (
                    partners.map((p, idx) => {
                      return (
                        <tr
                          key={p.partnerID}
                          className={`hover:bg-gray-50 transition-colors duration-150 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-4 text-center align-middle">
                            <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                              {(currentPage - 1) * pageSize + idx + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center align-middle">
                            <div className="text-sm font-medium text-gray-900">
                              {p.fullName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center align-middle">
                            <div className="text-sm text-gray-900">
                              {p.companyName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center align-middle">
                            <div className="text-sm text-gray-900">
                              {p.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center align-middle">
                            <div className="text-sm text-gray-900">
                              {p.phoneNumber}
                            </div>
                          </td>

                          {/* PartnerType enum */}
                          <td className="px-6 py-4 text-center align-middle">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                partnerTypeColors[p.partnerType] ||
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {t(`Enums.PartnerType.${p.partnerType}`)}
                            </span>
                          </td>

                          {/* Status enum */}
                          <td className="px-6 py-4 text-center align-middle">
                            <StatusBadge status={p.status} />
                          </td>

                          <td className="px-4 py-4 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => setSelected(p)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-150"
                            >
                              {t('BUTTON.View')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center mt-5 mb-5">
                          <svg
                            className="w-12 h-12 mb-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <h3 className="mb-1 text-lg font-medium text-gray-900">
                            {t('adminPartnerManager.empty')}
                          </h3>
                          <p className="text-gray-500">
                            {t('adminPartnerManager.empty_description')}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPartners > 0 && (
              <div className="flex justify-center py-4">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalPartners}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <PartnerModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        partner={selected}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Rejected: 'bg-red-100 text-red-800 border-red-300',
    Approved: 'bg-green-100 text-green-800 border-green-300',
  };
  const colorClass =
    statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {t(`Enums.PartnerStatus.${status}`, status)}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
