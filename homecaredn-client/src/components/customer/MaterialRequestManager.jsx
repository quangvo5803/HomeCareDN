import PropTypes from 'prop-types';
import StatusBadge from '../../components/StatusBadge';
import { useTranslation } from 'react-i18next';
import Loading from '../Loading';
import { useMaterialRequest } from '../../hook/useMaterialRequest';
import { toast } from 'react-toastify';

export default function MaterialRequestManager({ user }) {
  const { t } = useTranslation();
  const {
    loading,
    materialRequests,
    createMaterialRequest,
    deleteMaterialRequest,
  } = useMaterialRequest();

  const handleViewDetail = (materialRequestID) => {
    alert(`Xem chi tiết yêu cầu: ${materialRequestID}`);
  };

  const handleCreate = async () => {
    if (
      materialRequests.filter(
        (m) => m.status == 'Draft' || m.status == 'Pending'
      ).length >= 3
    ) {
      toast.error(t('ERROR.MAXIMUM_MATERIAL_REQUEST'));
      return;
    }
    await createMaterialRequest({ CustomerID: user.id });
  };

  const handleDelete = async (materialRequestID) => {
    await deleteMaterialRequest(materialRequestID);
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            <i className="fas fa-truck text-orange-600 mr-2"></i>
            {t('userPage.materialRequest.title')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('userPage.materialRequest.subtitle')} (
            {materialRequests?.length || 0}/3)
          </p>
        </div>
        <button
          onClick={() => handleCreate()}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          {t('BUTTON.CreateMaterialRequest')}
        </button>
      </div>

      {/* Empty state */}
      {!materialRequests || materialRequests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <i className="fas fa-boxes text-3xl text-orange-600"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {t('userPage.materialRequest.noRequest')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('userPage.materialRequest.letStart')}
          </p>
          <button
            onClick={() => handleCreate()}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            {t('BUTTON.CreateServiceRequest')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {materialRequests.map((req) => (
            <div
              key={req.materialRequestID}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                      <i className="fas fa-boxes text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                        {t('Enums.ServiceType.Material')}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-calendar-alt"></i>
                          {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-hashtag"></i>
                          {req.materialRequestID.substring(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {req.description?.length > 100
                        ? req.description.slice(0, 100) + '...'
                        : req.description}
                    </p>

                    {/* Material Items */}
                    {req.materialRequestItems?.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-list text-orange-500"></i>
                          {t('userPage.materialRequest.lbl_materialList')} (
                          {req.materialRequestItems.length}{' '}
                          {t('userPage.materialRequest.lbl_material')})
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {req.materialRequestItems.slice(0, 4).map((item) => (
                            <div
                              key={item.materialRequestItemID}
                              className="flex items-center gap-2 text-gray-600"
                            >
                              <i className="fas fa-cube text-orange-400 text-xs"></i>
                              <span className="font-medium">
                                {item.materialName}:
                              </span>
                              <span className="text-black font-semibold">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>

                        {req.materialRequestItems.length > 4 && (
                          <div className="text-xs text-gray-500 mt-2 italic">
                            ...{' '}
                            {t('userPage.materialRequest.lbl_andMoreMaterial', {
                              count: req.materialRequestItems.length - 4,
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-500 italic">
                        {t('userPage.materialRequest.lbl_emptyMaterialList')}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={req.status} />
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <i className="fas fa-truck mr-1"></i>
                        {req.distributorApplications.length}{' '}
                        {t('userPage.materialRequest.lbl_distributor')}
                      </span>
                      {req.canEditQuantity && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <i className="fas fa-edit mr-1"></i>
                          {t('userPage.materialRequest.lbl_canEditQuantity')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Detail */}
                      <button
                        className="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-200 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                        onClick={() => handleViewDetail(req.materialRequestID)}
                      >
                        <i className="fas fa-eye"></i>
                        {t('BUTTON.ViewDetail')}
                      </button>

                      {/* Delete */}
                      <button
                        className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-200 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                        onClick={() => handleDelete(req.materialRequestID)}
                      >
                        <i className="fas fa-xmark"></i>
                        {t('BUTTON.Delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

MaterialRequestManager.propTypes = {
  user: PropTypes.object.isRequired,
};
