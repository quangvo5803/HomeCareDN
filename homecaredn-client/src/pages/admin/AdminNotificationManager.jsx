import { useTranslation } from 'react-i18next';

export default function AdminNotificationManager() {
    const { t } = useTranslation();
    const notifications = [
        {
            NotificationID: '1a2b3c4d-1111-2222-3333-444455556666',
            Type: 'Info',
            Title: 'Thông báo hệ thống',
            Message: 'Hệ thống sẽ bảo trì lúc 2 giờ sáng.',
            TargetRoles: 'Admin,User',
            TargetUserId: null,
            IsRead: false,
            DataKey: 'Maintenance',
            DataValue: '2025-11-27',
            PendingCount: 1,
            Action: 'View',
            CreatedAt: '2025-11-25T10:00:00Z',
            UpdatedAt: '2025-11-25T10:00:00Z'
        },
        {
            NotificationID: '2b3c4d5e-2222-3333-4444-555566667777',
            Type: 'Warning',
            Title: 'Cảnh báo đăng nhập',
            Message: 'Có đăng nhập bất thường từ IP lạ.',
            TargetRoles: 'Admin',
            TargetUserId: null,
            IsRead: true,
            DataKey: 'LoginAlert',
            DataValue: '192.168.1.100',
            PendingCount: 0,
            Action: 'View',
            CreatedAt: '2025-11-24T15:30:00Z',
            UpdatedAt: '2025-11-24T15:30:00Z'
        }
    ];

    const loading = false;


    let tableContent;

    if (loading) {
        tableContent = (
            <tr>
                <td colSpan="8" className="py-10 text-center">
                    <span>Loading...</span>
                </td>
            </tr>
        );
    } else if (notifications && notifications.length > 0) {
        tableContent = notifications.map((item, idx) => (
            <tr
                key={item.NotificationID}
                className={`hover:bg-gray-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
            >
                <td className="px-4 py-4">{idx + 1}</td>
                <td className="px-4 py-4 font-bold text-gray-900">{item.Title}</td>
                <td className="px-4 py-4 text-gray-700">{item.Message}</td>
                <td className="px-4 py-4 text-gray-700">{item.Type}</td>
                <td className="px-4 py-4 text-gray-700">{item.TargetRoles || 'All'}</td>
                <td className="px-4 py-4 text-gray-700">{item.IsRead ? 'Đã đọc' : 'Chưa đọc'}</td>
                <td className="px-4 py-4 text-gray-700">{item.CreatedAt.slice(0, 10)}</td>
                <td className="px-4 py-4">
                    <button
                        type="button"
                        onClick={() => alert(`Action: ${item.Action}`)}
                        className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        {item.Action}
                    </button>
                </td>
            </tr>
        ));
    } else {
        tableContent = (
            <tr>
                <td colSpan="8" className="py-16 text-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Không có thông báo nào</h3>
                        <p className="text-sm text-gray-500">Bạn chưa có thông báo mới.</p>
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
                                <i className="fa-solid fa-dollar text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                                    {t('adminPaymentManager.title')}
                                </h1>
                                <p className="text-gray-600 text-sm font-medium">
                                    {t('adminPaymentManager.subtitle')}
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
                                        <i className="fa-solid fa-dollar text-white text-lg" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">
                                            {loading ? 0 : notifications.length || 0}
                                        </div>
                                        <div className="text-xs text-white/90 font-medium">
                                            {t('adminPaymentManager.transaction')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                // value={sortOption}
                                // onChange={(e) => {
                                //     setSortOption(e.target.value);
                                //     setCurrentPage(1);
                                // }}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
                            >
                                <option value="">{t('common.sortDefault')}</option>
                                <option value="paidat">{t('common.sortCreateDateOld')}</option>
                                <option value="paidatdesc">
                                    {t('common.sortCreateDateNew')}
                                </option>
                            </select>

                            <div className="relative group">
                                <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-hover:text-orange-500 transition-colors" />
                                <input
                                    type="text"
                                    // value={search}
                                    // onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('common.search')}
                                    className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm hover:border-orange-300 bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-center">
                            <thead>
                                <tr className="h-12 bg-gray-50 border-b">
                                    <th className="px-4 py-4">#</th>
                                    <th className="px-4 py-4">Tiêu đề</th>
                                    <th className="px-4 py-4">Nội dung</th>
                                    <th className="px-4 py-4">Loại</th>
                                    <th className="px-4 py-4">Nhóm/Người nhận</th>
                                    <th className="px-4 py-4">Trạng thái</th>
                                    <th className="px-4 py-4">Ngày tạo</th>
                                    <th className="px-4 py-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">{tableContent}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
