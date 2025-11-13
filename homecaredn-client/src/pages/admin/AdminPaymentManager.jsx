import StatusBadge from '../../components/StatusBadge';
import { paymentService } from '../../services/paymentService';
import { useEffect, useState } from 'react';
import LoadingComponent from '../../components/LoadingComponent';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Pagination } from 'antd';
import { formatVND, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '../../utils/handleApiError';
import { toast } from 'react-toastify';

export default function PaymentManager() {
    const { t, i18n } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 1000);
    const [sortOption, setSortOption] = useState('');
    const [payments, setPayments] = useState(null);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await paymentService.getAll({
                    PageNumber: currentPage,
                    PageSize: pageSize,
                    SortBy: sortOption,
                    Search: debouncedSearch || '',
                });
                setPayments(res.items || []);
                setTotalCount(res.totalCount || 0);
                setLoading(true);
            } catch (err) {
                toast.error(t(handleApiError(err)));
            } finally {
                setLoading(false);
            }
        }
        fetchPayments();
    }, [t, currentPage, sortOption, debouncedSearch])

    let tableContent;

    if (loading) {
        tableContent = (
            <tr>
                <td colSpan="9" className="py-10 text-center">
                    <LoadingComponent />
                </td>
            </tr>
        );
    } else if (payments && payments.length > 0) {
        tableContent = payments.map((item, idx) => (
            <tr
                key={item.paymentTransactionID}
                className={`hover:bg-gray-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
            >
                <td className="px-4 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-500 rounded-full shadow-sm">
                        {(currentPage - 1) * pageSize + idx + 1}
                    </span>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {item.orderCode}
                </td>
                <td className="px-4 py-4 text-sm font-bold text-orange-500">
                    {formatVND(Number(item.amount))}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                    {formatDate(item.paidAt, i18n.language)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                    {item.description?.replaceAll('-', '')}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="flex justify-center">
                        <StatusBadge status={item.status} type="Payment" />
                    </div>
                </td>
                <td className="px-4 py-4">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/Admin/ServiceRequest/${item.serviceRequestID}`)
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-sm"
                    >
                        <i className="fa-solid fa-eye" />
                        {t('BUTTON.View')}
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
                            <i className="fa-solid fa-clipboard-list text-gray-400 text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {t('adminPaymentManager.empty')}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {t('adminPaymentManager.empty_description')}
                        </p>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                                <i className="fa-solid fa-clipboard-list text-white text-2xl" />
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
                                        <i className="fa-solid fa-clipboard-list text-white text-lg" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">
                                            {loading ? 0 : totalCount || 0}
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
                                value={sortOption}
                                onChange={(e) => {
                                    setSortOption(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
                            >
                                <option value="">{t('common.sortDefault')}</option>
                                <option value="paidat">
                                    {t('common.sortCreateDateOld')}
                                </option>
                                <option value="paidatdesc">
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
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-center">
                            <thead>
                                <tr className="h-12 bg-gray-50 border-b">
                                    <th className="w-[60px] px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        {t('adminPaymentManager.no')}
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        {t('adminPaymentManager.orderCode')}
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        {t('adminPaymentManager.amount')}
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        {t('adminPaymentManager.date')}
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        {t('adminPaymentManager.description')}
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        {t('adminPaymentManager.status')}
                                    </th>
                                    <th className="w-[120px] px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        {t('adminPaymentManager.action')}
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 text-center">
                                {tableContent}
                            </tbody>
                        </table>

                    </div>
                </div>

                {/* Pagination */}
                {!loading && totalCount > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span>
                                {totalCount}{' '}
                                {t('adminPaymentManager.transaction')}
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
        </div>
    );
}