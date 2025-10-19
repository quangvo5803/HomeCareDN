import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import StatusBadge from '../../components/StatusBadge';
import { useTranslation } from 'react-i18next';
import Loading from '../Loading';

// Dummy data cho MaterialRequest
const DUMMY_MATERIAL_REQUESTS = [
  {
    materialRequestID: '550e8400-e29b-41d4-a716-446655440001',
    customerID: '550e8400-e29b-41d4-a716-446655440000',
    selectedDistributorApplicationID: null,
    description: 'Cần vật liệu xây dựng cho công trình nhà 3 tầng tại quận 1 ',
    canEditQuantity: true,
    createdAt: '2024-03-15T10:30:00Z',
    status: 'Opening',
    materialRequestItems: [
      { materialName: 'Xi măng', quantity: 100, unit: 'bao' },
      { materialName: 'Cát xây dựng', quantity: 15, unit: 'm³' },
      { materialName: 'Gạch ống', quantity: 5000, unit: 'viên' },
      { materialName: 'Gạch ống', quantity: 5000, unit: 'viên' },
      { materialName: 'Gạch ống', quantity: 5000, unit: 'viên' },
      { materialName: 'Gạch ống', quantity: 5000, unit: 'viên' },
    ],
    distributorApplications: [
      {
        distributorName: 'Công ty TNHH Vật liệu XD Hoàng Anh',
        quotedPrice: 85000000,
      },
      {
        distributorName: 'Công ty CP Xây dựng Minh Phát',
        quotedPrice: 82000000,
      },
    ],
  },
  {
    materialRequestID: '550e8400-e29b-41d4-a716-446655440002',
    customerID: '550e8400-e29b-41d4-a716-446655440000',
    selectedDistributorApplicationID: '550e8400-e29b-41d4-a716-446655440010',
    description: 'Vật liệu hoàn thiện nội thất căn hộ chung cư',
    canEditQuantity: false,
    createdAt: '2024-03-10T14:20:00Z',
    status: 'Closed',
    materialRequestItems: [
      { materialName: 'Gạch lát nền', quantity: 80, unit: 'm²' },
      { materialName: 'Sơn nước cao cấp', quantity: 50, unit: 'thùng' },
      { materialName: 'Đá ốp tường', quantity: 30, unit: 'm²' },
    ],
    distributorApplications: [
      {
        distributorName: 'Showroom Vật liệu Nội thất Luxury',
        quotedPrice: 120000000,
      },
    ],
  },
  {
    materialRequestID: '550e8400-e29b-41d4-a716-446655440003',
    customerID: '550e8400-e29b-41d4-a716-446655440000',
    selectedDistributorApplicationID: null,
    description: 'Vật liệu sửa chữa mái nhà và hệ thống điện',
    canEditQuantity: true,
    createdAt: '2024-03-18T09:15:00Z',
    status: 'Draft',
    materialRequestItems: [
      { materialName: 'Ngói lợp', quantity: 500, unit: 'viên' },
      { materialName: 'Dây điện', quantity: 200, unit: 'mét' },
      { materialName: 'Ống nước PPR', quantity: 100, unit: 'mét' },
    ],
    distributorApplications: [],
  },
];

export default function MaterialRequestManager({ user }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [materialRequests, setMaterialRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMaterialRequests(DUMMY_MATERIAL_REQUESTS);
      setLoading(false);
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const handleViewDetail = (materialRequestID) => {
    alert(`Xem chi tiết yêu cầu: ${materialRequestID}`);
  };

  const handleCreateUpdate = (materialRequestID) => {
    if (materialRequestID) {
      alert(`Chỉnh sửa yêu cầu: ${materialRequestID}`);
    } else {
      alert('Tạo yêu cầu vật liệu mới');
    }
  };

  const handleDelete = (materialRequestID) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu vật liệu này?')) {
      setMaterialRequests((prev) =>
        prev.filter((req) => req.materialRequestID !== materialRequestID)
      );
      alert('Đã xóa yêu cầu thành công!');
    }
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
            Danh sách các yêu cầu vật liệu của bạn (
            {materialRequests?.length || 0}/3)
          </p>
        </div>
        <button
          onClick={() => handleCreateUpdate()}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          {t('BUTTON.CreateServiceRequest')}
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
            onClick={() => handleCreateUpdate()}
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
                    {req.materialRequestItems &&
                      req.materialRequestItems.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-list text-orange-500"></i>
                            Danh sách vật liệu (
                            {req.materialRequestItems.length} loại)
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {req.materialRequestItems
                              .slice(0, 4)
                              .map((item, idx) => (
                                <div
                                  key={idx}
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
                              ... và {req.materialRequestItems.length - 4} vật
                              liệu khác
                            </div>
                          )}
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
