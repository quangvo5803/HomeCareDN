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

  const {
    partners,
    totalPartners,
    loading,
    fetchPartners,
  } = usePartner();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // modal

  useEffect(() => {
    fetchPartners({ PageNumber: currentPage, PageSize: pageSize, SortBy: 'createdat_desc' });
  }, [currentPage, fetchPartners]);

  const toStatusString = useCallback((s) => {
    if (typeof s === 'string') return s;
    return ['Pending', 'Approved', 'Rejected'][s] ?? String(s);
  }, []);

  const filtered = useMemo(() => {
    let list = partners || [];
    if (statusFilter !== 'All') list = list.filter(p => p.status === statusFilter);
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
          <h1 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
            <i className="mr-3 fa-solid fa-handshake" aria-hidden="true"></i>
            {t('adminPartnerManager.title', 'Partners')}
          </h1>
          <p className="text-gray-600">{t('adminPartnerManager.subtitle', 'Review and manage partner applications')}</p>
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <label htmlFor="status-filter" className="sr-only">
              {t('common.filter_by_status', 'Filter by status')}
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">{t('common.all', 'All')}</option>
              <option value="Pending">{t('partner.status.pending', 'Pending')}</option>
              <option value="Approved">{t('partner.status.approved', 'Approved')}</option>
              <option value="Rejected">{t('partner.status.rejected', 'Rejected')}</option>
            </select>
            
            <label htmlFor="search-input" className="sr-only">
              {t('common.search', 'Search partners')}
            </label>
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={t('common.search', 'Search…')}
              className="px-3 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
            <span className="text-sm text-gray-600">
              {t('adminPartnerManager.total', 'Total')}: {totalPartners || 0}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
          <div className="hidden lg:block">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-4 text-xs font-semibold text-center uppercase text-gray-600" scope="col">#</th>
                  <th className="px-6 py-4 text-xs font-semibold text-center uppercase text-gray-600" scope="col">{t('partner.full_name', 'Full name')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-center uppercase text-gray-600" scope="col">{t('partner.company_name', 'Company')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-center uppercase text-gray-600" scope="col">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-center uppercase text-gray-600" scope="col">{t('partner.phone_number', 'Phone')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-center uppercase text-gray-600" scope="col">{t('partner.type', 'Type')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-center uppercase text-gray-600" scope="col">{t('common.status', 'Status')}</th>
                  <th className="px-4 py-4 text-xs font-semibold text-center uppercase text-gray-600" scope="col">{t('adminServiceManager.action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length > 0 ? filtered.map((p, idx) => (
                  <tr key={p.partnerID} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                    <td className="px-4 py-4 text-center">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-6 py-4 text-center text-black">{p.fullName}</td>
                    <td className="px-6 py-4 text-center text-black">{p.companyName}</td>
                    <td className="px-6 py-4 text-center text-black">{p.email}</td>
                    <td className="px-6 py-4 text-center text-black">{p.phoneNumber}</td>
                    <td className="px-6 py-4 text-center text-black">{p.partnerType}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={toStatusString(p.status)} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          onClick={() => handleViewPartner(p)}
                          aria-label={t('adminPartnerManager.view_partner', 'View partner {{name}}', { name: p.fullName || p.companyName })}
                        >
                          {t('BUTTON.View', 'View')}
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      {t('adminPartnerManager.empty', 'No partner found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden">
            <div className="space-y-4 p-4">
              {filtered.length > 0 ? filtered.map((p) => (
                <div key={p.partnerID} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.fullName}</h3>
                      <p className="text-sm text-gray-600">{p.companyName}</p>
                    </div>
                    <StatusBadge status={toStatusString(p.status)} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Email:</span> {p.email}</div>
                    <div><span className="font-medium">Phone:</span> {p.phoneNumber}</div>
                    <div><span className="font-medium">Type:</span> {p.partnerType}</div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      onClick={() => handleViewPartner(p)}
                      aria-label={t('adminPartnerManager.view_partner', 'View partner {{name}}', { name: p.fullName || p.companyName })}
                    >
                      {t('BUTTON.View', 'View')}
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-500">
                  {t('adminPartnerManager.empty', 'No partner found')}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPartners > 0 && (
            <div className="flex justify-center py-4 border-t border-gray-200">
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

      {/* Modal */}
      <PartnerModal
        isOpen={!!selected}
        onClose={handleCloseModal}
        partner={selected}
      />
    </div>
  );
}

// StatusBadge component with proper PropTypes validation
function StatusBadge({ status }) {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Approved: 'bg-green-100 text-green-800 border-green-300',
    Rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span 
      className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${map[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}

// PropTypes validation for StatusBadge component
StatusBadge.propTypes = {
  status: PropTypes.oneOf(['Pending', 'Approved', 'Rejected']).isRequired,
};
