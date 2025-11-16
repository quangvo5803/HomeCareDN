import { useEffect, useState } from 'react';
import { Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import { useReview } from '../../hook/useReview';
import LoadingComponent from '../../components/LoadingComponent';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

export default function AdminReviewManager() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const pageSize = 10;

  const { reviews, totalReviews, loading, fetchReviews } = useReview();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');

  const [searchParams] = useSearchParams();
  const initialRating = searchParams.get('rating') || 'all';
  const [ratingFilter, setRatingFilter] = useState(initialRating);

  useEffect(() => {
    const urlRating = searchParams.get('rating') || 'all';
    if (urlRating !== ratingFilter) {
      setRatingFilter(urlRating);
    }
  }, [searchParams, ratingFilter]);

  useEffect(() => {
    fetchReviews({
      PageNumber: currentPage,
      PageSize: pageSize,
      SortBy: sortBy,
      Rating: ratingFilter === 'all' ? null : parseInt(ratingFilter),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, sortBy, ratingFilter]);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fa-solid fa-star text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-star text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                  {t('adminReviewManager.title')}
                </h1>
                <p className="text-gray-600 text-sm font-medium">
                  {t('adminReviewManager.subtitle')}
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
              <div className="px-5 py-3 bg-orange-500 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-star text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {loading ? 0 : totalReviews || 0}
                    </div>
                    <div className="text-xs text-white/90 font-medium">
                      {t('adminReviewManager.reviews')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sort & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">{t('common.sortDefault')}</option>
                <option value="createat">{t('common.sortDateAsc')}</option>
                <option value="createat_desc">
                  {t('common.sortDateDesc')}
                </option>
                <option value="rating">{t('common.sortRatingAsc')}</option>
                <option value="rating_desc">
                  {t('common.sortRatingDesc')}
                </option>
              </select>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setRatingFilter('all');
                    navigate('?rating=all');
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                    ratingFilter === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <i className="fa-solid fa-star mr-2" />
                  {t('adminReviewManager.all')}
                </button>
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setRatingFilter(star.toString());
                      navigate(`?rating=${star}`);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                      ratingFilter === star.toString()
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {star}
                    <i className="fa-solid fa-star ml-1 text-yellow-400" />
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
                        {t('adminReviewManager.no')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminReviewManager.user')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminReviewManager.partner')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminReviewManager.rating')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminReviewManager.type')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('adminReviewManager.createdAt')}
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
                            <td
                              colSpan="8"
                              className="py-10 text-center align-middle"
                            >
                              <LoadingComponent />
                            </td>
                          </tr>
                        );
                      }

                      if (reviews && reviews.length > 0) {
                        return reviews.map((review, index) => {
                          const reviewType = review.serviceRequestID
                            ? t('roles.Contractor')
                            : review.materialRequestID
                            ? t('roles.Distributor')
                            : '—';

                          return (
                            <tr
                              key={review.reviewID}
                              className={`hover:bg-gray-50 transition-colors duration-150 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                              }`}
                            >
                              <td className="px-4 py-4 text-center align-middle">
                                <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-500 rounded-full shadow-sm">
                                  {(currentPage - 1) * pageSize + index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 align-middle">
                                <div className="text-sm font-medium text-gray-900">
                                  {review.customerName || '—'}
                                </div>
                              </td>
                              <td className="px-6 py-4 align-middle">
                                <div className="text-sm font-medium text-gray-900">
                                  {review.partnerName || '—'}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center align-middle">
                                {renderStars(review.rating)}
                              </td>
                              <td className="px-6 py-4 text-center align-middle">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    reviewType === t('roles.Contractor')
                                      ? 'bg-blue-100 text-blue-800'
                                      : reviewType === t('roles.Distributor')
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {reviewType}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center align-middle">
                                <div className="text-sm text-gray-900">
                                  {formatDate(review.createdAt, i18n.language)}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center align-middle">
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(
                                        `/Admin/ServiceRequestManager/${review.serviceRequestID}`
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
                          <td colSpan="8" className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center text-center mt-5 mb-5">
                              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <i className="fa-solid fa-star text-gray-400 text-3xl" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('adminReviewManager.empty')}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {t('adminReviewManager.empty_description')}
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

                  if (reviews && reviews.length > 0) {
                    return reviews.map((review, index) => {
                      const reviewType = review.serviceRequestID
                        ? t('roles.Contractor')
                        : review.materialRequestID
                        ? t('roles.Distributor')
                        : '—';

                      return (
                        <div
                          key={review.reviewID}
                          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
                                {(currentPage - 1) * pageSize + index + 1}
                              </span>
                              <div className="flex-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                reviewType === t('roles.Contractor')
                                  ? 'bg-blue-100 text-blue-800'
                                  : reviewType === t('roles.Distributor')
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {reviewType}
                            </span>
                          </div>

                          <div className="mb-3 space-y-2">
                            <div className="flex items-center text-xs text-gray-600">
                              <i className="fa-solid fa-user w-4 mr-2" />
                              <span className="font-medium">User:</span>
                              <span className="ml-1">
                                {review.userID || '—'}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <i className="fa-solid fa-briefcase w-4 mr-2" />
                              <span className="font-medium">Partner:</span>
                              <span className="ml-1">
                                {review.partnerID || '—'}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <i className="fa-solid fa-clock w-4 mr-2" />
                              {formatDate(review.createdAt, i18n.language)}
                            </div>
                          </div>

                          {review.comment && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-700">
                                {review.comment}
                              </p>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <button
                              className="flex-1 px-3 py-2 text-xs font-medium text-white border rounded-md bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-sm cursor-pointer"
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/Admin/ServiceRequestManager/${review.serviceRequestID}`
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
                        <i className="fa-solid fa-star text-gray-400 text-3xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {t('adminReviewManager.empty')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('adminReviewManager.empty_description')}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Pagination */}
            {!loading && totalReviews > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50 gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>
                    {totalReviews} {t('adminReviewManager.reviews')}
                  </span>
                </div>
                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalReviews}
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
