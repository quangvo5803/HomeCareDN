import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pagination } from 'antd';
import Avatar from 'react-avatar';
import { useAuth } from '../../hook/useAuth';
import { useUser } from '../../hook/useUser';
import LoadingComponent from '../../components/LoadingComponent';
import { formatDate } from '../../utils/formatters';
import { useReview } from '../../hook/useReview';

export default function PartnerProfile() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { getUserById } = useUser();
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const {
    loading: reviewsLoading,
    totalReviews,
    reviews,
    fetchReviews,
  } = useReview();
  const pageSize = 5;

  useEffect(() => {
    const fetchUserById = async () => {
      try {
        setLoading(true);
        if (!user) return;
        const data = await getUserById(user.id);
        fetchReviews({
          PageNumber: currentPage,
          PageSize: pageSize,
          FilterID: user.id,
        });
        setUserDetail(data);
      } catch {
        // Handle error on provider
      } finally {
        setLoading(false);
      }
    };
    fetchUserById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fa-solid fa-star ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderAddress = () => {
    if (userDetail?.address?.length > 0) {
      return (
        <div className="space-y-1">
          {userDetail.address.slice(0, 4).map((addr) => (
            <div key={addr.addressID} className="flex items-start">
              <i className="fa-solid fa-location-dot text-orange-500 mr-2 mt-1 flex-shrink-0"></i>
              <span className="text-sm md:text-base break-words">
                {addr.detail}, {addr.district}, {addr.city}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center">
        <i className="fa-solid fa-location-dot text-gray-500 mr-2"></i>
        <span className="text-sm md:text-base">
          {t('partnerProfile.noAddress') || 'No address'}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen rounded-none md:rounded-3xl p-3 md:p-4 lg:p-6 pb-20 md:pb-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 md:p-6 rounded-2xl md:rounded-t-3xl mb-4 md:mb-5 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-user-circle text-xl md:text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {t('partnerProfile.title') || 'My Profile'}
              </h1>
              <p className="text-xs md:text-sm text-white/90 font-medium">
                {t(`roles.${userDetail?.role}`)}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl shadow-sm md:shadow-md p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-4 md:mb-6">
          <Avatar
            name={userDetail?.fullName}
            round
            color="#FB8C00"
            fgColor="#FFF"
            className="shadow-md flex-shrink-0"
            size={window.innerWidth < 768 ? '80' : '100'}
          />

          <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-center w-full text-center md:text-left gap-4 md:gap-0">
            <div className="space-y-2 flex-1 w-full md:w-auto">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 break-words">
                {userDetail?.fullName || t('partnerProfile.noName')}
              </h2>

              <div className="flex flex-col items-center md:items-start space-y-1">
                <p className="text-gray-600 text-sm md:text-base flex items-center">
                  <i className="fa-solid fa-envelope text-orange-500 mr-2"></i>
                  <span className="break-all">{userDetail?.email}</span>
                </p>
                <p className="text-gray-600 text-sm md:text-base flex items-center">
                  <i className="fa-solid fa-phone text-orange-500 mr-2"></i>
                  {userDetail?.phoneNumber || t('partnerProfile.noPhone')}
                </p>
                <div className="text-gray-600 w-full flex justify-center md:justify-start">
                  {renderAddress()}
                </div>
              </div>
            </div>

            {/* Stats Boxes */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
              {/* Rating Box */}
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-2 md:p-3 text-center min-w-[80px] md:min-w-[100px]">
                <p className="text-yellow-600 text-xs md:text-sm font-medium uppercase tracking-wide">
                  {t('partnerProfile.rating') || 'Rating'}
                </p>
                <p className="text-base md:text-lg font-bold text-yellow-700 flex items-center justify-center gap-1 mt-1">
                  <i className="fa-solid fa-star text-sm md:text-base"></i>
                  {userDetail?.averageRating?.toFixed(1) || '0.0'}
                </p>
              </div>

              {/* Reputation Points Box với Tooltip */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-2 md:p-3 text-center min-w-[80px] md:min-w-[100px] group relative">
                <p className="text-blue-600 text-xs md:text-sm font-medium uppercase tracking-wide flex items-center justify-center gap-1">
                  {t('partnerProfile.reputation') || 'Uy tín'}
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-[10px] cursor-help font-bold">
                    ?
                  </span>
                </p>
                <p className="text-base md:text-lg font-bold text-blue-700 flex items-center justify-center gap-1 mt-1">
                  <i className="fa-solid fa-shield-alt text-sm md:text-base"></i>
                  {userDetail?.reputationPoints ?? 0}
                </p>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                  {t('partnerProfile.reputationTooltip') ||
                    'Điểm uy tín được tính dựa trên đánh giá và giá trị công việc đã hoàn thành'}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>

              {/* Project Scale Counts - khác nhau cho Contractor vs Distributor */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-2 md:p-3 text-center min-w-[120px] md:min-w-[140px]">
                <p className="text-green-600 text-xs md:text-sm font-medium uppercase tracking-wide mb-1">
                  {userDetail?.role === 'Contractor'
                    ? t('partnerProfile.projectsByScale') || 'Dự án'
                    : t('partnerProfile.ordersByScale') || 'Đơn hàng'}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  {userDetail?.role === 'Contractor' ? (
                    <>
                      <span
                        className="flex items-center gap-1"
                        title={t('partnerProfile.smallScale') || 'Quy mô nhỏ'}
                      >
                        <i className="fas fa-home text-green-400"></i>
                        <span className="font-bold text-green-700">
                          {userDetail?.smallScaleProjectCount ?? 0}
                        </span>
                      </span>
                      <span
                        className="flex items-center gap-1"
                        title={t('partnerProfile.mediumScale') || 'Quy mô vừa'}
                      >
                        <i className="fas fa-building text-yellow-500"></i>
                        <span className="font-bold text-yellow-600">
                          {userDetail?.mediumScaleProjectCount ?? 0}
                        </span>
                      </span>
                      <span
                        className="flex items-center gap-1"
                        title={t('partnerProfile.largeScale') || 'Quy mô lớn'}
                      >
                        <i className="fas fa-city text-red-500"></i>
                        <span className="font-bold text-red-600">
                          {userDetail?.largeScaleProjectCount ?? 0}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="flex items-center gap-1"
                        title={t('partnerProfile.smallScale') || 'Quy mô nhỏ'}
                      >
                        <i className="fas fa-box text-green-400"></i>
                        <span className="font-bold text-green-700">
                          {userDetail?.smallScaleProjectCount ?? 0}
                        </span>
                      </span>
                      <span
                        className="flex items-center gap-1"
                        title={t('partnerProfile.mediumScale') || 'Quy mô vừa'}
                      >
                        <i className="fas fa-boxes text-yellow-500"></i>
                        <span className="font-bold text-yellow-600">
                          {userDetail?.mediumScaleProjectCount ?? 0}
                        </span>
                      </span>
                      <span
                        className="flex items-center gap-1"
                        title={t('partnerProfile.largeScale') || 'Quy mô lớn'}
                      >
                        <i className="fas fa-warehouse text-red-500"></i>
                        <span className="font-bold text-red-600">
                          {userDetail?.largeScaleProjectCount ?? 0}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-white rounded-2xl shadow-sm md:shadow-md p-4 mb-4 md:mb-6 border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-info-circle text-blue-500 text-base md:text-lg" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                {t('partnerProfile.infoTitle') || 'Profile Information'}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                {t('partnerProfile.infoNote') ||
                  'Profile information cannot be edited. Please contact support if you need to update your details.'}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm md:shadow-md p-4 md:p-6">
          {/* Reviews Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-star text-yellow-500 text-lg" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  {t('partnerProfile.customerReviews') || 'Customer Reviews'}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  {totalReviews}{' '}
                  {t('partnerProfile.totalReviews') || 'total reviews'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg md:bg-transparent md:p-0">
              <div className="text-left md:text-right flex-1 md:flex-none">
                <span className="text-sm text-gray-600 md:hidden mr-2">
                  Overall:
                </span>
                <span className="text-xl md:text-2xl font-bold text-gray-900">
                  {userDetail?.averageRating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-400 text-sm ml-1">/ 5.0</span>
              </div>
              <div className="flex gap-0.5">
                {renderStars(Math.round(userDetail?.averageRating || 0))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-10">
              <LoadingComponent />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.reviewID}
                  className="group relative bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-5 transition-all duration-300 hover:shadow-md hover:border-orange-200"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Avatar
                        name={review.userName}
                        size="32"
                        round
                        color="#3B82F6"
                        fgColor="#FFF"
                        className="md:w-[40px] md:h-[40px]"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                          {review.userName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
                          <i className="fa-regular fa-calendar" />
                          {formatDate(review.createdAt, i18n.language)}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Mobile */}
                    <div className="flex gap-0.5 transform scale-75 origin-top-right md:scale-100">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-gray-700 text-sm md:text-base mb-3 leading-relaxed pl-1">
                      {review.comment}
                    </p>
                  )}

                  {/* Review Images */}
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="flex gap-2 flex-wrap pl-1">
                      {review.imageUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Review ${idx + 1}`}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 rounded-full bg-white shadow-sm">
                  <i className="text-xl md:text-2xl text-gray-400 fa-solid fa-star"></i>
                </div>
                <h3 className="mb-1 md:mb-2 text-base md:text-lg font-bold text-gray-900">
                  {t('partnerProfile.noReviews') || 'No reviews yet'}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm px-4">
                  {t('partnerProfile.noReviewsDesc') ||
                    'Complete projects to receive customer reviews'}
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalReviews > 0 && !reviewsLoading && (
            <div className="flex justify-center mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 overflow-x-auto">
              <Pagination
                size="small"
                current={currentPage}
                pageSize={pageSize}
                total={totalReviews}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                className="scale-90 md:scale-100 origin-center"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
