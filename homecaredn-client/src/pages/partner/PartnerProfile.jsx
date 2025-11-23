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
              <i className="fa-solid fa-location-dot text-orange-500 mr-2 mt-1"></i>
              <span>
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
        <span>{t('partnerProfile.noAddress') || 'No address'}</span>
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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen rounded-3xl p-4 lg:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-t-3xl mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-user-circle text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {t('partnerProfile.title') || 'My Profile'}
              </h1>
              <p className="text-sm text-white/90">
                {t(`roles.${userDetail?.role}`)}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6 mb-6">
          <Avatar
            name={userDetail?.fullName}
            size="100"
            round
            color="#FB8C00"
            fgColor="#FFF"
            className="shadow-md"
          />

          <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full">
            <div className="space-y-2 flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {userDetail?.fullName || t('partnerProfile.noName')}
              </h2>
              <p className="text-gray-600">
                <i className="fa-solid fa-envelope text-orange-500 mr-2"></i>
                {userDetail?.email}
              </p>
              <p className="text-gray-600">
                <i className="fa-solid fa-phone text-orange-500 mr-2"></i>
                {userDetail?.phoneNumber || t('partnerProfile.noPhone')}
              </p>
              <div className="text-gray-600">{renderAddress()}</div>
            </div>

            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center min-w-[110px]">
                <p className="text-yellow-600 text-sm font-medium">
                  {t('partnerProfile.rating') || 'Rating'}
                </p>
                <p className="text-lg font-bold text-yellow-700 flex items-center justify-center gap-1">
                  <i className="fa-solid fa-star"></i>
                  {userDetail?.averageRating?.toFixed(1) || '0.0'}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center min-w-[110px]">
                <p className="text-blue-600 text-sm font-medium">
                  {t('partnerProfile.projects') || 'Projects'}
                </p>
                <p className="text-lg font-bold text-blue-700">
                  {userDetail?.projectCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-info-circle text-blue-500 text-lg" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('partnerProfile.infoTitle') || 'Profile Information'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('partnerProfile.infoNote') ||
                  'Profile information cannot be edited. Please contact support if you need to update your details.'}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {/* Reviews Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-star text-yellow-500 text-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {t('partnerProfile.customerReviews') || 'Customer Reviews'}
                </h3>
                <p className="text-sm text-gray-500">
                  {totalReviews}{' '}
                  {t('partnerProfile.totalReviews') || 'total reviews'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {userDetail?.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex gap-0.5 justify-end mt-1">
                  {renderStars(Math.round(userDetail?.averageRating || 0))}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-10">
              <LoadingComponent />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.reviewID}
                  className="group relative bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:border-orange-200"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={review.userName}
                        size="40"
                        round
                        color="#3B82F6"
                        fgColor="#FFF"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.userName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <i className="fa-regular fa-calendar" />
                          {formatDate(review.createdAt, i18n.language)}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-gray-700 mb-3 leading-relaxed pl-1">
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
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <i className="text-2xl text-gray-400 fa-solid fa-star"></i>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {t('partnerProfile.noReviews') || 'No reviews yet'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {t('partnerProfile.noReviewsDesc') ||
                    'Complete projects to receive customer reviews'}
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalReviews > 0 && !reviewsLoading && (
            <div className="flex justify-center mt-6 pt-6 border-t border-gray-200">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalReviews}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
