import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useMaterialRequest } from '../../hook/useMaterialRequest';
import { toast } from 'react-toastify';

export default function ExsitingMaterialRequestModal({
  isOpen,
  onClose,
  materialID,
}) {
  const { t } = useTranslation();
  const { materialRequests, updateMaterialRequest } = useMaterialRequest();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const availableRequests =
    materialRequests?.filter((req) => req.status === 'Draft') || [];

  const handleAddMaterial = async () => {
    if (!selectedRequest) {
      toast.error(t('ERROR.PLEASE_SELECT_REQUEST'));
      return;
    }

    if (quantity < 1) {
      toast.error(t('ERROR.INVALID_QUANTITY'));
      return;
    }

    setSubmitting(true);
    const existed = selectedRequest.materialRequestItems?.find(
      (item) => item.materialID === materialID
    );

    try {
      const dto = {
        materialRequestID: selectedRequest.materialRequestID,
      };
      if (existed) {
        dto.updateItems = [
          {
            materialRequestItemID: existed.materialRequestItemID,
            quantity: existed.quantity + quantity,
          },
        ];
      } else {
        dto.addItems = [
          {
            materialID: materialID,
            quantity: quantity,
          },
        ];
      }

      await updateMaterialRequest(dto);
      handleCloseModal();
    } catch {
      // Provider handler
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedRequest(null);
    setQuantity(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleCloseModal();
  };

  if (!isOpen) return null;

  const renderContent = () => {
    if (availableRequests.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-500 py-16 space-y-4 min-h-[400px]">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <i className="fas fa-inbox text-4xl text-gray-400"></i>
          </div>
          <div className="text-center">
            <p className="text-xl font-medium text-gray-700 mb-1">
              {t('userPage.materialRequest.noRequest')}
            </p>
            <p className="text-sm text-gray-600">
              {t('userPage.materialRequest.letStart')}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Request Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            <i className="fas fa-clipboard-list text-orange-500"></i>
            {t('SELECT_MATERIAL_REQUEST')}
          </label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {availableRequests.map((req) => (
              <div
                key={req.materialRequestID}
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedRequest?.materialRequestID === req.materialRequestID
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 hover:border-orange-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {t('Enums.ServiceType.Material')}
                      </h4>
                      {selectedRequest?.materialRequestID ===
                        req.materialRequestID && (
                        <i className="fas fa-check text-orange-500"></i>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <i className="fas fa-calendar-alt"></i>
                        {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <i className="fas fa-hashtag"></i>
                        {req.materialRequestID.substring(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <i className="fas fa-layer-group text-orange-500"></i>
                      <span>
                        {req.materialRequestItems?.length || 0}{' '}
                        {t('userPage.materialRequest.lbl_materialUnit')}
                      </span>
                    </div>
                    {req.address && (
                      <div className="flex items-start gap-1 text-xs text-gray-600">
                        <i className="fas fa-location-dot text-orange-500 mt-0.5 flex-shrink-0"></i>
                        <span>
                          {[
                            req.address.detail,
                            req.address.ward,
                            req.address.district,
                            req.address.city,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantity Input */}
        {selectedRequest && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              <i className="fas fa-sort-numeric-up text-blue-500"></i>
              {t('userPage.materialRequestDetail.quantity')}
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                className="w-12 h-12 flex items-center justify-center bg-white border border-gray-300 hover:border-blue-500 rounded-lg transition-all font-semibold text-gray-700 hover:text-blue-600"
              >
                <i className="fas fa-minus"></i>
              </button>

              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-lg"
              />

              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-12 h-12 flex items-center justify-center bg-white border border-gray-300 hover:border-blue-500 rounded-lg transition-all font-semibold text-gray-700 hover:text-blue-600"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
    >
      <button
        onClick={handleCloseModal}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        type="button"
      />

      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl z-50 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <h2 className="text-2xl font-bold text-white">
            {t('BUTTON.AddToExisting')}
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-white hover:bg-white/20 rounded-lg w-10 h-10 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

        {/* Footer */}
        {availableRequests.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 border border-gray-200 transition-all"
            >
              {t('BUTTON.Cancel')}
            </button>
            <button
              onClick={handleAddMaterial}
              disabled={!selectedRequest || submitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-check"></i>
              {t('BUTTON.AddToExisting')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

ExsitingMaterialRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  materialID: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  user: PropTypes.object,
};
