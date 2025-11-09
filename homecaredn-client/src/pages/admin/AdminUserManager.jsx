import { useEffect, useState } from 'react';
import { Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../hook/useUser';
import LoadingComponent from '../../components/LoadingComponent';
import { useDebounce } from 'use-debounce';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AdminUserManager() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const pageSize = 10;

    const {
        users,
        totalUsers,
        loading,
        fetchUsers,
    } = useUser();

    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [debouncedSearch] = useDebounce(search, 1000);

    const [searchParams] = useSearchParams();
    const initialFilter = searchParams.get('filter') || 'all';
    const [filter, setFilter] = useState(initialFilter);

    useEffect(() => {
        const urlFilter = searchParams.get('filter') || 'all';
        if (urlFilter !== filter) {
            setFilter(urlFilter);
        }

    }, [searchParams, filter]);

    useEffect(() => {
        fetchUsers({
            PageNumber: currentPage,
            PageSize: pageSize,
            Search: debouncedSearch || '',
            SortBy: sortBy,
            FilterRoleName: filter === 'all' ? null : filter,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, debouncedSearch, sortBy, filter]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen p-6 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center">
                                <i className="fa-solid fa-users text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                                    {t('adminUserManager.title')}
                                </h1>
                                <p className="text-gray-600 text-sm font-medium">
                                    {t('adminUserManager.subtitle')}
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
                                        <i className="fa-solid fa-users text-white text-lg" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">
                                            {loading ? 0 : totalUsers || 0}
                                        </div>
                                        <div className="text-xs text-white/90 font-medium">
                                            {t('adminUserManager.users')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search, Sort & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="">{t('common.sortDefault')}</option>
                                <option value="fullname">{t('common.sortName')}</option>
                                <option value="fullnamedesc">
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

                            <div className="flex flex-wrap gap-2">
                                {['all', 'customer', 'contractor', 'distributor'].map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setFilter(key);
                                            navigate(`?filter=${key}`);
                                        }}

                                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer ${filter === key
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        {t(`adminUserManager.${key}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

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
                                                {t('adminUserManager.no')}
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t('adminUserManager.fullName')}
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t('adminUserManager.phoneNumber')}
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t('adminUserManager.projectCount')}
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t('adminUserManager.address')}
                                            </th>
                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t('adminServiceManager.action')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(() => {
                                            if (loading) {
                                                return (
                                                    <tr>
                                                        <td colSpan="7" className="py-10 text-center align-middle">
                                                            <LoadingComponent />
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            if (users && users.length > 0) {
                                                return users.map((item, index) => {
                                                    const firstAddress = item?.address?.[0];
                                                    const addressText = firstAddress
                                                        ? [firstAddress.district, firstAddress.city].filter(Boolean).join(', ')
                                                        : '—';

                                                    return (
                                                        <tr
                                                            key={item.userID}
                                                            className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                                                }`}
                                                        >
                                                            <td className="px-4 py-4 text-center align-middle">
                                                                <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-600 rounded-full shadow-sm">
                                                                    {(currentPage - 1) * pageSize + index + 1}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 align-middle">
                                                                <div className="text-sm font-medium text-gray-900">{item.fullName}</div>
                                                            </td>
                                                            <td className="px-6 py-4 align-middle">
                                                                <div className="text-sm text-gray-900">{item.email}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center align-middle">
                                                                <div className="text-sm text-gray-900">
                                                                    {item.phoneNumber ?? '—'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center align-middle">
                                                                <div className="text-sm text-gray-900">
                                                                    {item.projectCount > 0 ? item.projectCount : '—'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center align-middle">
                                                                <div className="text-sm text-gray-900">{addressText}</div>
                                                            </td>
                                                            <td className="px-4 py-4 text-center align-middle">
                                                                <div className="flex items-center justify-center space-x-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/Admin/User/${item.userID}`
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-sm cursor-pointer"
                                                                    >
                                                                        <i className="fa-solid fa-eye" />
                                                                        {t('BUTTON.View')}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            }

                                            return (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center text-center mt-5 mb-5">
                                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                                <i className="fa-solid fa-users text-gray-400 text-3xl" />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                                {t('adminUserManager.empty')}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                {t('adminUserManager.empty_description')}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })()}
                                    </tbody>

                                </table>
                            </div>
                        </div>

                        {/* Mobile/Tablet Card Layout */}
                        <div className="lg:hidden">
                            <div className="p-4 space-y-4">
                                {(() => {
                                    if (loading) {
                                        return (
                                            <div className="py-10 text-center">
                                                <LoadingComponent />
                                            </div>
                                        );
                                    }

                                    if (users && users.length > 0) {
                                        return users.map((item, index) => {
                                            const firstAddress = item?.address?.[0];
                                            const addressText = firstAddress
                                                ? [firstAddress.district, firstAddress.city].filter(Boolean).join(', ')
                                                : '—';

                                            return (
                                                <div
                                                    key={item.userID}
                                                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
                                                                {(currentPage - 1) * pageSize + index + 1}
                                                            </span>
                                                            <div>
                                                                <h3 className="text-sm font-medium text-gray-900">{item.fullName}</h3>
                                                                <p className="text-xs text-gray-500">{item.email}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3 space-y-2">
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <i className="fa-solid fa-phone w-4 mr-2" />
                                                            {item.phoneNumber ?? '—'}
                                                        </div>
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <i className="fa-solid fa-diagram-project w-4 mr-2" />
                                                            {item.projectCount > 0 ? item.projectCount : '—'}
                                                        </div>
                                                    </div>

                                                    <div className="mb-3 space-y-2">
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <i className="fa-solid fa-location-dot w-4 mr-2" />
                                                            {addressText}
                                                        </div>
                                                    </div>

                                                    <div className="flex space-x-2">
                                                        <button
                                                            className="flex-1 px-3 py-2 text-xs font-medium  text-white border rounded-md bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-sm cursor-pointer"
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/Admin/User/${item.userID}`
                                                                )
                                                            }
                                                        >
                                                            <i className="fa-solid fa-eye mr-1" />
                                                            {t('BUTTON.View')}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    }

                                    return (
                                        <div className="py-16 text-center">
                                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <i className="fa-solid fa-users text-gray-400 text-3xl" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {t('adminUserManager.empty')}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {t('adminUserManager.empty_description')}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalUsers > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                    <span>
                                        {totalUsers} {t('adminUserManager.users')}
                                    </span>
                                </div>
                                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                                    <Pagination
                                        current={currentPage}
                                        pageSize={pageSize}
                                        total={totalUsers}
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

        </div>
    );
}