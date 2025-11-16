import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMaterialRequest } from '../../hook/useMaterialRequest';
import { useUser } from '../../hook/useUser';
import { useTranslation } from 'react-i18next';
import { formatDate, formatVND } from '../../utils/formatters';
import { toast } from 'react-toastify';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import MaterialRequestModal from '../../components/modal/MaterialRequestModal';
import Swal from 'sweetalert2';

export default function MaterialRequestDetail() {
  const { t, i18n } = useTranslation();
  const { materialRequestId } = useParams();
  const navigate = useNavigate();
  const { addresses } = useUser();

  const [description, setDescription] = useState('');
  const [canEditQuantity, setCanEditQuantity] = useState(false);
  const [canAddMaterial, setCanAddMaterial] = useState(false);
  const [items, setItems] = useState([]);
  const [addressID, setAddressID] = useState('');

  const { loading, getMaterialRequestById, updateMaterialRequest } =
    useMaterialRequest();
  const [materialRequest, setMaterialRequest] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [open, setOpen] = useState(false);
  const [originalItems, setOriginalItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Check if request is in Draft status
  const isDraft = materialRequest?.status === 'Draft';
  const canEdit = isDraft;

  useEffect(() => {
    if (materialRequestId) {
      getMaterialRequestById(materialRequestId).then((data) => {
        if (data) {
          setMaterialRequest(data);
          setDescription(data.description || '');
          setCanAddMaterial(data.canAddMaterial || false);
          setCanEditQuantity(data.canEditQuantity || false);
          setAddressID(data.addressID || '');
          setItems(data.materialRequestItems || []);
          setOriginalItems(data.materialRequestItems || []);
        }
      });
    }
  }, [getMaterialRequestById, materialRequestId]);

  // ===== Kiểm tra thay đổi =====
  const hasItemChanges =
    JSON.stringify(items) !== JSON.stringify(originalItems);
  const hasDescriptionChanges =
    description !== (materialRequest?.description || '');
  const hasAddressChanges = addressID !== (materialRequest?.addressID || '');
  const hasCanEditQuantityChanges =
    canEditQuantity !== materialRequest?.canEditQuantity;
  const hasCanAddMaterialChanges =
    canAddMaterial !== materialRequest?.canAddMaterial;
  const hasAnyChanges =
    hasItemChanges ||
    hasDescriptionChanges ||
    hasAddressChanges ||
    hasCanEditQuantityChanges ||
    hasCanAddMaterialChanges;

  const canShowSaveCancel = hasAnyChanges;
  const canShowSend = items.length > 0 && addressID;

  const handleQuantityChange = (id, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.materialRequestItemID === id
          ? { ...item, quantity: Number(value) }
          : item
      )
    );
  };

  const handleSelectMaterial = (selectedMaterials) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];

      for (const material of selectedMaterials) {
        const existingItemIndex = updatedItems.findIndex(
          (item) => item.material.materialID === material.materialID
        );

        if (existingItemIndex === -1) {
          updatedItems.push({
            materialRequestItemID: crypto.randomUUID(),
            material,
            quantity: 1,
          });
        } else {
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
          };
        }
      }

      return updatedItems;
    });
  };

  const handleSave = async (isSubmit = false) => {
    if (isSubmit) {
      if (!addressID) {
        toast.error(t('ERROR.REQUIRED_ADDRESS'));
        return;
      }
    }
    setSubmitting(true);
    const addItems = items.filter(
      (item) =>
        !originalItems.some(
          (o) => o.materialRequestItemID === item.materialRequestItemID
        )
    );
    const updatedItems = items.filter((item) => {
      const original = originalItems.find(
        (o) => o.materialRequestItemID === item.materialRequestItemID
      );
      return original && original.quantity !== item.quantity;
    });
    const deletedItemIDs = originalItems
      .filter(
        (o) =>
          !items.some(
            (item) => item.materialRequestItemID === o.materialRequestItemID
          )
      )
      .map((o) => o.materialRequestItemID);

    const dto = {
      materialRequestID: materialRequestId,
      description: description,
      canEditQuantity: canEditQuantity,
      canAddMaterial: canAddMaterial,
      isSubmit: isSubmit,
      addItems: addItems.map((a) => ({
        materialID: a.material.materialID,
        quantity: a.quantity,
      })),
      updateItems: updatedItems.map((u) => ({
        materialRequestItemID: u.materialRequestItemID,
        quantity: u.quantity,
      })),
      deleteItemIDs: deletedItemIDs,
    };
    if (addressID) {
      dto.addressID = addressID;
    }
    await updateMaterialRequest(dto);
    setSubmitting(false);
    navigate('/Customer', {
      state: { tab: 'material_requests' },
    });
  };

  const handleCancel = () => {
    Swal.fire({
      title: t('userPage.materialRequestDetail.cancleModalTitle'),
      text: t('userPage.materialRequestDetail.cancleModalText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('BUTTON.Cancel'),
      cancelButtonText: t('BUTTON.Back'),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setItems(originalItems);
          setDescription(materialRequest?.description || '');
          setAddressID(materialRequest?.addressID || '');
          setCanEditQuantity(materialRequest?.canEditQuantity || false);
          setCanAddMaterial(materialRequest?.canAddMaterial || false);
          Swal.close();
        } catch {
          Swal.close();
        }
      }
    });
  };

  if (loading || !materialRequest) return <Loading />;

  const applications = materialRequest.applications || [];
  const selectedAddress = addresses?.find((a) => a.addressID === addressID);
  const addressDisplay = selectedAddress
    ? `${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div
        className={`bg-white shadow-lg ${
          hasAnyChanges ? 'sticky top-24 z-50' : ''
        }`}
      >
        <div className="px-6 lg:px-12 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() =>
                navigate('/Customer', {
                  state: { tab: 'material_requests' },
                })
              }
              className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors font-semibold flex-shrink-0"
            >
              <i className="fas fa-arrow-left"></i>
              <span className="hidden sm:inline text-sm">
                {t('BUTTON.Back')}
              </span>
            </button>

            <h1 className="text-lg lg:text-xl font-bold text-slate-900 flex-1 text-center">
              <i className="fa-solid fa-boxes mr-2 text-orange-600"></i>
              <span className="hidden sm:inline">
                {t('userPage.materialRequestDetail.title')}
              </span>
            </h1>

            {/* Right side - Alert and Actions */}
            {isDraft && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Alert Badge */}
                {hasAnyChanges && (
                  <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border-l-4 border-amber-500 rounded">
                    <i className="fas fa-exclamation-circle text-amber-600 text-xs"></i>
                    <span className="text-xs font-bold text-amber-900 whitespace-nowrap">
                      {t('userPage.materialRequestDetail.unsavedChanges')}
                    </span>
                  </div>
                )}

                {/* Cancel Button */}
                {canShowSaveCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="hidden lg:inline-flex items-center px-3 py-1.5 bg-white text-slate-700 rounded hover:bg-slate-50 transition font-semibold border-2 border-slate-300 text-xs"
                  >
                    <i className="fas fa-times mr-1"></i>
                    {t('BUTTON.Cancel')}
                  </button>
                )}

                {/* Save Button */}
                {canShowSaveCancel && (
                  <button
                    type="button"
                    className="hidden lg:inline-flex items-center px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition font-semibold disabled:opacity-50 text-xs"
                    onClick={() => handleSave(false)}
                    disabled={submitting}
                  >
                    <i className="fas fa-save mr-1"></i>
                    {t('BUTTON.Save')}
                  </button>
                )}

                {/* Send Button */}
                {canShowSend && (
                  <button
                    type="button"
                    className="hidden lg:inline-flex items-center px-3 py-1.5 bg-green-400 text-white rounded hover:bg-green-500 transition font-semibold disabled:opacity-50 text-xs"
                    onClick={() => handleSave(true)}
                    disabled={submitting}
                  >
                    <i className="fas fa-paper-plane mr-1"></i>
                    {t('BUTTON.SendMaterialRequest')}
                  </button>
                )}

                {/* Mobile Action Buttons */}
                {isDraft && (
                  <div className="lg:hidden flex items-center gap-1">
                    {canShowSaveCancel && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="p-2 bg-white text-slate-700 rounded hover:bg-slate-50 transition border-2 border-slate-300 text-xs"
                        title={t('BUTTON.Cancel')}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}

                    {canShowSaveCancel && (
                      <button
                        type="button"
                        className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:opacity-50 text-xs"
                        onClick={() => handleSave(false)}
                        disabled={submitting}
                        title={t('BUTTON.Save')}
                      >
                        <i className="fas fa-save"></i>
                      </button>
                    )}

                    {canShowSend && (
                      <button
                        type="button"
                        className="p-2 bg-green-400 text-white rounded hover:bg-green-500 transition disabled:opacity-50 text-xs"
                        onClick={() => handleSave(true)}
                        disabled={submitting}
                        title={t('BUTTON.SendMaterialRequest')}
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Alert - Show below header on small screens */}
          {isDraft && hasAnyChanges && (
            <div className="lg:hidden mt-2 pt-2 border-t border-slate-200">
              <div className="p-2 bg-amber-50 border-l-4 border-amber-500 rounded flex items-start gap-2">
                <i className="fas fa-exclamation-circle text-amber-600 mt-0.5 flex-shrink-0 text-xs"></i>
                <div>
                  <p className="font-bold text-amber-900 text-xs leading-tight">
                    {t('userPage.materialRequestDetail.unsavedChanges')}
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5 leading-tight">
                    {t('userPage.materialRequestDetail.unsavedChangesDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Left Column - Request Details & Materials */}
          <div className="xl:col-span-3 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <i className="fas fa-boxes text-white text-2xl"></i>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {t('Enums.ServiceType.Material')}
                  </h2>
                  <p className="text-sm text-slate-500 mb-1">
                    {formatDate(materialRequest.createdAt, i18n.language)}
                  </p>
                  <span className="inline-block text-sm font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                    #{materialRequestId.substring(0, 8)}
                  </span>
                  <div className="flex gap-3 mt-1">
                    <StatusBadge
                      status={materialRequest.status}
                      type="Request"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mb-8 pb-8 border-b border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                  <i className="fas fa-map-marker-alt text-orange-600 mr-2"></i>
                  {t('userPage.materialRequestDetail.address')}
                </label>
                {canEdit ? (
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                      value={addressID}
                      onChange={(e) => setAddressID(e.target.value)}
                    >
                      <option value="">
                        {t('userPage.materialRequestDetail.selectAddress')}
                      </option>
                      {addresses?.map((a) => (
                        <option key={a.addressID} value={a.addressID}>
                          {a.detail},{a.ward},{a.district},{a.city}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                ) : (
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                    <p className="text-slate-700">
                      {addressDisplay || t('Not specified')}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                  {t('userPage.materialRequestDetail.description')}
                </label>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-slate-700 placeholder-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canEdit}
                  placeholder={t(
                    'userPage.materialRequestDetail.descriptionsPlaceholder'
                  )}
                />
              </div>

              {/* Checkboxes */}
              {canEdit && (
                <div className="space-y-4">
                  {/* Can Edit Quantity */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow">
                    <label
                      className="flex items-start gap-4 cursor-pointer"
                      aria-label={t(
                        'userPage.materialRequestDetail.allowEditQuantity'
                      )}
                    >
                      <div className="flex items-center h-6 mt-1">
                        <input
                          type="checkbox"
                          checked={canEditQuantity}
                          onChange={(e) => setCanEditQuantity(e.target.checked)}
                          className="w-6 h-6 text-orange-600 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 block mb-1">
                          {t(
                            'userPage.materialRequestDetail.allowEditQuantity'
                          )}
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {t(
                            'userPage.materialRequestDetail.allowEditQuantityDes'
                          )}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <i
                          className={`fas fa-${
                            canEditQuantity
                              ? 'check-circle text-green-500'
                              : 'circle text-gray-300'
                          } text-xl transition-colors`}
                        ></i>
                      </div>
                    </label>
                  </div>

                  {/* Can Add Material */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow">
                    <label
                      className="flex items-start gap-4 cursor-pointer"
                      aria-label={t(
                        'userPage.materialRequestDetail.allowAddMaterial'
                      )}
                    >
                      <div className="flex items-center h-6 mt-1">
                        <input
                          type="checkbox"
                          checked={canAddMaterial}
                          onChange={(e) => setCanAddMaterial(e.target.checked)}
                          className="w-6 h-6 text-orange-600 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 block mb-1">
                          {t('userPage.materialRequestDetail.allowAddMaterial')}
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {t(
                            'userPage.materialRequestDetail.allowAddMaterialDes'
                          )}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <i
                          className={`fas fa-${
                            canAddMaterial
                              ? 'check-circle text-green-500'
                              : 'circle text-gray-300'
                          } text-xl transition-colors`}
                        ></i>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Materials List Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">
                  <i className="fas fa-layer-group mr-3 text-orange-600"></i>
                  {t('userPage.materialRequestDetail.materialList')}
                </h2>
                {items.length > 0 && (
                  <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold">
                    {items.length}{' '}
                    {t('userPage.materialRequestDetail.itemsCount')}
                  </span>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-inbox text-slate-400 text-4xl"></i>
                  </div>
                  <h4 className="font-bold text-slate-700 mb-2 text-lg">
                    {t('userPage.materialRequestDetail.noMaterial')}
                  </h4>
                  <p className="text-sm text-slate-500 mb-6">
                    {t('userPage.materialRequestDetail.addMaterial')}
                  </p>
                  {canEdit && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition font-bold"
                      onClick={() => setOpen(true)}
                    >
                      <i className="fas fa-plus-circle"></i>
                      {t('BUTTON.AddNewMaterial')}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="hidden lg:grid lg:grid-cols-13 gap-4 px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 font-bold text-sm text-slate-700">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-2">
                      {t('userPage.materialRequestDetail.image')}
                    </div>
                    <div className="col-span-4">
                      {t('userPage.materialRequestDetail.infor')}
                    </div>
                    <div className="col-span-2 text-center">
                      {t('userPage.materialRequestDetail.quantity')}
                    </div>
                    <div className="col-span-2 text-center">
                      {t('userPage.materialRequestDetail.unit')}
                    </div>
                    <div className="col-span-2 text-center">
                      {t('userPage.materialRequestDetail.action')}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const imageUrl =
                        item.material.images?.[0].imageUrl ||
                        item.material.imageUrls?.[0];
                      const displayName =
                        i18n.language === 'vi'
                          ? item.material.name
                          : item.material.nameEN || item.material.name;
                      const displayCategory =
                        i18n.language === 'vi'
                          ? item.material.categoryName
                          : item.material.categoryNameEN ||
                            item.material.categoryName;
                      const displayBrand =
                        i18n.language === 'vi'
                          ? item.material.brandName
                          : item.material.brandNameEN ||
                            item.material.brandName;
                      const displayUnit =
                        i18n.language === 'vi'
                          ? item.material.unit
                          : item.material.unitEN || item.material.unit;

                      return (
                        <div
                          key={item.materialRequestItemID}
                          className="border-2 border-slate-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-lg transition-all bg-white group"
                        >
                          {/* Desktop Layout */}
                          <div className="hidden lg:grid lg:grid-cols-13 gap-4 items-center">
                            <div className="col-span-1 text-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mx-auto">
                                <span className="text-white font-bold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                            </div>

                            <div className="col-span-2">
                              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative border-2 border-slate-200 group-hover:border-orange-300 transition-all">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display =
                                        'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`absolute inset-0 flex items-center justify-center ${
                                    imageUrl ? 'hidden' : 'flex'
                                  }`}
                                >
                                  <i className="fas fa-image text-slate-300 text-3xl"></i>
                                </div>
                              </div>
                            </div>

                            <div className="col-span-4">
                              <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 text-sm">
                                {displayName}
                              </h3>
                              <div className="space-y-2">
                                {displayCategory && (
                                  <div className="flex items-center text-xs text-slate-600">
                                    <i className="fas fa-tag text-slate-400 mr-2 w-4"></i>
                                    <span className="truncate font-medium">
                                      {displayCategory}
                                    </span>
                                  </div>
                                )}
                                {displayBrand && (
                                  <div className="flex items-center text-xs text-slate-600">
                                    <i className="fas fa-trademark text-slate-400 mr-2 w-4"></i>
                                    <span className="truncate font-medium">
                                      {displayBrand}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="col-span-2">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      handleQuantityChange(
                                        item.materialRequestItemID,
                                        item.quantity - 1
                                      );
                                    }
                                  }}
                                  className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-orange-500 hover:text-white rounded-lg transition font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={item.quantity <= 1 || !canEdit}
                                >
                                  <i className="fas fa-minus text-xs"></i>
                                </button>
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
                                  disabled={!canEdit}
                                  className="w-16 px-2 py-2 border-2 border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.materialRequestItemID,
                                      item.quantity + 1
                                    )
                                  }
                                  className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-orange-500 hover:text-white rounded-lg transition font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!canEdit}
                                >
                                  <i className="fas fa-plus text-xs"></i>
                                </button>
                              </div>
                            </div>

                            <div className="col-span-2 text-center">
                              {displayUnit && (
                                <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                                  <p className="text-sm font-bold text-slate-900">
                                    {displayUnit}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="col-span-2 flex justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setItems((prev) =>
                                    prev.filter(
                                      (i) =>
                                        i.materialRequestItemID !==
                                        item.materialRequestItemID
                                    )
                                  );
                                }}
                                disabled={!canEdit}
                                className="w-12 h-12 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </div>

                          {/* Mobile Layout */}
                          <div className="lg:hidden space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-sm">
                                    {index + 1}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-900 line-clamp-2">
                                  {displayName}
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setItems((prev) =>
                                    prev.filter(
                                      (i) =>
                                        i.materialRequestItemID !==
                                        item.materialRequestItemID
                                    )
                                  );
                                }}
                                disabled={!canEdit}
                                className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <i className="fas fa-trash-alt text-sm"></i>
                              </button>
                            </div>

                            <div className="flex gap-4">
                              <div className="w-28 h-28 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border-2 border-slate-200">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display =
                                        'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`absolute inset-0 flex items-center justify-center ${
                                    imageUrl ? 'hidden' : 'flex'
                                  }`}
                                >
                                  <i className="fas fa-image text-slate-300 text-2xl"></i>
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="space-y-2 mb-4">
                                  {displayCategory && (
                                    <div className="flex items-center text-xs text-slate-600">
                                      <i className="fas fa-tag text-slate-400 mr-2 w-3"></i>
                                      <span className="truncate">
                                        {displayCategory}
                                      </span>
                                    </div>
                                  )}
                                  {displayBrand && (
                                    <div className="flex items-center text-xs text-slate-600">
                                      <i className="fas fa-star text-yellow-500 mr-2 w-3"></i>
                                      <span className="truncate">
                                        {displayBrand}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t-2 border-slate-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-slate-700">
                                  {t('Quantity')}:
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (item.quantity > 1) {
                                        handleQuantityChange(
                                          item.materialRequestItemID,
                                          item.quantity - 1
                                        );
                                      }
                                    }}
                                    className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-orange-500 hover:text-white rounded-lg transition font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={item.quantity <= 1 || !canEdit}
                                  >
                                    <i className="fas fa-minus text-xs"></i>
                                  </button>
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
                                    disabled={!canEdit}
                                    className="w-16 px-2 py-1 border-2 border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.materialRequestItemID,
                                        item.quantity + 1
                                      )
                                    }
                                    className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-orange-500 hover:text-white rounded-lg transition font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!canEdit}
                                  >
                                    <i className="fas fa-plus text-xs"></i>
                                  </button>
                                </div>
                              </div>
                              {displayUnit && (
                                <p className="text-xs text-slate-500 text-right mt-2 font-semibold">
                                  {displayUnit}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Material Button */}
                  {canEdit && (
                    <button
                      type="button"
                      className="w-full mt-6 flex items-center justify-center gap-2 py-4 px-6 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 font-bold hover:border-orange-500 hover:bg-orange-50 transition-all"
                      onClick={() => setOpen(true)}
                    >
                      <i className="fas fa-plus-circle text-lg"></i>
                      {t('BUTTON.AddNewMaterial')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Applications */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sticky top-42 max-h-[calc(100vh-100px)] overflow-y-auto">
              {selectedApplication ? (
                <>
                  {/* Application Detail View */}
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="flex items-center gap-2 text-slate-600 hover:text-orange-600 mb-8 transition-colors font-bold"
                  >
                    <i className="fas fa-arrow-left"></i>
                    <span>{t('BUTTON.Back')}</span>
                  </button>

                  <div className="text-center mb-8 pb-8 border-b-2 border-slate-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4 shadow-lg">
                      {selectedApplication.supplierName.charAt(0)}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 text-xl">
                      {selectedApplication.supplierName}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-yellow-500 font-bold">
                        <i className="fas fa-star"></i>
                        <span>4.8</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-semibold">
                        <i className="fas fa-check-circle text-green-500 mr-1"></i>
                        150 {t('orders')}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl p-6 mb-8">
                    <p className="text-xs text-green-700 mb-2 uppercase tracking-widest font-bold">
                      {t('Total Price')}
                    </p>
                    <p className="text-4xl font-bold text-green-900 mb-2">
                      {(selectedApplication.totalPrice / 1000000).toFixed(0)}
                      <span className="text-lg font-normal ml-2">
                        {i18n.language === 'vi' ? 'triệu' : 'M'} VNĐ
                      </span>
                    </p>
                    <p className="text-xs text-green-700 font-semibold">
                      {formatVND(selectedApplication.totalPrice)}
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                      <i className="fas fa-sticky-note text-orange-600 mr-2"></i>
                      {t('Notes')}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {selectedApplication.notes || t('No notes')}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
                      <i className="fas fa-address-book text-orange-600 mr-2"></i>
                      {t('Contact')}
                    </h4>
                    <div className="space-y-3">
                      <a
                        href={`tel:${selectedApplication.phone}`}
                        className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition border-2 border-blue-200 hover:border-blue-400 font-semibold text-slate-700"
                      >
                        <i className="fas fa-phone text-blue-600 text-lg w-6"></i>
                        <span>{selectedApplication.phone}</span>
                      </a>
                      <a
                        href={`mailto:${selectedApplication.email}`}
                        className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition border-2 border-purple-200 hover:border-purple-400 font-semibold text-slate-700 break-all"
                      >
                        <i className="fas fa-envelope text-purple-600 text-lg w-6"></i>
                        <span>{selectedApplication.email}</span>
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="px-4 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition font-bold">
                      <i className="fas fa-check mr-2"></i>
                      {t('BUTTON.Accept')}
                    </button>
                    <button className="px-4 py-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-bold border-2 border-red-300">
                      <i className="fas fa-times mr-2"></i>
                      {t('BUTTON.Reject')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Application List View */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900">
                      <i className="fas fa-store text-orange-600 mr-2"></i>
                      {t('Supplier Applications')}
                    </h3>
                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold">
                      {applications.length}
                    </span>
                  </div>

                  {applications.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-store text-slate-400 text-4xl"></i>
                      </div>
                      <h4 className="font-bold text-slate-700 mb-2 text-lg">
                        {t('No applications yet')}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {t('Suppliers will send quotes for your request')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setSelectedApplication(app)}
                          className="w-full text-left p-5 border-2 border-slate-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all group bg-gradient-to-br hover:from-orange-50 hover:to-transparent"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {app.supplierName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition truncate mb-2">
                                {app.supplierName}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-slate-600">
                                <span className="flex items-center gap-1 text-yellow-500 font-bold">
                                  <i className="fas fa-star"></i>
                                  <span>4.8</span>
                                </span>
                                <span>•</span>
                                <span className="font-semibold">
                                  <i className="fas fa-check-circle text-green-500 mr-1"></i>
                                  150 {t('orders')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-lg">
                            {app.notes || t('No additional notes')}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
                            <span className="text-xs text-slate-500 tracking-widest uppercase font-bold">
                              {t('Total')}
                            </span>
                            <span className="text-xl font-bold text-orange-600">
                              {(app.totalPrice / 1000000).toFixed(0)}{' '}
                              <span className="text-xs font-normal">
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
        onSelect={handleSelectMaterial}
      />
    </div>
  );
}
