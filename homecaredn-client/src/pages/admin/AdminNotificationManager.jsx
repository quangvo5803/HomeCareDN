import { notificationService } from '../../services/notificationService';
import { useEffect, useState, useCallback } from 'react';
import LoadingComponent from '../../components/LoadingComponent';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Pagination } from 'antd';
import { handleApiError } from '../../utils/handleApiError';
import { toast } from 'react-toastify';
import { withMinLoading } from '../../utils/withMinLoading';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hook/useAuth';
import NotificationModal from '../../components/modal/NotificationModal';
import { showDeleteModal } from '../../components/modal/DeleteModal';

export default function AdminNotificationManager() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 1000);
    const [sortOption, setSortOption] = useState('');
    const [notifications, setNotifications] = useState(null);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [notifyViewOnly, setNotifyViewOnly] = useState(false);
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
    const [selectedNotificationData, setSelectedNotificationData] = useState(null);

    const executeFetchNotifications = useCallback(
        async ({ PageNumber = 1, PageSize = 2, Search = '', SortBy, FilterID } = {}) => {
            try {
                const data = await notificationService.getAllForAdmin({
                    PageNumber,
                    PageSize,
                    Search,
                    SortBy,
                    FilterID,
                });

                setNotifications(data.items || []);
                setTotalCount(data.totalCount || 0);

                return data.items || [];
            } catch (err) {
                toast.error(t(handleApiError(err)));
                setNotifications([]);
                setTotalCount(0);
                return [];
            }
        },
        [t]
    );

    // Wrapper có loading tối thiểu
    const fetchNotifications = useCallback(
        async (params = {}) =>
            withMinLoading(() => executeFetchNotifications(params), setLoading),
        [executeFetchNotifications]
    );
    useEffect(() => {
        fetchNotifications({
            PageNumber: currentPage,
            PageSize: pageSize,
            SortBy: sortOption,
            Search: debouncedSearch || '',
            FilterID: user.id,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t, currentPage, sortOption, debouncedSearch, user]);

    const handleOpenCreateNotify = () => {
        setNotifyViewOnly(false);
        setSelectedNotificationData(null);
        setIsNotifyModalOpen(true);
    };
    const handleCloseNotifyModal = () => {
        setIsNotifyModalOpen(false);
    };

    const handleSaveNotify = async (notifyData) => {
        try {
            await notificationService.createForAdmin(notifyData);
            toast.success(t('SUCCESS.NOTIFY_ADD'));
            setIsNotifyModalOpen(false);
            fetchNotifications({
                PageNumber: currentPage,
                PageSize: pageSize,
                SortBy: sortOption,
                Search: debouncedSearch || '',
                FilterID: user.id,
            });
        } catch (err) {
            toast.error(handleApiError(err));
        }
    }

    const handleViewNotification = async (id) => {
        try {
            const data = await notificationService.getByIdForAdmin(id);
            setSelectedNotificationData(data);
            setNotifyViewOnly(true);
            setIsNotifyModalOpen(true);
        } catch (err) {
            toast.error(handleApiError(err));
        }
    };

    const handleDelete = async (id) => {
        showDeleteModal({
            t,
            titleKey: 'ModalPopup.DeleteBrandModal.title',
            textKey: 'ModalPopup.DeleteBrandModal.text',
            onConfirm: async () => {
                await notificationService.deleteForAdmin(id);

                const newTotal = totalCount - 1;
                const newPage = Math.min(currentPage, Math.ceil(newTotal / pageSize)) || 1;

                setCurrentPage(newPage);
                fetchNotifications({
                    PageNumber: newPage,
                    PageSize: pageSize,
                    SortBy: sortOption,
                    Search: debouncedSearch || '',
                    FilterID: user.id,
                });
                toast.success(t('SUCCESS.DELETE'));
            },
        });
    };


    let tableContent;

    if (loading) {
        tableContent = (
            <tr>
                <td colSpan="9" className="py-10 text-center">
                    <LoadingComponent />
                </td>
            </tr>
        );
    } else if (notifications && notifications.length > 0) {
        tableContent = notifications.map((item, idx) => (
            <tr
                key={item.NotificationID}
                className={`hover:bg-gray-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
            >
                <td className="px-4 py-4 text-center align-middle">
                    <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-500 rounded-full shadow-sm">
                        {(currentPage - 1) * pageSize + idx + 1}
                    </span>
                </td>
                <td className="px-4 py-4 font-bold text-gray-900">{item.title}</td>
                <td className="px-4 py-4 text-gray-700">
                    <span className="px-3 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full">
                        {t(`adminNotifyManager.${item.type}`)}
                    </span>
                </td>
                <td className="px-4 py-4 text-gray-700">
                    <span className="px-3 py-1 text-sm font-medium bg-amber-50 text-amber-700 rounded-full">
                        {item.targetRoles
                            .split(',')
                            .map(role => t(`adminNotifyManager.roles.${role.trim()}`))
                            .join(', ')
                        }
                    </span>
                </td>
                <td className="px-4 py-4 text-gray-800">{formatDate(item.createdAt, i18n.language)}</td>
                <td className="px-4 py-4">
                    <button
                        type="button"
                        onClick={() => handleViewNotification(item.notificationID)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-sm cursor-pointer"
                    >
                        <i className="fa-solid fa-eye" />
                        {t('BUTTON.View')}
                    </button>
                    <button
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-sm cursor-pointer ml-2"
                        onClick={() => handleDelete(item.notificationID)}
                    >
                        <i className="fa-solid fa-trash mr-2" />
                        {t('BUTTON.Delete')}
                    </button>
                </td>
            </tr>
        ));
    } else {
        tableContent = (
            <tr>
                <td colSpan="9" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-center mt-5 mb-5">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <i className="fa-regular fa-bell-slash text-gray-400 text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {t('adminNotifyManager.empty')}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {t('adminNotifyManager.empty_description')}
                        </p>
                        <button
                            className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-700 cursor-pointer"
                            onClick={() => setIsNotifyModalOpen(true)}
                        >
                            <i className="mr-3 fa-solid fa-plus"></i>
                            {t('adminNotifyManager.buttonCreate')}
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                                <i className="fas fa-bell text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                                    {t('adminNotifyManager.title')}
                                </h1>
                                <p className="text-gray-600 text-sm font-medium">
                                    {t('adminNotifyManager.subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Controls Bar */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Stats Cards */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="px-5 py-3 bg-orange-500 rounded-xl shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-bell text-white text-lg" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">
                                            {loading ? 0 : totalCount || 0}
                                        </div>
                                        <div className="text-xs text-white/90 font-medium">
                                            {t('adminNotifyManager.notifications')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={sortOption}
                                onChange={(e) => {
                                    setSortOption(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
                            >
                                <option value="">{t('common.sortDefault')}</option>
                                <option value="updatedat">{t('common.sortCreateDateOld')}</option>
                                <option value="updatedatdesc">
                                    {t('common.sortCreateDateNew')}
                                </option>
                            </select>

                            <div className="relative group">
                                <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-hover:text-orange-500 transition-colors" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('common.search')}
                                    className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm hover:border-orange-300 bg-white"
                                />
                            </div>
                            <button
                                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-500 transition-all duration-200 shadow-md sm:w-auto w-full cursor-pointer"
                                onClick={handleOpenCreateNotify}
                            >
                                <i className="fa-solid fa-plus"></i>
                                {t('adminNotifyManager.buttonCreate')}
                            </button>
                        </div>
                    </div>
                </div>
                <NotificationModal
                    isOpen={isNotifyModalOpen}
                    onClose={handleCloseNotifyModal}
                    onSave={handleSaveNotify}
                    notification={null}
                    viewOnly={notifyViewOnly}
                    user={user}
                />
                <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-center">
                            <thead>
                                <tr className="h-12 bg-gray-50 border-b">
                                    <th className="px-4 py-4">{t('adminNotifyManager.no')}</th>
                                    <th className="px-4 py-4">{t('adminNotifyManager.title1')}</th>
                                    <th className="px-4 py-4">{t('adminNotifyManager.type')}</th>
                                    <th className="px-4 py-4">{t('adminNotifyManager.receiver')}</th>
                                    <th className="px-4 py-4">{t('adminNotifyManager.createAt')}</th>
                                    <th className="px-4 py-4">{t('adminNotifyManager.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">{tableContent}</tbody>
                        </table>
                    </div>
                </div>
                {/* Pagination */}
                {!loading && totalCount > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span>
                                {totalCount} {t('adminPaymentManager.transaction')}
                            </span>
                        </div>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={totalCount}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            size="small"
                        />
                    </div>
                )}
            </div>
            <NotificationModal
                isOpen={isNotifyModalOpen}
                onClose={handleCloseNotifyModal}
                onSave={handleSaveNotify}
                notification={selectedNotificationData}
                viewOnly={notifyViewOnly}
                user={user}
            />
        </div>
    );
}
