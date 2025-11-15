import { useState, useEffect } from 'react';
import { Pagination } from 'antd';
import Avatar from 'react-avatar';
import { formatVND, formatDate } from '../../utils/formatters';
import { useUser } from '../../hook/useUser';
import { contractorApplicationService } from '../../services/contractorApplicationService';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';
import { handleApiError } from '../../utils/handleApiError';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../components/LoadingComponent';

export default function AdminUserDetail() {
  const { t, i18n } = useTranslation();
  const { userID } = useParams();
  const { getUserById } = useUser();
  const navigate = useNavigate();

  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [contractors, setContractors] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const pageSize = 5;

  const createServiceTypeStyle = (color) => ({
    Construction: {
      icon: 'fa-hammer',
      tint: `text-${color}-600`,
      bg: `bg-${color}-50`,
      ring: `ring-${color}-200`,
      accent: `bg-gradient-to-br from-${color}-500 to-${color}-600`,
    },
    Repair: {
      icon: 'fa-screwdriver-wrench',
      tint: `text-${color}-600`,
      bg: `bg-${color}-50`,
      ring: `ring-${color}-200`,
      accent: `bg-gradient-to-br from-${color}-400 via-${color}-500 to-${color}-600`,
    },
  });

  const serviceTypeStyleSR = createServiceTypeStyle('orange');
  const serviceTypeStyleCA = createServiceTypeStyle('blue');

  // --- Fetch user ---
  useEffect(() => {
    const fetchUserById = async () => {
      try {
        if (!userID) return;
        const data = await getUserById(userID);
        setUserDetail(data);
      } catch (err) {
        toast.error(t(handleApiError(err)));
      } finally {
        setLoading(false);
      }
    };
    fetchUserById();
  }, [t, getUserById, userID]);

  // --- Fetch contractors ---
  useEffect(() => {
    const fetchContractors = async () => {
      if (!userDetail) return;
      const role = userDetail.role !== 'Customer';
      const noServiceRequests =
        !userDetail?.serviceRequests || userDetail.serviceRequests.length === 0;

      if (!role || !noServiceRequests) return;

      try {
        setLoadingContractors(true);
        setContractors([]);
        setTotalCount(0);
        const res = await contractorApplicationService.getAllByUserIdForAdmin({
          PageNumber: currentPage,
          PageSize: pageSize,
          FilterID: userID,
        });
        setContractors(res.items || []);
        setTotalCount(res.totalCount || 0);
      } catch (err) {
        toast.error(t(handleApiError(err)));
      } finally {
        setLoadingContractors(false);
      }
    };
    fetchContractors();
  }, [t, userID, currentPage, userDetail]);

  // --- Helpers ---
  const renderAddress = () => {
    if (userDetail.address?.length > 0) {
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
        <span>{t('adminUserManager.userDetail.noAddress')}</span>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingComponent />
    </div>
  );

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-t-3xl mb-5">
      <div className="mx-auto flex items-center gap-4">
        <button
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer"
          onClick={() => navigate('/Admin/UserManager')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold">
          {t(`roles.${userDetail.role}`)}
          {': '}
          {userDetail.fullName}
        </h1>
      </div>
    </div>
  );

  const renderUserInfo = () => (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6 mb-6 max-w-5xl mx-auto">
      <Avatar
        name={userDetail.fullName}
        size="100"
        round
        color="#FB8C00"
        fgColor="#FFF"
        className="shadow-md"
      />

      <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800">
            {userDetail.fullName || t('adminUserManager.userDetail.noName')}
          </h2>
          <p className="text-gray-600">
            <i className="fa-solid fa-envelope text-orange-500 mr-2"></i>
            {userDetail.email}
          </p>
          <p className="text-gray-600">
            <i className="fa-solid fa-phone text-orange-500 mr-2"></i>
            {userDetail.phoneNumber || t('adminUserManager.userDetail.noPhone')}
          </p>
          <div className="text-gray-600">{renderAddress()}</div>
        </div>

        {userDetail?.role === 'Contractor' && (
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center min-w-[110px]">
              <p className="text-yellow-600 text-sm font-medium">
                {t('adminUserManager.userDetail.rating')}
              </p>
              <p className="text-lg font-bold text-yellow-700 flex items-center justify-center gap-1">
                <i className="fa-solid fa-star"></i>
                {userDetail.averageRating.toFixed(1)}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center min-w-[110px]">
              <p className="text-blue-600 text-sm font-medium">
                {t('adminUserManager.projectCount')}
              </p>
              <p className="text-lg font-bold text-blue-700">
                {userDetail.projectCount}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center text-gray-500 py-8">
      <i className="fa-solid fa-inbox text-4xl mb-2"></i>
      <p>{t('adminUserManager.userDetail.history')}</p>
    </div>
  );
  // --- Service Requests ---
  const renderServiceRequests = () => {
    const requests = userDetail?.serviceRequests;
    const noRequests = !requests || requests.length === 0;

    if (noRequests) return renderEmptyState();
    return (
      <div className="p-6 space-y-4">
        {userDetail.serviceRequests.map((request) => {
          const ui = serviceTypeStyleSR[request?.serviceType] || {
            icon: 'fa-wrench',
            tint: 'text-gray-600',
            bg: 'bg-gray-50',
            ring: 'ring-gray-200',
            accent: 'bg-gradient-to-br from-gray-400 to-gray-500',
          };

          return (
            <div
              key={request.serviceRequestID}
              className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-200"
            >
              <div
                className={`absolute inset-y-0 left-0 w-1.5 rounded-l-2xl ${ui.accent} transition-all duration-300 group-hover:w-2`}
              />
              <div className="flex justify-between items-start mb-5 pl-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${ui.bg} ring-2 ${ui.ring} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <i className={`fa-solid ${ui.icon} ${ui.tint} text-lg`} />
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {t(`Enums.ServiceType.${request.serviceType}`)}
                    </h3>
                  </div>
                </div>
                <StatusBadge status={request.status} type="Request" />
              </div>

              <div className="pl-4 mb-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <i className="fa-solid fa-box-open" />
                  {t(`Enums.PackageOption.${request.packageOption}`)}
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  <i className="fa-solid fa-building" />
                  {t(`Enums.BuildingType.${request.buildingType}`)}
                </span>
                {(request?.floors ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                    <i className="fa-solid fa-layer-group" />
                    {request.floors}{' '}
                    {t('contractorServiceRequestDetail.floorsUnit')}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  <i className="fa-solid fa-ruler-combined" />
                  {(request.length * request.width * request.floors).toFixed(
                    1
                  ) || '—'}{' '}
                  m²
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                  <i className="fa-solid fa-coins" />
                  {request.estimatePrice
                    ? formatVND(request.estimatePrice)
                    : t('contractorServiceRequestManager.negotiable')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 pl-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="fa-regular fa-calendar text-gray-400"></i>
                  <span className="font-medium">
                    {formatDate(request.createdAt, i18n.language)}
                  </span>
                </div>
                <button
                  onClick={() =>
                    navigate(
                      `/Admin/ServiceRequestManager/${request.serviceRequestID}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-700 shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-eye" />
                  {t('BUTTON.View')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- Contractors ---
  const renderContractors = () => {
    const noContractor = !contractors || contractors.length === 0;
    if (loadingContractors) {
      return (
        <div className="flex justify-center py-10">
          <LoadingComponent />
        </div>
      );
    }
    if (noContractor) return renderEmptyState();
    return (
      <div className="space-y-3">
        {contractors.map((request) => {
          const ui = serviceTypeStyleCA[request?.serviceType] || {
            icon: 'fa-wrench',
            tint: 'text-gray-600',
            bg: 'bg-gray-50',
            ring: 'ring-gray-200',
            accent: 'bg-gradient-to-br from-gray-400 to-gray-500',
          };

          return (
            <div
              key={request.contractorApplicationID}
              className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200"
            >
              <div
                className={`absolute inset-y-0 left-0 w-1.5 rounded-l-2xl ${ui.accent} transition-all duration-300 group-hover:w-2`}
              />
              <div className="flex justify-between items-start mb-3 pl-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${ui.bg} ring-2 ${ui.ring} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <i className={`fa-solid ${ui.icon} ${ui.tint} text-lg`} />
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {t(`Enums.ServiceType.${request.serviceType}`)}
                    </h3>
                  </div>
                </div>
                <StatusBadge status={request.status} type="Application" />
              </div>

              <div className="pl-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <i className="fa-solid fa-coins" />
                  {request.estimatePrice
                    ? formatVND(request.estimatePrice)
                    : t('contractorServiceRequestManager.negotiable')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 pl-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="fa-regular fa-calendar text-gray-400"></i>
                  <span className="font-medium">
                    {formatDate(request.createdAt, i18n.language)}
                  </span>
                </div>
                <button
                  onClick={() =>
                    navigate(
                      `/Admin/ServiceRequestManager/${request.serviceRequestID}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-600 hover:to-blue-700 shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-eye" />
                  {t('BUTTON.View')}
                </button>
              </div>
            </div>
          );
        })}

        {totalCount > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalCount}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    );
  };

  // --- Render main ---
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen rounded-3xl">
      {loading ? (
        renderLoading()
      ) : (
        <>
          {renderHeader()}
          {renderUserInfo()}

          {/* Bottom Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">
                {userDetail?.role === 'Customer'
                  ? t('adminUserManager.userDetail.historySR')
                  : t('adminUserManager.userDetail.historyCA')}
              </h3>

              {userDetail?.role === 'Customer' ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mt-2 sm:mt-0">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>
                    {userDetail.serviceRequests.length}{' '}
                    {t('adminUserManager.userDetail.serviceRequest')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mt-2 sm:mt-0">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>
                    {totalCount}{' '}
                    {t('adminUserManager.userDetail.contractorApplication')}
                  </span>
                </div>
              )}
            </div>

            {/* Render Service Requests and contractors */}
            {userDetail?.role === 'Customer'
              ? renderServiceRequests()
              : renderContractors()}
          </div>
        </>
      )}
    </div>
  );
}
