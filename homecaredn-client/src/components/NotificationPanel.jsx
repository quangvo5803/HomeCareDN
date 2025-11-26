import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import LoadingComponent from '../components/LoadingComponent'
import { formatDate } from '../utils/formatters';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import { notificationService } from '../services/notificationService';
import PropTypes from 'prop-types';

export default function NotificationPanel({ notifications = [], loading, user }) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [notify, setNotify] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('personal');
    const panelRef = useRef(null);

    const systemNoti = notify.filter(n => n.type === 'System');
    const personalNoti = notify.filter(n => n.type === 'Personal');
    const currentNoti = tab === 'system' ? systemNoti : personalNoti;

    // Click outside to close
    useEffect(() => {
        function handleClick(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [open]);

    useEffect(() => {
        setNotify(notifications);
        setUnreadCount(notifications.filter(n => !n.isRead).length);
    }, [notifications]);

    const routeMap = {
        ContractorApplication: {
            APPLY: (value) => `/Customer/ServiceRequestDetail/${value}`,
            ACCEPT: (value) => `/Contractor/ServiceRequestManager/${value}`,
            REJECT: (value) => `/Contractor/ServiceRequestManager/${value}`,
            PAID: (value) => `/Customer/ServiceRequestDetail/${value}`,
        },
        DistributorApplication: {
            APPLY: (value) => `/Customer/MaterialRequestDetail/${value}`,
            ACCEPT: (value) => `/Distributor/MaterialRequestManager/${value}`,
            REJECT: (value) => `/Distributor/MaterialRequestManager/${value}`,
            PAID: (value) => `/Customer/MaterialRequestDetail/${value}`,
        },
        ServiceRequest: (value) => `/Contractor/${value}`,
        MaterialRequest: (value) => `/Distributor/${value}`,
    };

    const resolveNotificationRoute = (n) => {
        const { dataKey, dataValue } = n;

        const directRoute = routeMap[dataKey]?.(dataValue);
        if (directRoute) return directRoute;

        const [type, , status] = dataKey.split("_");
        return routeMap[type]?.[status]?.(dataValue) ?? null;
    };

    const handleClickNotification = async (n) => {
        try {
            await notificationService.readNotification(n.notificationID);
            const route = resolveNotificationRoute(n);
            if (route) {
                navigate(route);
            } else {
                toast.error("Không tìm thấy thông báo", n);
            }
        } catch (err) {
            toast.error(handleApiError(err));
        }
    };

    const handleReadAllNotifications = async () => {
        try {
            await notificationService.readAllNotifications(user.id);
            setNotify(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            toast.error(handleApiError(err));
        }
    };

    const renderNotifications = () => {
        if (loading) {
            return <LoadingComponent />;
        }

        if (currentNoti.length > 0) {
            return currentNoti.map((n) => (
                <button
                    key={n.notificationID}
                    onClick={() => handleClickNotification(n)}
                    className={`w-full text-left p-4 border-b border-orange-50 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 cursor-pointer ${!n.isRead && "bg-orange-50/40"}`}
                >
                    <div className="flex items-start gap-3">
                        {!n.isRead && (
                            <div className="w-2 h-2 mt-2 rounded-full bg-orange-500 flex-shrink-0 shadow-sm shadow-orange-300" />
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-800 mb-1">{n.title}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed mb-2">{n.message}</p>
                            <span className="text-xs text-orange-600 font-medium">
                                {formatDate(n.updatedAt, i18n.language)}
                            </span>
                        </div>
                    </div>
                </button>
            ));
        }

        return (
            <div className="p-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-orange-50">
                    <Bell size={28} className="text-orange-300" />
                </div>
                <p className="text-sm text-gray-500">
                    {t('notifyPanel.no_Notify')} {tab === "system" ? t('notifyPanel.system') : t('notifyPanel.personal')}
                </p>
            </div>
        );
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-full hover:bg-orange-50 transition-all duration-200"
            >
                <Bell size={22} className="text-blue-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-5 h-5 text-xs font-semibold text-white bg-orange-500 rounded-full shadow-md">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden z-50 animate-fadeIn">
                    {/* Header Tabs */}
                    <div className="flex items-center border-b border-orange-100">
                        <button
                            onClick={() => setTab('personal')}
                            className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 ${tab === 'personal' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50/30 cursor-pointer'
                                }`}
                        >
                            {t('notifyPanel.tabPer')}
                        </button>
                        <button
                            onClick={() => setTab('system')}
                            className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 ${tab === 'system' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50/30  cursor-pointer'
                                }`}
                        >
                            {t('notifyPanel.tabSys')}
                        </button>
                        <button
                            onClick={handleReadAllNotifications}
                            className="p-2 mr-2 text-orange-500 hover:bg-orange-50 rounded-full transition-all duration-200 cursor-pointer"
                            title="Đánh dấu tất cả đã đọc"
                        >
                            <CheckCheck size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                        {renderNotifications()}
                    </div>
                </div>
            )}
        </div>
    );
}
NotificationPanel.propTypes = {
    notifications: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
};