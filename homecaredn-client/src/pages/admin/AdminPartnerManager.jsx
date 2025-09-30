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
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            <i className="fa-solid fa-handshake mr-3" aria-hidden="true" />
            {t('adminPartnerManager.title', 'Partners')}
          </h1>
          <p className="text-gray-600">{t('adminPartnerManager.subtitle', 'Review and manage partner applications')}</p>
        </header>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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
            <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true" />
            <span className="text-sm text-gray-600">
              {t('adminPartnerManager.total')}: {totalPartners || 0}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="px-4 py-4 text-xs font-semibold text-center text-gray-600 uppercase">#</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-center text-gray-600 uppercase">{t('partner.full_name', 'Full name')}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-center text-gray-600 uppercase">{t('partner.company_name', 'Company')}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-center text-gray-600 uppercase">Email</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-center text-gray-600 uppercase">{t('partner.phone_number', 'Phone')}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-center text-gray-600 uppercase">{t('partner.type')}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-center text-gray-600 uppercase">{t('common.status', 'Status')}</th>
                  <th scope="col" className="px-4 py-4 text-xs font-semibold text-center text-gray-600 uppercase">{t('adminServiceManager.action', 'Action')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((p, idx) => (
                  <tr key={p.partnerID} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-center">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-6 py-4 text-center">{p.fullName}</td>
                    <td className="px-6 py-4 text-center">{p.companyName}</td>
                    <td className="px-6 py-4 text-center">{p.email}</td>
                    <td className="px-6 py-4 text-center">{p.phoneNumber}</td>
                    <td className="px-6 py-4 text-center">{p.partnerType}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={toStatusString(p.status)} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleViewPartner(p)}
                        aria-label={t('adminPartnerManager.view_partner', 'View partner {{name}}', { name: p.fullName || p.companyName })}
                        className="px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                      >
                        {t('BUTTON.View', 'View')}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500">
                      {t('adminPartnerManager.empty', 'No partner found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden p-4 space-y-4">
            {filtered.length > 0 ? filtered.map(p => (
              <div key={p.partnerID} className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.fullName}</h3>
                    <p className="text-sm text-gray-600">{p.companyName}</p>
                  </div>
                  <StatusBadge status={toStatusString(p.status)} />
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {p.email}</div>
                  <div><strong>Phone:</strong> {p.phoneNumber}</div>
                  <div><strong>Type:</strong> {p.partnerType}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleViewPartner(p)}
                  aria-label={t('adminPartnerManager.view_partner', 'View partner {{name}}', { name: p.fullName || p.companyName })}
                  className="mt-4 w-full py-2 bg-white border rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                  {t('BUTTON.View', 'View')}
                </button>
              </div>
            )) : (
              <div className="py-12 text-center text-gray-500">
                {t('adminPartnerManager.empty', 'No partner found')}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPartners > 0 && (
            <footer className="py-4 border-t border-gray-200 flex justify-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalPartners}
                onChange={handlePageChange}
                showSizeChanger={false}
                size="small"
                aria-label={t('common.pagination', 'Pagination navigation')}
              />
            </footer>
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

// StatusBadge component with semantic output
function StatusBadge({ status }) {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Approved: 'bg-green-100 text-green-800 border-green-300',
    Rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <output
      className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${map[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
      aria-label={`Status: ${status}`}
    >
      {status}
    </output>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['Pending', 'Approved', 'Rejected']).isRequired,
};
