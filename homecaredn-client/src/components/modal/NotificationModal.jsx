import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { handleApiError } from '../../utils/handleApiError';
import { formatDate } from '../../utils/formatters';
export default function NotificationModal({
    isOpen,
    onClose,
    onSave,
    notification,
    viewOnly,
    user
}) {
    const { t, i18n } = useTranslation();

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRoles, setTargetRoles] = useState([]);

    const roles = [
        { key: "All", label: i18n.language === 'vi' ? "Tất cả" : "All" },
        { key: "Customer", label: i18n.language === 'vi' ? "Khách hàng" : "Customer" },
        { key: "Distributor", label: i18n.language === 'vi' ? "Nhà phân phối" : "Distributor" },
        { key: "Contractor", label: i18n.language === 'vi' ? "Nhà thầu" : "Contractor" },
    ];

    useEffect(() => {
        if (isOpen && notification) {
            setTitle(notification.title || '');
            setMessage(notification.message || '');
            setTargetRoles(notification.targetRoles || []);
        } else if (isOpen) {
            setTitle('');
            setMessage('');
            setTargetRoles([]);
        }
    }, [isOpen, notification]);

    const handleRoleChange = (roleKey) => {
        if (viewOnly) return;

        if (roleKey === 'All') {
            if (targetRoles.length === 3) {
                setTargetRoles([]);
            } else {
                setTargetRoles(['Customer', 'Distributor', 'Contractor']);
            }
        } else {
            let newRoles = targetRoles.includes(roleKey)
                ? targetRoles.filter(r => r !== roleKey)
                : [...targetRoles, roleKey];
            setTargetRoles(newRoles);
        }
    };

    const handleSubmit = async () => {
        if (viewOnly) {
            onClose();
            return;
        }
        try {
            const data = {
                Title: title || '',
                Message: message || '',
                TargetRoles: targetRoles.join(',') || '',
                SenderUserId: user.id
            };
            await onSave(data);
        } catch (err) {
            toast.error(handleApiError(err));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto p-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-2xl font-semibold text-gray-900">{viewOnly ? t('adminNotifyManager.detail') : t('adminNotifyManager.buttonCreate')}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 pr-2 mt-6 space-y-6 overflow-y-auto">
                    {/* Title */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            {t('adminNotifyManager.title')} <span className="text-red-500">*</span>
                        </label>
                        {viewOnly ? (
                            <p className="px-4 py-3 border rounded-xl bg-gray-50 text-gray-700">{title}</p>
                        ) : (
                            <input
                                type="text"
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={t('adminNotifyManager.enterTitle')}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            {t('adminNotifyManager.message')} <span className="text-red-500">*</span>
                        </label>
                        {viewOnly ? (
                            <p className="px-4 py-3 border rounded-xl bg-gray-50 text-gray-700">{message}</p>
                        ) : (
                            <textarea
                                className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="5"
                                placeholder={t('adminNotifyManager.enterMess')}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Thông tin bổ sung khi viewOnly */}
                    {viewOnly && notification && (
                        <div className="mt-6 space-y-2 p-4 border-t border-gray-200 bg-gray-50 rounded-xl text-gray-700 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{t('adminNotifyManager.type')}:</span>
                                <span className="px-3 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full">
                                    {t(`adminNotifyManager.${notification.type}`)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{t('adminNotifyManager.createAt')}:</span>
                                <span className="text-sm text-black">{formatDate(notification.updatedAt, i18n.language)}</span>
                            </div>
                        </div>
                    )}

                    {/* Target Roles */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            {t('adminNotifyManager.receiver')} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col gap-2 pl-1">
                            {roles.map((role) => (
                                <label key={role.key} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={
                                            role.key === 'All'
                                                ? roles
                                                    .filter(r => r.key !== 'All') // tất cả role ngoại trừ "All"
                                                    .every(r => targetRoles.includes(r.key)) // check nếu tất cả đã chọn
                                                : targetRoles.includes(role.key)
                                        }
                                        onChange={() => !viewOnly && handleRoleChange(role.key)}
                                        className={`accent-blue-500 cursor-${viewOnly ? 'not-allowed' : 'pointer'}`}
                                    />

                                    <span className={viewOnly ? 'text-gray-500' : ''}>{role.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-4 pt-4 mt-6 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 cursor-pointer"
                    >
                        {viewOnly ? t('BUTTON.Close') : t('BUTTON.Cancel')}
                    </button>
                    {!viewOnly && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!title || !message || !targetRoles.length}
                            className="px-6 py-2 font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {t('BUTTON.Send')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
NotificationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    notification: PropTypes.shape({
        title: PropTypes.string,
        message: PropTypes.string,
        type: PropTypes.string,
        targetRoles: PropTypes.string,
        updatedAt: PropTypes.string,
    }),
    viewOnly: PropTypes.bool,
    user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
};