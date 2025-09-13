import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import Loading from '../../components/Loading';
import { handleApiError } from '../../utils/handleApiError';
import { contactService } from '../../services/contactService';
import ReplyModal from '../../components/admin/ReplyModal';
import { Pagination } from 'antd';

export default function AdminSupportManager() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [supports, setSupports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 10;
  // modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState('reply'); // 'reply' | 'view'

  const fetchSupports = async () => {
    try {
      setLoading(true);
      const isProcessedParam =
        filter === 'all' ? undefined : filter === 'processed';

      // service trả thẳng data (array)
      const res = await contactService.listAll({
        PageNumber: currentPage,
        PageSize: pageSize,
        FilterBool: isProcessedParam,
      });
      setSupports(res.items || []);
      setTotal(res.totalItems || 0);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openReply = async (item, mode = 'reply') => {
    try {
      // service trả thẳng data (object chi tiết)
      const detail = await contactService.getById(item.id);

      // Chuẩn hoá key để chịu được camelCase/PascalCase
      const norm = (k) =>
        detail?.[k] ??
        detail?.[k[0].toUpperCase() + k.slice(1)] ??
        item?.[k] ??
        item?.[k[0].toUpperCase() + k.slice(1)];

      setSelected({
        id: norm('id'),
        fullName: norm('fullName'),
        email: norm('email'),
        subject: norm('subject'),
        isProcessed: norm('isProcessed'),
        message: norm('message') || '',
        replyContent: norm('replyContent') || '',
      });

      setModalMode(mode);
      setOpen(true);
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const submitReply = async (replyContent) => {
    if (!replyContent?.trim()) {
      toast.error(t('adminSupportManager.replyPlaceholder'));
      return;
    }
    try {
      await contactService.reply({ id: selected.id, replyContent });
      toast.success(t('SUCCESS.REPLY'));
      setOpen(false);
      setSelected(null);
      fetchSupports();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const handleDelete = async (id) => {
    const title = t(
      'ModalPopup.DeleteSupportModal.title',
      'Delete this support request?'
    );
    const text = t(
      'ModalPopup.DeleteSupportModal.text',
      'This action cannot be undone.'
    );

    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('BUTTON.Delete', 'Delete'),
      cancelButtonText: t('BUTTON.Cancel', 'Cancel'),
    });

    if (!result.isConfirmed) return;

    try {
      await contactService.delete(id);
      toast.success(t('SUCCESS.DELETE'));
      fetchSupports();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const filteredCount = useMemo(() => supports.length, [supports]);

  if (loading) return <Loading />;

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            <i className="fa-solid fa-headset mr-3" />
            {t('adminSupportManager.title')}
          </h2>
          <p className="text-gray-600">{t('adminSupportManager.subtitle')}</p>
        </div>

        {/* Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filter === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('all')}
          >
            {t('adminSupportManager.all')}
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filter === 'pending'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('pending')}
          >
            {t('adminSupportManager.pending')}
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filter === 'processed'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('processed')}
          >
            {t('adminSupportManager.processed')}
          </button>

          <div className="ml-auto text-sm text-gray-500">
            {t('adminSupportManager.itemsCount', { count: filteredCount })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    {t('adminSupportManager.fullName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    {t('adminSupportManager.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    {t('adminSupportManager.subject')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    {t('adminSupportManager.status')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    {t('adminSupportManager.action')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {supports?.length ? (
                  supports.map((s, idx) => (
                    <tr
                      key={s.id || s.Id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-center text-sm">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {s.fullName ?? s.FullName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {s.email ?? s.Email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {s.subject ?? s.Subject}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {s.isProcessed ?? s.IsProcessed ? (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                            {t('adminSupportManager.processed')}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs">
                            {t('adminSupportManager.pending')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        {s.isProcessed ?? s.IsProcessed ? (
                          <>
                            <button
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              onClick={() => openReply(s, 'view')}
                            >
                              {t('BUTTON.View')}
                            </button>
                            <button
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              onClick={() => handleDelete(s.id ?? s.Id)}
                            >
                              {t('BUTTON.Delete')}
                            </button>
                          </>
                        ) : (
                          <button
                            className="px-3 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                            onClick={() => openReply(s, 'reply')}
                          >
                            {t('BUTTON.Reply')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        {/* Icon */}
                        <svg
                          className="w-12 h-12 text-gray-400 mb-4 mx-auto"
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

                        {/* Text */}
                        <p className="text-sm mb-2">
                          {t('adminSupportManager.noSupport')}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-center py-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              size="small"
            />
          </div>
        </div>

        {/* Modal */}
        <ReplyModal
          open={open}
          onClose={() => {
            setOpen(false);
            setSelected(null);
          }}
          item={selected}
          mode={modalMode}
          onSubmit={submitReply}
        />
      </div>
    </div>
  );
}
