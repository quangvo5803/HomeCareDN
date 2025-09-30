import { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import { usePartner } from '../../hook/usePartner';
import PartnerModal from '../../components/modal/PartnerModal';
import Loading from '../../components/Loading';

export default function AdminPartnerManager() {
  const { t } = useTranslation();
  const pageSize = 10;
  const getPartnerTypeColor = useCallback((partnerType) => {
  const typeColors = {
    'Distributor': 'text-blue-800 bg-blue-100',
    'Contractor': 'text-purple-800 bg-purple-100',
  };
  
  return typeColors[partnerType] || 'text-gray-800 bg-gray-100';
}, []);
  const {
    partners,
    totalPartners,
    loading,
    fetchPartners,
  } = usePartner();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchPartners({ PageNumber: currentPage, PageSize: pageSize, SortBy: 'createdat_desc' });
  }, [currentPage, fetchPartners]);

  const toStatusString = useCallback((s) => {
    if (typeof s === 'string') return s;
    return ['Pending', 'Approved', 'Rejected'][s] ?? String(s);
  }, []);

  const filtered = useMemo(() => {
    let list = partners || [];
    if (statusFilter !== 'All') {
      list = list.filter(p => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.fullName?.toLowerCase().includes(q) ||
        p.companyName?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phoneNumber?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [partners, statusFilter, search]);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const handleViewPartner = useCallback((partner) => {
    setSelected(partner);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelected(null);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

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
              <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700">
                {totalPartners || 0} {t('adminPartnerManager.partners', 'Partners')}
              </span>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="status-filter" className="sr-only">
                {t('common.filter_by_status', 'Filter by status')}
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">{t('common.all', 'All')}</option>
                <option value="Pending">{t('partner.status.pending')}</option>
                <option value="Approved">{t('partner.status.approved')}</option>
                <option value="Rejected">{t('partner.status.rejected')}</option>
              </select>

              <label htmlFor="search-input" className="sr-only">
                {t('common.search')}
              </label>
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={handleSearchChange}
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
                  {filtered.length > 0 ? filtered.map((p, idx) => (
                    <tr 
                      key={p.partnerID} 
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                    >
                      <td className="px-4 py-4 text-center align-middle">
                        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="text-sm font-medium text-gray-900">{p.fullName}</div>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="text-sm text-gray-900">{p.companyName}</div>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="text-sm text-gray-900">{p.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="text-sm text-gray-900">{p.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPartnerTypeColor(p.partnerType)}`}>
                          {p.partnerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <StatusBadge status={toStatusString(p.status)} />
                      </td>
                      <td className="px-4 py-4 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleViewPartner(p)}
                          aria-label={t('adminPartnerManager.view_partner', { name: p.fullName || p.companyName })}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-150"
                        >
                          {t('BUTTON.View')}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
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
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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

            {/* Mobile/Tablet Card Layout */}
            <div className="lg:hidden">
              <div className="p-4 space-y-4">
                {filtered.length > 0 ? filtered.map((p, idx) => (
                  <div key={p.partnerID} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{p.fullName}</h3>
                          <p className="text-sm text-gray-600">{p.companyName}</p>
                        </div>
                      </div>
                      <StatusBadge status={toStatusString(p.status)} />
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Email:</span>
                        <span className="text-gray-900">{p.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Phone:</span>
                        <span className="text-gray-900">{p.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Type:</span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPartnerTypeColor(p.partnerType)}`}>
                          {p.partnerType}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewPartner(p)}
                      aria-label={t('adminPartnerManager.view_partner', 'View partner {{name}}', { name: p.fullName || p.companyName })}
                      className="w-full px-3 py-2 text-sm font-medium border rounded-md border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-150"
                    >
                      {t('BUTTON.View')}
                    </button>
                  </div>
                )) : (
                  <div className="py-12 text-center">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mb-1 text-lg font-medium text-gray-900">
                      {t('adminPartnerManager.empty')}
                    </h3>
                    <p className="text-gray-500">
                      {t('adminPartnerManager.empty_description')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPartners > 0 && (
              <div className="flex justify-center py-4">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalPartners}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  size="small"
                  aria-label={t('common.pagination', 'Pagination navigation')}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <PartnerModal
        isOpen={!!selected}
        onClose={handleCloseModal}
        partner={selected}
      />
    </div>
  );
}

// StatusBadge component with semantic output
function StatusBadge({ status }) {
  const statusMap = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Approved: 'bg-green-100 text-green-800 border-green-300',
    Rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['Pending', 'Approved', 'Rejected']).isRequired,
};
