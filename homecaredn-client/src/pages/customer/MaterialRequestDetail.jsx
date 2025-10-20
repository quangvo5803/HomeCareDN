import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMaterialRequest } from '../../hook/useMaterialRequest';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import MaterialRequestModal from '../../components/modal/MaterialRequestModal';

export default function MaterialRequestDetail() {
  const { t, i18n } = useTranslation();
  const { materialRequestId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([]);
  const { loading, getMaterialRequestById } = useMaterialRequest();
  const [materialRequest, setMaterialRequest] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (materialRequestId) {
      getMaterialRequestById(materialRequestId).then((data) => {
        if (data) {
          setMaterialRequest(data);
          setDescription(data.description || '');
          setItems(data.materialRequestItems || []);
        }
      });
    }
  }, [getMaterialRequestById, materialRequestId]);

  const handleQuantityChange = (id, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.materialRequestItemID === id
          ? { ...item, quantity: Number(value) }
          : item
      )
    );
  };

  if (loading || !materialRequest) return <Loading />;

  // Mock data for applications - replace with actual data
  const applications = materialRequest.applications || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-3 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() =>
                navigate('/Customer', {
                  state: { tab: 'material_requests' },
                })
              }
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              <i className="fas fa-arrow-left"></i>
              <span>{t('BUTTON.Back')}</span>
            </button>

            {/* Title */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold text-orange-500">
              <i className="fa-solid fa-boxes mr-2"></i>
              {t('Material Request Detail')}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-boxes text-orange-600 text-xl"></i>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {t('Enums.ServiceType.Material')}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {new Date(materialRequest.createdAt).toLocaleDateString(
                      'vi-VN'
                    )}
                  </p>
                  <span className="text-sm text-gray-500">
                    #{materialRequestId.substring(0, 8)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  {t('Description')}
                </h3>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('Enter description...')}
                />
              </div>
            </div>

            {/* Materials List Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                {t('Materials List')}
              </h2>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-inbox text-gray-400 text-2xl"></i>
                  </div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {t('No materials')}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {t('Add materials to your request')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={item.materialRequestItemID}
                      className="border rounded-lg p-4 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg flex-shrink-0">
                            <span className="text-orange-600 font-semibold">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {i18n.language === 'vi'
                                ? item.material.name
                                : item.material.nameEn}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="text-sm text-gray-500 font-medium">
                            {t('Quantity')}:
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.materialRequestItemID,
                                e.target.value
                              )
                            }
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Material Button */}
              <button
                type="button"
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                onClick={() => setOpen(true)}
              >
                <i className="fas fa-plus-circle"></i>
                {t('Add Material')}
              </button>
            </div>

            {/* Action Buttons - Bottom Left */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate('/Customer', {
                      state: { tab: 'material_requests' },
                    })
                  }
                  className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300"
                >
                  <i className="fas fa-times mr-2"></i>
                  {t('BUTTON.Cancel')}
                </button>
                <button
                  type="button"
                  className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-save mr-2"></i>
                  {t('BUTTON.Save')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Applications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-28">
              {selectedApplication ? (
                <>
                  {/* Application Detail View */}
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors font-medium"
                  >
                    <i className="fas fa-arrow-left"></i>
                    <span>{t('BUTTON.Back')}</span>
                  </button>

                  <div className="text-center mb-6 pb-6 border-b">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
                      {selectedApplication.supplierName.charAt(0)}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">
                      {selectedApplication.supplierName}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-sm mb-2">
                      <span className="flex items-center gap-1 text-yellow-600">
                        <i className="fas fa-star"></i>
                        <span className="font-semibold">4.8</span>
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600">
                        <i className="fas fa-check-circle text-green-500 mr-1"></i>
                        150 {t('orders')}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
                    <p className="text-xs text-green-700 mb-1 uppercase tracking-wide font-medium">
                      {t('Total Price')}
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {(selectedApplication.totalPrice / 1000000).toFixed(0)}
                      <span className="text-lg font-normal">
                        {i18n.language === 'vi' ? ' triệu' : ' M'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedApplication.totalPrice.toLocaleString('vi-VN')}{' '}
                      VNĐ
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      {t('Notes')}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedApplication.notes || t('No notes')}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      {t('Contact')}
                    </h4>
                    <div className="space-y-2">
                      <a
                        href={`tel:${selectedApplication.phone}`}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition border border-blue-100"
                      >
                        <i className="fas fa-phone text-blue-600"></i>
                        <span className="text-sm text-gray-700 font-medium">
                          {selectedApplication.phone}
                        </span>
                      </a>
                      <a
                        href={`mailto:${selectedApplication.email}`}
                        className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition border border-purple-100"
                      >
                        <i className="fas fa-envelope text-purple-600"></i>
                        <span className="text-sm text-gray-700 font-medium">
                          {selectedApplication.email}
                        </span>
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold shadow-sm hover:shadow-md">
                      <i className="fas fa-check mr-2"></i>
                      {t('BUTTON.Accept')}
                    </button>
                    <button className="px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300">
                      <i className="fas fa-times mr-2"></i>
                      {t('BUTTON.Reject')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Application List View */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900">
                      {t('Supplier Applications')}
                    </h3>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {applications.length}
                    </span>
                  </div>

                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-store text-gray-400 text-2xl"></i>
                      </div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        {t('No applications yet')}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {t('Suppliers will send quotes for your request')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                      {applications.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setSelectedApplication(app)}
                          className="w-full text-left p-4 border rounded-lg hover:border-orange-500 hover:shadow-md transition-all group bg-white"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {app.supplierName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition truncate mb-1">
                                {app.supplierName}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <i className="fas fa-star text-yellow-500"></i>
                                  <span className="font-medium">4.8</span>
                                </span>
                                <span>•</span>
                                <span>
                                  <i className="fas fa-check-circle text-green-500 mr-1"></i>
                                  150 {t('orders')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {app.notes || t('No additional notes')}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-xs text-gray-500 tracking-wide uppercase">
                              {t('Total')}
                            </span>
                            <span className="text-lg font-bold text-orange-600">
                              {(app.totalPrice / 1000000).toFixed(0)}{' '}
                              <span className="text-sm">
                                {i18n.language === 'vi' ? 'triệu' : 'M'} VNĐ
                              </span>
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <MaterialRequestModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={(material) => console.log('chose:', material)}
      />
    </div>
  );
}
