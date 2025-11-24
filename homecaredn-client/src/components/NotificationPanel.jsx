import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import LoadingComponent from '../components/LoadingComponent'
import { formatDate } from '../utils/formatters';
import { useTranslation } from 'react-i18next';

export default function NotificationPanel({ notifications = [], loading }) {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('system');
    const panelRef = useRef(null);

    const systemNoti = notifications.filter(n => n.type === 'System');
    const personalNoti = notifications.filter(n => n.type === 'Personal');
    const unreadCount = notifications.filter(n => !n.isRead).length;
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
                    <div className="flex border-b border-orange-100 bg-gradient-to-b from-orange-50/50 to-white">
                        <button
                            onClick={() => setTab('personal')}
                            className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 ${tab === 'personal'
                                ? 'text-orange-600 border-b-2 border-orange-500'
                                : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50/30'
                                }`}
                        >
                            Thông báo
                        </button>
                        <button
                            onClick={() => setTab('system')}
                            className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 ${tab === 'system'
                                ? 'text-orange-600 border-b-2 border-orange-500'
                                : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50/30'
                                }`}
                        >
                            Hệ thống
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <LoadingComponent />
                        ) : currentNoti.length > 0 ? (
                            currentNoti.map((n) => (
                                <div
                                    key={n.notificationID}
                                    className={`p-4 border-b border-orange-50 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 cursor-pointer ${!n.isRead ? "bg-orange-50/40" : ""
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {!n.isRead && (
                                            <div className="w-2 h-2 mt-2 rounded-full bg-orange-500 flex-shrink-0 shadow-sm shadow-orange-300" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">
                                                {n.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                                {n.message}
                                            </p>
                                            <span className="text-xs text-orange-600 font-medium">
                                                {formatDate(n.updatedAt, i18n.language)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-orange-50">
                                    <Bell size={28} className="text-orange-300" />
                                </div>
                                <p className="text-sm text-gray-500">
                                    Không có thông báo {tab === "system" ? "hệ thống" : "cá nhân"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}