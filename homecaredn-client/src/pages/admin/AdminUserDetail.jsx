import { useState, useEffect, useCallback } from 'react';
import { Pagination, Tabs } from 'antd';
import Avatar from 'react-avatar';
import { formatVND, formatDate } from '../../utils/formatters';
import { useUser } from '../../hook/useUser';
import { contractorApplicationService } from '../../services/contractorApplicationService';
import { distributorApplicationService } from '../../services/distributorApplicationService';
import { useServiceRequest } from '../../hook/useServiceRequest';
import { useMaterialRequest } from '../../hook/useMaterialRequest';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';
import { handleApiError } from '../../utils/handleApiError';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../components/LoadingComponent';
import { withMinLoading } from '../../utils/withMinLoading';

export default function AdminUserDetail() {
  const { t, i18n } = useTranslation();
  const { userID } = useParams();
  const { getUserById } = useUser();
  const navigate = useNavigate();

  const [userDetail, setUserDetail] = useState(null);
  const {
    fetchServiceRequests,
    totalServiceRequests,
    loading,
    serviceRequests,
  } = useServiceRequest();
  const {
    fetchMaterialRequests,
    totalMaterialRequests,
    loading: materialLoading,
    materialRequests,
  } = useMaterialRequest();
  const [userLoading, setUserLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMaterialPage, setCurrentMaterialPage] = useState(1);
  const [contractors, setContractors] = useState(null);
  const [distributors, setDistributors] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const [loadingDistributors, setLoadingDistributors] = useState(false);
  const [activeTab, setActiveTab] = useState('service');
  const pageSize = 5;

  // --- Fetch user ---
  useEffect(() => {
    const fetchUserById = async () => {
      try {
        setUserLoading(true);
        if (!userID) return;
        const data = await getUserById(userID);
        setUserDetail(data);
      } catch {
        // Handle error on provider
      } finally {
        setUserLoading(false);
      }
    };
    fetchUserById();
  }, [t, getUserById, userID]);

  // --- Fetch contractors ---
  const executeFetchContractors = useCallback(
    async ({ PageNumber = 1, PageSize = 10, FilterID } = {}) => {
      try {
        if (userDetail?.role !== 'Contractor') {
          return { items: [], totalCount: 0 };
        }

        const data = await contractorApplicationService.getAllByUserIdForAdmin({
          PageNumber,
          PageSize,
          FilterID,
        });

        setContractors(data.items || []);
        setTotalCount(data.totalCount || 0);

        return data.items || [];
      } catch (err) {
        toast.error(t(handleApiError(err)));
        setContractors([]);
        setTotalCount(0);
        return [];
      }
    },
    [userDetail, t]
  );

  const fetchContractors = useCallback(
    async (params = {}) =>
      withMinLoading(
        () => executeFetchContractors(params),
        setLoadingContractors
      ),
    [executeFetchContractors]
  );

  // --- Fetch distributors ---
  const executeFetchDistributors = useCallback(
    async ({ PageNumber = 1, PageSize = 10, FilterID } = {}) => {
      try {
        if (userDetail?.role !== 'Distributor') {
          return { items: [], totalCount: 0 };
        }

        const data = await distributorApplicationService.getAllByUserIdForAdmin(
          {
            PageNumber,
            PageSize,
            FilterID,
          }
        );

        setDistributors(data.items || []);
        setTotalCount(data.totalCount || 0);

        return data.items || [];
      } catch (err) {
        toast.error(t(handleApiError(err)));
        setDistributors([]);
        setTotalCount(0);
        return [];
      }
    },
    [userDetail, t]
  );

  const fetchDistributors = useCallback(
    async (params = {}) =>
      withMinLoading(
        () => executeFetchDistributors(params),
        setLoadingDistributors
      ),
    [executeFetchDistributors]
  );
  //--- Navigate to chat with user ---
  const handleChatWithUser = () => {
    if (!userDetail) return;

    navigate('/Admin/SupportChatManager', {
      state: {
        preselectedUserID: userID,
        userName: userDetail.fullName,
        userEmail: userDetail.email,
        userRole: userDetail.role,
      },
    });
  };
  useEffect(() => {
    if (!userDetail) return;

    const params = {
      PageNumber: currentPage,
      PageSize: pageSize,
      FilterID: userID,
    };

    const materialParams = {
      PageNumber: currentMaterialPage,
      PageSize: pageSize,
      FilterID: userID,
    };

    if (userDetail.role === 'Contractor') {
      fetchContractors(params);
    }

    if (userDetail.role === 'Customer') {
      if (activeTab === 'service') {
        fetchServiceRequests(params);
      } else {
        fetchMaterialRequests(materialParams);
      }
    }

    if (userDetail.role === 'Distributor') {
      fetchDistributors(params);
    }
  }, [
    userDetail,
    userID,
    currentPage,
    currentMaterialPage,
    pageSize,
    activeTab,
    fetchContractors,
    fetchDistributors,
    fetchServiceRequests,
    fetchMaterialRequests,
  ]);

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
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center min-w-[110px]">
              <p className="text-orange-600 text-sm font-medium">
                {t('adminUserManager.projectCount')}
              </p>
              <p className="text-lg font-bold text-orange-700">
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
  // TIẾP TỤC TỪ PART 1...

  // --- Service Requests ---
  const renderServiceRequests = () => {
    if (totalServiceRequests == 0) return renderEmptyState();

    return (
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingComponent />
          </div>
        ) : (
          serviceRequests.map((request) => (
            <div
              key={request.serviceRequestID}
              className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-200"
            >
              <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-gradient-to-br from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-2" />

              <div className="flex justify-between items-start mb-5 pl-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-orange-50 ring-2 ring-orange-200 transition-transform duration-300 group-hover:scale-110">
                      <i className="fa-solid fa-hammer text-orange-600 text-lg" />
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {t(`Enums.ServiceType.${request.serviceType}`)}
                    </h3>
                  </div>
                </div>
                <StatusBadge status={request.status} type="Request" />
              </div>

              <div className="pl-4 mb-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  <i className="fa-solid fa-box-open" />
                  {t(`Enums.PackageOption.${request.packageOption}`)}
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-eye" />
                  {t('BUTTON.View')}
                </button>
              </div>
            </div>
          ))
        )}
        {!loading && totalServiceRequests > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalServiceRequests}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    );
  };

  // --- Material Requests ---
  const renderMaterialRequests = () => {
    if (totalMaterialRequests == 0) return renderEmptyState();

    return (
      <div className="p-6 space-y-4">
        {materialLoading ? (
          <div className="flex justify-center py-10">
            <LoadingComponent />
          </div>
        ) : (
          materialRequests.map((request) => (
            <div
              key={request.materialRequestID}
              className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-200"
            >
              <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-gradient-to-br from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-2" />

              <div className="flex justify-between items-start mb-5 pl-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-orange-50 ring-2 ring-orange-200 transition-transform duration-300 group-hover:scale-110">
                      <i className="fa-solid fa-box text-orange-600 text-lg" />
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {t(`Enums.ServiceType.Material`)}
                    </h3>
                  </div>
                </div>
                <StatusBadge status={request.status} type="Request" />
              </div>

              <div className="pl-4 mb-5 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border ${
                    request.canAddMaterial
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <i
                    className={`fa-solid ${
                      request.canAddMaterial ? 'fa-check' : 'fa-xmark'
                    }`}
                  />
                  {request.canAddMaterial
                    ? t('distributorMaterialRequest.canAddMaterial')
                    : t('distributorMaterialRequest.noAddMaterial')}
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                  <i className="fa-solid fa-cube" />
                  {request.materialRequestItems.length}{' '}
                  {t('adminMaterialRequestManager.items')}
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
                      `/Admin/MaterialRequestManager/${request.materialRequestID}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-eye" />
                  {t('BUTTON.View')}
                </button>
              </div>
            </div>
          ))
        )}
        {!materialLoading && totalMaterialRequests > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination
              current={currentMaterialPage}
              pageSize={pageSize}
              total={totalMaterialRequests}
              onChange={(page) => setCurrentMaterialPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
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
        {contractors.map((request) => (
          <div
            key={request.contractorApplicationID}
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200"
          >
            <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-gradient-to-br from-blue-500 to-blue-600 transition-all duration-300 group-hover:w-2" />

            <div className="flex justify-between items-start mb-5 pl-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50 ring-2 ring-blue-200 transition-transform duration-300 group-hover:scale-110">
                    <i className="fa-solid fa-hammer text-blue-600 text-lg" />
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t(`Enums.ServiceType.${request.serviceType}`)}
                  </h3>
                </div>
              </div>
              <StatusBadge status={request.status} type="Application" />
            </div>

            <div className="pl-4 mb-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <i className="fa-solid fa-coins" />
                {request.estimatePrice
                  ? formatVND(request.estimatePrice)
                  : t('contractorServiceRequestManager.negotiable')}
              </span>
              {request.completedProjectCount > 0 && (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <i className="fa-solid fa-check-circle" />
                  {request.completedProjectCount}{' '}
                  {t('adminUserManager.projectCount')}
                </span>
              )}
              {request.averageRating > 0 && (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                  <i className="fa-solid fa-star" />
                  {request.averageRating.toFixed(1)}
                </span>
              )}
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-eye" />
                {t('BUTTON.View')}
              </button>
            </div>
          </div>
        ))}

        {!loadingContractors && totalCount > 0 && (
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

  // --- Distributors ---
  const renderDistributors = () => {
    const noDistributor = !distributors || distributors.length === 0;
    if (loadingDistributors) {
      return (
        <div className="flex justify-center py-10">
          <LoadingComponent />
        </div>
      );
    }
    if (noDistributor) return renderEmptyState();

    return (
      <div className="space-y-3">
        {distributors.map((request) => (
          <div
            key={request.distributorApplicationID}
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-green-200"
          >
            <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-gradient-to-br from-green-500 to-green-600 transition-all duration-300 group-hover:w-2" />

            <div className="flex justify-between items-start mb-5 pl-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-green-50 ring-2 ring-green-200 transition-transform duration-300 group-hover:scale-110">
                    <i className="fa-solid fa-box text-green-600 text-lg" />
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t(`Enums.ServiceType.Material`)}
                  </h3>
                </div>
              </div>
              <StatusBadge status={request.status} type="Application" />
            </div>

            <div className="pl-4 mb-5 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                  request.items && request.items.length > 0
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <i className="fa-solid fa-cube" />
                {request.items ? request.items.length : 0}{' '}
                {t('adminMaterialRequestManager.items')}
              </span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <i className="fa-solid fa-coins" />
                {request.totalEstimatePrice
                  ? formatVND(request.totalEstimatePrice)
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
                    `/Admin/MaterialRequestManager/${request.materialRequestID}`
                  )
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-eye" />
                {t('BUTTON.View')}
              </button>
            </div>
          </div>
        ))}

        {!loadingDistributors && totalCount > 0 && (
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
      {userLoading ? (
        renderLoading()
      ) : (
        <>
          {renderHeader()}
          {renderUserInfo()}

          {/* CHAT WITH USER BUTTON */}
          <div className="max-w-5xl mx-auto mb-6">
            <button
              onClick={handleChatWithUser}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 font-semibold hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
            >
              <i className="fa-solid fa-message text-xl"></i>
              <span>{t('adminUserManager.userDetail.chatWithUser')}</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Bottom Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 max-w-5xl mx-auto">
            {userDetail?.role === 'Customer' ? (
              <>
                <div className="mb-6">
                  <Tabs
                    activeKey={activeTab}
                    onChange={(key) => {
                      setActiveTab(key);
                      setCurrentPage(1);
                      setCurrentMaterialPage(1);
                    }}
                    items={[
                      {
                        key: 'service',
                        label: (
                          <span className="flex items-center gap-2">
                            <i className="fa-solid fa-hammer"></i>
                            {t('adminUserManager.userDetail.historySR')}
                            <span className="ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                              {totalServiceRequests}
                            </span>
                          </span>
                        ),
                      },
                      {
                        key: 'material',
                        label: (
                          <span className="flex items-center gap-2">
                            <i className="fa-solid fa-box"></i>
                            {t('adminUserManager.userDetail.historyMR')}
                            <span className="ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                              {totalMaterialRequests}
                            </span>
                          </span>
                        ),
                      },
                    ]}
                  />
                </div>

                {activeTab === 'service'
                  ? renderServiceRequests()
                  : renderMaterialRequests()}
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">
                    {userDetail?.role === 'Contractor'
                      ? t('adminUserManager.userDetail.historyCA')
                      : t('adminUserManager.userDetail.historyDA')}
                  </h3>

                  {userDetail?.role === 'Contractor' ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mt-2 sm:mt-0">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      <span>
                        {totalCount}{' '}
                        {t('adminUserManager.userDetail.contractorApplication')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mt-2 sm:mt-0">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>
                        {totalCount}{' '}
                        {t(
                          'adminUserManager.userDetail.distributorApplication'
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {userDetail?.role === 'Contractor'
                  ? renderContractors()
                  : renderDistributors()}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
