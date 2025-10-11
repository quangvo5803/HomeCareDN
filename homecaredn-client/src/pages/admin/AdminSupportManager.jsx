// src/pages/admin/AdminSupportManager.jsx
import { useEffect, useState } from 'react';
import { Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useDebounce } from 'use-debounce';
import SupportModal from '../../components/modal/SupportModal';
import Loading from '../../components/Loading';
import { contactService } from '../../services/contactService';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { handleApiError } from '../../utils/handleApiError';

export default function AdminSupportManager() {
  const { t } = useTranslation();
  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [debouncedSearch] = useDebounce(search, 1000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supportID, setSupportID] = useState(null);
  const [supports, setSupports] = useState([]);
  const [totalSupports, setTotalSupports] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Xử lý tham số lọc
        const isProcessedParam =
          filter === 'all' ? undefined : filter === 'processed';

        // Gọi API lấy danh sách
        const result = await contactService.listAll({
          PageNumber: currentPage,
          PageSize: pageSize,
          Search: debouncedSearch,
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
    };

    fetchData();
  }, [currentPage, pageSize, debouncedSearch, filter]);

  const handleDelete = async (id) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteSupportModal.title',
      textKey: 'ModalPopup.DeleteSupportModal.text',
      onConfirm: async () => {
        await contactService.delete(id);
        toast.success(t('SUCCESS.DELETE'));
        contactService.listAll({
          PageNumber: currentPage,
          PageSize: pageSize,
          Search: debouncedSearch,
        });
      },
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
            <i className="fa-solid fa-headset mr-3" />{' '}
            {t('adminSupportManager.title')}
          </h2>
          <p className="text-gray-600">{t('adminSupportManager.subtitle')}</p>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 border-b border-gray-200 bg-gray-50">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="w-full sm:w-72 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-2 justify-end">
              {['all', 'pending', 'processed'].map((key) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-sm border font-medium ${
                    filter === key
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {t(`adminSupportManager.${key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                    {t('adminSupportManager.no')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    {t('adminSupportManager.fullName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    {t('adminSupportManager.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    {t('adminSupportManager.subject')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                    {t('adminSupportManager.status')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                    {t('adminSupportManager.action')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {supports?.length > 0 ? (
                  supports.map((s, idx) => (
                    <tr
                      key={s.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="text-center py-3 text-sm text-gray-700">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3">{s.fullName}</td>
                      <td className="py-3">{s.email}</td>
                      <td className="py-3">{s.subject}</td>
                      <td className="text-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            s.isProcessed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {s.isProcessed
                            ? t('adminSupportManager.processed')
                            : t('adminSupportManager.pending')}
                        </span>
                      </td>
                      <td className="text-center space-x-2">
                        <button
                          className={`px-3 py-1 text-sm rounded font-medium transition-colors duration-150 ${
                            s.isProcessed
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
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
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            onClick={() => handleDelete(s.id)}
                          >
                            {t('BUTTON.Delete')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-10 text-center text-gray-500 text-sm"
                    >
                      {t('adminSupportManager.noSupport')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalSupports > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
              {/* Total count (left) */}
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>
                  {totalSupports} {t('adminSupportManager.supports')}
                </span>
              </div>

              {/* Pagination (right) */}
              <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalSupports}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <SupportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSupportID(null);
        }}
        supportID={supportID}
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
