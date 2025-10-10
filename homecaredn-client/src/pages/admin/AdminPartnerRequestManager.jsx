import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import { usePartnerRequest } from '../../hook/usePartnerRequest';
import PartnerRequestModal from '../../components/modal/PartnerRequestModal';
import Loading from '../../components/Loading';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';

export default function AdminPartnerRequestManager() {
  const { t } = useTranslation();
  const pageSize = 5;

  const {
    partnerRequests,
    totalPartnerRequests,
    loading,
    deletePartnerRequest,
    fetchPartnerRequests,
  } = usePartnerRequest();

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [debouncedSearch] = useDebounce(search, 1000);
  const [partnerRequestID, setPartnerRequestID] = useState(null);
  const [filter, setFilter] = useState('all');

  // fetch data
  useEffect(() => {
    fetchPartnerRequests({
      PageNumber: currentPage,
      PageSize: pageSize,
      Search: debouncedSearch || '',
      SortBy: sortBy,
      FilterPartnerRequestStatus: filter === 'all' ? null : filter,
    });
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    sortBy,
    filter,
    fetchPartnerRequests,
  ]);
  const partnerTypeColors = {
    Contractor: 'bg-blue-100 text-blue-800',
    Distributor: 'bg-purple-100 text-purple-800',
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteBrandModal.title',
      textKey: 'ModalPopup.DeleteBrandModal.text',
      onConfirm: async () => {
        await deletePartnerRequest(id);

        const lastPage = Math.ceil((totalPartnerRequests - 1) / pageSize);
        if (currentPage > lastPage) {
          setCurrentPage(lastPage || 1);
        } else {
          fetchPartnerRequests({
            PageNumber: currentPage,
            PageSize: pageSize,
            SortBy: sortBy,
            Search: debouncedSearch || '',
          });
        }

        toast.success(t('SUCCESS.DELETE'));
      },
    });
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
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 border-b border-gray-200 bg-gray-50">
            {/* Left: Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder={t('common.search')}
                className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">{t('common.sortDefault')}</option>
                <option value="companyname">{t('common.sortName')}</option>
                <option value="companynamedesc">
                  {t('common.sortNameDesc')}
                </option>
              </select>
            </div>

            {/* Right: Filter Buttons */}
            <div className="flex flex-wrap justify-end gap-2">
              {[
                {
                  key: 'all',
                  label: t('adminSupportManager.all'),
                  color: 'blue',
                },
                {
                  key: 'Pending',
                  label: t('adminSupportManager.pending'),
                  color: 'amber',
                },
                {
                  key: 'Approved',
                  label: t('adminSupportManager.processed'),
                  color: 'green',
                },
                {
                  key: 'Rejected',
                  label: t('adminSupportManager.rejected'),
                  color: 'red',
                },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150 ${
                    filter === key
                      ? `bg-${color}-600 text-white border-${color}-600`
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
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
                      {t('adminPartnerManager.no')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminPartnerManager.companyName')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminPartnerManager.phoneNumber')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminPartnerManager.partnerRequestType')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminPartnerManager.status')}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminServiceManager.action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {partnerRequests && partnerRequests.length > 0 ? (
                    partnerRequests.map((partnerRequest, idx) => {
                      return (
                        <tr
                          key={partnerRequest.partnerRequestID}
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
                            <div className="text-sm text-gray-900">
                              {partnerRequest.companyName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center align-middle">
                            <div className="text-sm text-gray-900">
                              {partnerRequest.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center align-middle">
                            <div className="text-sm text-gray-900">
                              {partnerRequest.phoneNumber}
                            </div>
                          </td>

                          {/* PartnerType enum */}
                          <td className="px-6 py-4 text-center align-middle">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                partnerTypeColors[
                                  partnerRequest.partnerRequestType
                                ] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {t(
                                `Enums.PartnerType.${partnerRequest.partnerRequestType}`
                              )}
                            </span>
                          </td>

                          {/* Status enum */}
                          <td className="px-6 py-4 text-center align-middle">
                            <StatusBadge status={partnerRequest.status} />
                          </td>

                          <td className="px-4 py-4 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => {
                                setIsModalOpen(true);
                                setPartnerRequestID(
                                  partnerRequest.partnerRequestID
                                );
                              }}
                              className="mr-2 inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-150"
                            >
                              {t('BUTTON.View')}
                            </button>
                            {partnerRequest?.status === 'Rejected' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(partnerRequest.partnerRequestID)
                                }
                                className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-150"
                              >
                                {t('BUTTON.Delete')}
                              </button>
                            )}
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
            {totalPartnerRequests > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                {/* Total count (left) */}
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>
                    {totalPartnerRequests} {t('adminPartnerManager.partners')}
                  </span>
                </div>

                {/* Pagination (right) */}
                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalPartnerRequests}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    size="small"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <PartnerRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPartnerRequestID(null);
        }}
        partnerRequestID={partnerRequestID}
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
