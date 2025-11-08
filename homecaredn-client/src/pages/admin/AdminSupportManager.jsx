import { useEffect, useState, useCallback } from 'react';
import { Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useDebounce } from 'use-debounce';
import SupportModal from '../../components/modal/SupportModal';
import Loading from '../../components/Loading';
import LoadingComponent from '../../components/LoadingComponent';
import { contactSupportService } from '../../services/contactSupportService';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { handleApiError } from '../../utils/handleApiError';
import StatusBadge from '../../components/StatusBadge';

export default function AdminSupportManager() {
  const { t } = useTranslation();
  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [debouncedSearch] = useDebounce(search, 1000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supportID, setSupportID] = useState(null);
  const [supports, setSupports] = useState([]);
  const [totalSupports, setTotalSupports] = useState(0);

  const fetchSupports = useCallback(async () => {
    try {
      setLoading(true);
      const isProcessedParam =
        filter === 'all' ? undefined : filter === 'processed';
      const result = await contactSupportService.getAll({
        PageNumber: currentPage,
        PageSize: pageSize,
        Search: debouncedSearch,
        SortBy: sortBy,
        FilterBool: isProcessedParam,
      });
      if (result) {
        setSupports(result.items);
        setTotalSupports(result.totalCount);
      }
    } catch (error) {
      toast.error(t(handleApiError(error)));
    } finally {
      setLoading(false);
    }
  }, [t, currentPage, pageSize, debouncedSearch, filter, sortBy]);

  useEffect(() => {
    fetchSupports();
  }, [fetchSupports]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteSupportModal.title',
      textKey: 'ModalPopup.DeleteSupportModal.text',
      onConfirm: async () => {
        await contactSupportService.delete(id);
        toast.success(t('SUCCESS.DELETE'));
        fetchSupports();
      },
    });
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-headset text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                  {t('adminSupportManager.title')}
                </h1>
                <p className="text-gray-600 text-sm font-medium">
                  {t('adminSupportManager.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Stats Card */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-5 py-3 bg-orange-600 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-headset text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {loading ? 0 : totalSupports || 0}
                    </div>
                    <div className="text-xs text-white/90 font-medium">
                      {t('adminSupportManager.supports')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search, Sort & Filter Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">{t('common.sortDefault')}</option>
                <option value="fullname">{t('common.sortName')}</option>
                <option value="fullname_desc">
                  {t('common.sortNameDesc')}
                </option>
              </select>

              <div className="relative group">
                <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-hover:text-orange-500 transition-colors" />
                <input
                  id="search-input"
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder={t('common.search')}
                  className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm hover:border-orange-300 bg-white"
                />
              </div>

              <div className="flex gap-2">
                {['all', 'pending', 'processed'].map((key) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer ${filter === key
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    {t(`adminSupportManager.${key}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Support Modal */}
        <SupportModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSupportID(null);
          }}
          supportID={supportID}
          onReplySent={() => fetchSupports()}
        />

        {/* Table Container */}
        <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
          <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="h-12 bg-gray-50 border-b-1">
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminSupportManager.no')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminSupportManager.fullName')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminSupportManager.email')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminSupportManager.subject')}
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminSupportManager.status')}
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminSupportManager.action')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-10 text-center align-middle"
                        >
                          <LoadingComponent />
                        </td>
                      </tr>
                    ) : supports && supports.length > 0 ? (
                      supports.map((s, index) => (
                        <tr
                          key={s.id}
                          className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                            }`}
                        >
                          <td className="px-4 py-4 text-center align-middle">
                            <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-600 rounded-full shadow-sm">
                              {(currentPage - 1) * pageSize + index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center align-middle">
                            <div className="text-sm font-medium text-gray-900">
                              {s.fullName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center align-middle">
                            <div className="text-sm text-gray-700">
                              {s.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center align-middle">
                            <div className="text-sm text-gray-700">
                              {s.subject}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center align-middle">
                            <StatusBadge
                              status={s.isProcessed ? 'Processed' : 'Pending'}
                              type="Request"
                            />
                          </td>
                          <td className="px-4 py-4 text-center align-middle">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md cursor-pointer ${s.isProcessed
                                  ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                                  : 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                                  }`}
                                onClick={() => {
                                  setIsModalOpen(true);
                                  setSupportID(s.id);
                                }}
                              >
                                {s.isProcessed
                                  ? t('BUTTON.View')
                                  : t('BUTTON.Reply')}
                              </button>
                              {s.isProcessed && (
                                <button
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100 cursor-pointer"
                                  onClick={() => handleDelete(s.id)}
                                >
                                  {t('BUTTON.Delete')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center text-center mt-5 mb-5">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <i className="fa-solid fa-headset text-gray-400 text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {t('adminSupportManager.noSupport')}
                            </h3>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="lg:hidden">
              <div className="p-4 space-y-4">
                {loading ? (
                  <div className="py-10 text-center">
                    <LoadingComponent />
                  </div>
                ) : supports && supports.length > 0 ? (
                  supports.map((s, index) => (
                    <div
                      key={s.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
                            {(currentPage - 1) * pageSize + index + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {s.fullName}
                            </h3>
                            <p className="text-xs text-gray-500">{s.email}</p>
                          </div>
                        </div>
                        <StatusBadge
                          status={s.isProcessed ? 'Processed' : 'Pending'}
                          type="Request"
                        />
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-700 font-medium">
                          {s.subject}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          className={`flex-1 px-3 py-2 text-xs font-medium border rounded-md cursor-pointer ${s.isProcessed
                            ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                            : 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                            }`}
                          onClick={() => {
                            setIsModalOpen(true);
                            setSupportID(s.id);
                          }}
                        >
                          {s.isProcessed ? t('BUTTON.View') : t('BUTTON.Reply')}
                        </button>
                        {s.isProcessed && (
                          <button
                            className="flex-1 px-3 py-2 text-xs font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100 cursor-pointer"
                            onClick={() => handleDelete(s.id)}
                          >
                            {t('BUTTON.Delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <i className="fa-solid fa-headset text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t('adminSupportManager.noSupport')}
                    </h3>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {!loading && totalSupports > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>
                    {totalSupports} {t('adminSupportManager.supports')}
                  </span>
                </div>
                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalSupports}
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
    </div>
  );
}
