import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";

import { Editor } from "@tinymce/tinymce-react";
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/content/default/content.min.css";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/code";

import { useMaterialRequest } from "../../hook/useMaterialRequest";
import { useAuth } from "../../hook/useAuth";

import StatusBadge from "../../components/StatusBadge";
import Loading from "../../components/Loading";
import MaterialRequestModal from "../../components/modal/MaterialRequestModal";
import { showDeleteModal } from '../../components/modal/DeleteModal';
import Swal from 'sweetalert2';

import { distributorApplicationService } from "../../services/distributorApplicationService";

import { formatDate, formatVND } from "../../utils/formatters";
import { handleApiError } from "../../utils/handleApiError";
import { numberToWordsByLang } from "../../utils/numberToWords";

import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';

export default function MaterialRequestDetail() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const { materialRequestId } = useParams();
    const {
        getMaterialRequestById,
        loading
    } = useMaterialRequest();

    // state
    const [materialRequest, setMaterialRequest] = useState(null);
    const [totalApplications, setTotalApplications] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [existingApplication, setExistingApplication] = useState(null);

    const [newMaterials, setNewMaterials] = useState([]);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [totalEstimatePrice, setTotalEstimatePrice] = useState(0);

    //Realtime
    useRealtime({
        [RealtimeEvents.MaterialRequestDelete]: (payload) => {
            if (payload.materialRequestID === materialRequestId) {
                navigate("/Distributor/MaterialRequest");
                toast.info(t("distributorMaterialRequestDetail.realTime"));
            }
        },
    });

    //  Load material request
    const materialRequestDetail = useCallback(async () => {
        try {
            setIsChecking(true);

            const data = await getMaterialRequestById(materialRequestId);
            const applied = await distributorApplicationService
                .getByMaterialRequestIdForContractor({
                    MaterialRequestID: materialRequestId,
                    DistributorID: user.id,
                });

            setMaterialRequest(data);
            setTotalApplications(data?.distributorApplyCount ?? 0);
            setExistingApplication(applied ?? null);
        } catch (error) {
            toast.error(t(handleApiError(error)));
        } finally {
            setIsChecking(false);
        }
    }, [materialRequestId, user?.id, getMaterialRequestById, t]);

    useEffect(() => {
        if (materialRequestId && user?.id)
            materialRequestDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [materialRequestId, user]);


    //  Permission flags
    const lockedStatuses = ["Pending", "PendingCommission", "Approved"];

    const canEditQuantity =
        !!materialRequest?.canEditQuantity &&
        !lockedStatuses.includes(existingApplication?.status);

    const canAddMaterial = !!materialRequest?.canAddMaterial;
    const canEnterPrice = !lockedStatuses.includes(existingApplication?.status);

    //  Select material
    const handleSelectMaterial = (selectedMaterials) => {
        setNewMaterials((prev) => {
            const updated = [...prev];

            for (const material of selectedMaterials) {
                const idx = updated.findIndex(
                    (item) => item.material.materialID === material.materialID
                );

                if (idx === -1) {
                    updated.push({
                        materialRequestItemID: crypto.randomUUID(),
                        material,
                        quantity: 1,
                    });
                } else {
                    updated[idx] = {
                        ...updated[idx],
                        quantity: updated[idx].quantity + 1,
                    };
                }
            }

            return updated;
        });
    };

    const calculateTotalAll = (existingItems, newItems) => {
        const totalExisting = existingItems.reduce(
            (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
            0
        );
        const totalNew = newItems.reduce(
            (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
            0
        );
        return totalExisting + totalNew;
    };

    //  Update quantity/price EXISTING MATERIAL
    const updateExistingItem = (id, changes) => {
        setMaterialRequest((prev) => {
            const updated = {
                ...prev,
                materialRequestItems: prev.materialRequestItems.map((item) =>
                    item.materialRequestItemID === id ? { ...item, ...changes } : item
                ),
            };

            setTotalEstimatePrice(
                calculateTotalAll(updated.materialRequestItems, newMaterials)
            );

            return updated;
        });
    };

    const handleQuantityChange = (id, value) =>
        updateExistingItem(id, { quantity: Number(value) });

    const handlePriceChange = (id, value) =>
        updateExistingItem(id, { price: value });


    //  Update quantity/price NEW MATERIAL  
    const updateNewItem = (id, changes) => {
        setNewMaterials((prev) => {
            const updated = prev.map((item) =>
                item.materialRequestItemID === id ? { ...item, ...changes } : item
            );

            setTotalEstimatePrice(
                calculateTotalAll(materialRequest.materialRequestItems, updated)
            );

            return updated;
        });
    };

    const handleQuantityChangeNew = (id, value) =>
        updateNewItem(id, { quantity: Number(value) });

    const handlePriceChangeNew = (id, value) =>
        updateNewItem(id, { price: value });


    //  Build items
    const buildItemsByCase = (materialRequest, newMaterials) => {
        const base = materialRequest.materialRequestItems.map((item) => ({
            materialID: item.materialID,
            price: item.price || 0,
            quantity: item.quantity,
            isNew: false,
        }));

        const added = newMaterials.map((item) => ({
            materialID: item.material.materialID,
            price: item.price || 0,
            quantity: item.quantity,
            isNew: true,
        }));

        if (!canAddMaterial && !canEditQuantity) {
            return base.map((item) => ({
                ...item,
                quantity: materialRequest.materialRequestItems.find(
                    (m) => m.materialID === item.materialID
                )?.quantity,
            }));
        }

        if (!canAddMaterial && canEditQuantity) return base;

        if (canAddMaterial && !canEditQuantity) {
            const baseFixed = base.map((item) => ({
                ...item,
                quantity: materialRequest.materialRequestItems.find(
                    (m) => m.materialID === item.materialID
                )?.quantity,
            }));
            return [...baseFixed, ...added];
        }

        return [...base, ...added];
    };

    //  Build DTO
    const buildDto = (materialRequest, user, message, totalEstimatePrice, items) => ({
        materialRequestID: materialRequest.materialRequestID,
        distributorID: user.id,
        message: message,
        totalEstimatePrice: totalEstimatePrice,
        items: items.map((i) => ({
            materialID: i.materialID,
            price: Number(i.price),
            quantity: Number(i.quantity),
        })),
    });

    //  Submit application
    const handleSubmit = async (e) => {
        e.preventDefault();

        const items = buildItemsByCase(materialRequest, newMaterials);
        const dto = buildDto(materialRequest, user, message, totalEstimatePrice, items);

        try {
            await distributorApplicationService.create(dto);
            toast.success(t("SUCCESS.APPLICATION_CREATE"));
            await materialRequestDetail();
        } catch (err) {
            toast.error(t(handleApiError(err)));
        }
    };

    //  Delete application
    const handleDeleteApplication = () => {
        if (!existingApplication) return;
        showDeleteModal({
            t,
            titleKey: 'ModalPopup.DeleteApplicationModal.title',
            textKey: 'ModalPopup.DeleteApplicationModal.text',
            onConfirm: async () => {
                try {
                    await distributorApplicationService.delete(
                        existingApplication.distributorApplicationID
                    );
                    Swal.close();
                    toast.success(t('SUCCESS.DELETE_APPLICATION'));
                    setExistingApplication(null);
                    setMessage('');
                    setTotalEstimatePrice('');
                    setTotalApplications(totalApplications - 1);
                } catch (err) {
                    toast.error(t(handleApiError(err)));
                }
            },
        });
    };

    // Disable button
    const isAllPricesFilled = () => {
        const existingOK = materialRequest?.materialRequestItems?.every(
            (item) => item.price !== undefined && item.price !== null && item.price > 0
        );
        const newOK = newMaterials?.every(
            (item) => item.price !== undefined && item.price !== null && item.price > 0
        );
        return existingOK && newOK;
    };

    const canSubmit = useMemo(() => {
        return message.trim() !== "" && isAllPricesFilled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, materialRequest, newMaterials]);

    if (loading || isChecking || !materialRequest) return <Loading />;

    //  Derived address text
    const addressText = [
        materialRequest?.address?.detail,
        materialRequest?.address?.ward,
        materialRequest?.address?.district,
        materialRequest?.address?.city,
    ]
        .filter(Boolean)
        .join(", ");

    const isRequestClosed = materialRequest.status === "Closed";


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 py-8 px-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 h-12 sm:h-32">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/Distributor/MaterialRequest')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center px-4 py-2 text-white bg-black/20 hover:bg-black/30 rounded-lg transition-colors cursor-pointer"
                >
                    <i className="fas fa-arrow-left mr-2" />
                    {t('distributorMaterialRequestDetail.backToList')}
                </button>

                <div className="px-6 py-6 sm:px-8 sm:py-8 text-white h-full flex items-center justify-center">
                    <div className="max-w-3xl text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold inline-flex items-center gap-3 justify-center">
                            <i className="fas fa-clipboard-list opacity-90" />
                            {t('distributorMaterialRequestDetail.title')}
                        </h1>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                {/* LEFT CONTENT */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Request Info */}
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-300 p-6 space-y-5">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {t('distributorMaterialRequestDetail.info')}
                            </h3>
                            <StatusBadge status={materialRequest.status} type="Request" />
                        </div>
                        <p className="text-gray-700 text-sm">
                            {materialRequest.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                                <i className="fas fa-user text-blue-500"></i>
                                {materialRequest.customerName}
                            </span>

                            <span className="flex items-center gap-2">
                                <i className="fas fa-location-dot text-orange-500"></i>
                                {addressText}
                            </span>
                        </div>
                    </div>

                    {/* Material List */}
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-300 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <i className="fas fa-cubes text-blue-500"></i>
                            {t('distributorMaterialRequestDetail.listMaterial')} ({materialRequest?.materialRequestItems?.length || 0})
                        </h3>

                        <div className="overflow-x-auto">
                            {/* Header */}
                            <div className="hidden lg:grid lg:grid-cols-19 gap-4 px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 font-bold text-sm text-slate-700 text-center">
                                <div className="col-span-1">#</div>
                                <div className="col-span-2">{t('userPage.materialRequestDetail.image')}</div>
                                <div className="col-span-4">{t('userPage.materialRequestDetail.infor')}</div>
                                <div className="col-span-4">{t('userPage.materialRequestDetail.quantity')}</div>
                                <div className="col-span-2">{t('userPage.materialRequestDetail.unit')}</div>
                                <div className="col-span-3">{t('distributorMaterialRequestDetail.price')}</div>
                                <div className="col-span-3">{t('distributorMaterialRequestDetail.totalPrice')}</div>
                            </div>

                            {/* Material */}
                            <div className="space-y-4">
                                {materialRequest.materialRequestItems.map((item, index) => {
                                    const imageUrl =
                                        item.material.images?.[0]?.imageUrl ||
                                        item.material.imageUrls?.[0];

                                    const displayName =
                                        i18n.language === 'vi'
                                            ? item.material.name
                                            : item.material.nameEN || item.material.name;

                                    const displayCategory =
                                        i18n.language === 'vi'
                                            ? item.material.categoryName
                                            : item.material.categoryNameEN || item.material.categoryName;

                                    const displayBrand =
                                        i18n.language === 'vi'
                                            ? item.material.brandName
                                            : item.material.brandNameEN || item.material.brandName;

                                    const displayUnit =
                                        i18n.language === 'vi'
                                            ? item.material.unit
                                            : item.material.unitEN || item.material.unit;

                                    return (
                                        <div
                                            key={item.materialRequestItemID}
                                            className="border-2 border-slate-200 rounded-xl p-5 hover:border-green-300 hover:shadow-lg transition-all bg-white group"
                                        >
                                            <div className="hidden lg:grid lg:grid-cols-19 gap-4 items-center text-center">

                                                {/* STT */}
                                                <div className="col-span-1 flex justify-center">
                                                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                                        <span className="text-white font-bold text-xs">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Image */}
                                                <div className="col-span-2 flex justify-center">
                                                    <div className="aspect-square w-20 bg-slate-100 rounded-xl overflow-hidden relative border-2 border-slate-200 group-hover:border-green-300 transition-all">
                                                        {imageUrl ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={displayName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <i className="fas fa-image text-slate-300 text-3xl"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="col-span-4 text-left">
                                                    <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 text-sm">
                                                        {displayName}
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {displayCategory && (
                                                            <div className="flex items-center justify-start text-xs text-slate-600">
                                                                <i className="fas fa-tag text-slate-400 mr-2 w-4"></i>
                                                                <span className="truncate font-medium">
                                                                    {displayCategory}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {displayBrand && (
                                                            <div className="flex items-center justify-start text-xs text-slate-600">
                                                                <i className="fas fa-trademark text-slate-400 mr-2 w-4"></i>
                                                                <span className="truncate font-medium">
                                                                    {displayBrand}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Quantity */}
                                                <div className="col-span-4 flex justify-center">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                item.quantity > 1 &&
                                                                handleQuantityChange(
                                                                    item.materialRequestItemID,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                            disabled={item.quantity <= 1 || !canEditQuantity}
                                                            className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-orange-500 hover:text-white rounded-lg transition font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            <i className="fas fa-minus text-xs"></i>
                                                        </button>

                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={item.quantity}
                                                            disabled={!canEditQuantity}
                                                            onChange={(e) =>
                                                                handleQuantityChange(
                                                                    item.materialRequestItemID,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-16 px-2 py-2 border-2 border-slate-200 rounded-lg text-center font-bold text-slate-900 text-sm disabled:bg-slate-50"
                                                        />

                                                        <button
                                                            type="button"
                                                            disabled={!canEditQuantity}
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.materialRequestItemID,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                            className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-orange-500 hover:text-white rounded-lg transition font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            <i className="fas fa-plus text-xs"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Unit */}
                                                <div className="col-span-2 flex justify-center">
                                                    <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                                                        <p className="text-sm w-7 h-5 font-bold text-slate-900">
                                                            {displayUnit}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Price Input */}
                                                <div className="col-span-3 flex justify-center">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        disabled={!canEnterPrice}
                                                        value={item.price || ""}
                                                        onChange={(e) =>
                                                            handlePriceChange(item.materialRequestItemID, Number(e.target.value))
                                                        }
                                                        className="w-25 px-3 py-2 border-2 border-slate-200 rounded-lg text-center font-bold text-slate-900 text-sm bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                {/* Total Price */}
                                                <div className="col-span-3 flex justify-center">
                                                    <div className="w-28 px-3 py-2 border-2 border-slate-200 rounded-lg text-center font-bold text-slate-900 text-sm">
                                                        {formatVND(item.price * item.quantity)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Apply Form OR Application Details */}
                    {isRequestClosed && !existingApplication ? (
                        <div className="bg-gray-50 rounded-xl shadow-sm ring-1 ring-gray-200 p-8 text-center">
                            <i className="fas fa-lock text-gray-400 text-4xl mb-3"></i>
                            <p className="text-gray-700 font-semibold mb-1">
                                {t('distributorMaterialRequestDetail.closedApplication')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {t('distributorMaterialRequestDetail.requestAlreadyClosed')}
                            </p>
                        </div>
                    ) : !existingApplication && !isRequestClosed ? (
                        // Apply Form - Show when NOT applied yet and request is not closed
                        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6 inline-flex items-center gap-2">
                                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-50 ring-4 ring-green-100">
                                    <i className="fas fa-clipboard-list text-green-600" />
                                </span>
                                {t('distributorMaterialRequestDetail.applyFormTitle')}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    {/* New Material */}
                                    {canAddMaterial && (
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
                                            <i className="fas fa-cubes text-blue-500 mr-2"></i>
                                            {t('distributorMaterialRequestDetail.additionalSupplies')} ({newMaterials.length || 0})
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                    )}

                                    {newMaterials.length === 0 && canAddMaterial ? (
                                        <div className="text-center py-1">
                                            <div className="text-center py-1">
                                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <i className="fas fa-inbox text-slate-400 text-4xl"></i>
                                                </div>
                                                <h4 className="font-bold text-slate-700 mb-2 text-lg">
                                                    {t('userPage.materialRequestDetail.noMaterial')}
                                                </h4>
                                                <p className="text-sm text-slate-500 mb-6">
                                                    {t('userPage.materialRequestDetail.addMaterial')}
                                                </p>

                                                <button
                                                    type="button"
                                                    className="inline-flex items-center mb-6 gap-2 text-sm px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition font-bold cursor-pointer"
                                                    onClick={() => setOpen(true)}
                                                >
                                                    <i className="fas fa-plus-circle"></i>
                                                    {t('BUTTON.AddNewMaterial')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {newMaterials.length > 0 && canAddMaterial && (
                                                <>
                                                    {/* Table Header */}
                                                    <div className="hidden lg:grid lg:grid-cols-28 gap-4 px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 font-bold text-sm text-slate-700">
                                                        <div className="col-span-2 text-center">#</div>
                                                        <div className="col-span-3 text-center">{t('userPage.materialRequestDetail.image')}</div>
                                                        <div className="col-span-4 text-center">{t('userPage.materialRequestDetail.infor')}</div>
                                                        <div className="col-span-4 text-center">{t('userPage.materialRequestDetail.quantity')}</div>
                                                        <div className="col-span-3 text-center">{t('userPage.materialRequestDetail.unit')}</div>
                                                        <div className="col-span-4 text-center">{t('distributorMaterialRequestDetail.price')}</div>
                                                        <div className="col-span-4 text-center">{t('distributorMaterialRequestDetail.totalPrice')}</div>
                                                        <div className="col-span-4 text-center">{t('userPage.materialRequestDetail.action')}</div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Items List */}
                                            <div className="space-y-4">
                                                {newMaterials.map((item, index) => {
                                                    const imageUrl =
                                                        item.material.images?.[0]?.imageUrl ||
                                                        item.material.imageUrls?.[0];

                                                    const displayName =
                                                        i18n.language === 'vi'
                                                            ? item.material.name
                                                            : item.material.nameEN || item.material.name;

                                                    const displayCategory =
                                                        i18n.language === 'vi'
                                                            ? item.material.categoryName
                                                            : item.material.categoryNameEN || item.material.categoryName;

                                                    const displayBrand =
                                                        i18n.language === 'vi'
                                                            ? item.material.brandName
                                                            : item.material.brandNameEN || item.material.brandName;

                                                    const displayUnit =
                                                        i18n.language === 'vi'
                                                            ? item.material.unit
                                                            : item.material.unitEN || item.material.unit;

                                                    return (
                                                        <div
                                                            key={item.materialRequestItemID}
                                                            className="border-2 border-slate-200 rounded-xl p-5 hover:border-green-300 hover:shadow-lg transition-all bg-white group"
                                                        >
                                                            {/* Desktop Layout */}
                                                            <div className="hidden lg:grid lg:grid-cols-28 gap-4 items-center">

                                                                {/* Index */}
                                                                <div className="col-span-2 flex justify-center">
                                                                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                                                        <span className="text-white font-bold text-xs">
                                                                            {index + 1}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Image */}
                                                                <div className="col-span-3 flex justify-center">
                                                                    <div className="aspect-square w-20 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 group-hover:border-green-300 transition-all">
                                                                        {imageUrl ? (
                                                                            <img
                                                                                src={imageUrl}
                                                                                alt={displayName}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    e.target.style.display = 'none';
                                                                                    e.target.nextElementSibling.style.display = 'flex';
                                                                                }}
                                                                            />
                                                                        ) : null}
                                                                        <div
                                                                            className={`absolute inset-0 flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
                                                                        >
                                                                            <i className="fas fa-image text-slate-300 text-3xl"></i>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Info */}
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

                                                                {/* Quantity */}
                                                                <div className="col-span-4 flex justify-center">
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (item.quantity > 1) {
                                                                                    handleQuantityChangeNew(item.materialRequestItemID, item.quantity - 1);
                                                                                }
                                                                            }}
                                                                            className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-orange-500 hover:text-white rounded-lg transition font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                                            disabled={item.quantity <= 1 || !canAddMaterial}
                                                                        >
                                                                            <i className="fas fa-minus text-xs"></i>
                                                                        </button>

                                                                        <input
                                                                            type="number"
                                                                            min={1}
                                                                            value={item.quantity}
                                                                            onChange={(e) =>
                                                                                handleQuantityChangeNew(item.materialRequestItemID, e.target.value)
                                                                            }
                                                                            disabled={!canAddMaterial}
                                                                            className="w-16 px-2 py-2 border-2 border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                                                                        />

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleQuantityChangeNew(item.materialRequestItemID, item.quantity + 1)
                                                                            }
                                                                            className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-orange-500 hover:text-white rounded-lg transition font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                                            disabled={!canAddMaterial}
                                                                        >
                                                                            <i className="fas fa-plus text-xs"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Unit */}
                                                                <div className="col-span-3 flex justify-center">
                                                                    {displayUnit && (
                                                                        <div className="bg-slate-50 rounded-lg w-10 h-10 flex items-center justify-center border border-slate-200">
                                                                            <p className="text-sm font-bold text-slate-900">
                                                                                {displayUnit}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Price */}
                                                                <div className="col-span-4 flex justify-center">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        value={item.price || ""}
                                                                        className="w-25 px-3 py-2 border-2 border-slate-200 rounded-lg text-center 
                                                                            focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                                                                        placeholder="0"
                                                                        onChange={(e) =>
                                                                            handlePriceChangeNew(item.materialRequestItemID, Number(e.target.value))
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* Total Price */}
                                                                <div className="col-span-4 flex justify-center">
                                                                    <div className="w-28 px-3 py-2 border-2 border-slate-200 rounded-lg text-center font-bold text-slate-900 text-sm">
                                                                        {formatVND(item.price * item.quantity)}
                                                                    </div>
                                                                </div>

                                                                {/* Delete */}
                                                                <div className="col-span-4 flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setNewMaterials((prev) =>
                                                                                prev.filter((i) => i.materialRequestItemID !== item.materialRequestItemID)
                                                                            );
                                                                        }}
                                                                        disabled={!canAddMaterial}
                                                                        className="w-12 h-12 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                                    >
                                                                        <i className="fas fa-trash-alt"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>


                                            {/* Add Material Button */}
                                            {canAddMaterial && (
                                                <button
                                                    type="button"
                                                    className="w-full mt-6 flex items-center mb-6 justify-center gap-2 py-4 px-6 border-2 border-dashed border-green-300 rounded-xl text-green-600 font-bold hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer"
                                                    onClick={() => setOpen(true)}
                                                >
                                                    <i className="fas fa-plus-circle text-lg"></i>
                                                    {t('BUTTON.AddNewMaterial')}
                                                </button>
                                            )}
                                        </>
                                    )}


                                    {/* estimate Price */}
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <i className="fas fa-coins text-orange-500 mr-2"></i>
                                        {t('distributorMaterialRequestDetail.totalEstimatePrice')}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <div
                                        className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    >
                                        {formatVND(totalEstimatePrice)}
                                    </div>
                                    {totalEstimatePrice && (
                                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                                            <p>
                                                {t('distributorMaterialRequestDetail.bidPriceLabel')}{' '}
                                                <span className="font-semibold text-orange-600">
                                                    {formatVND(Number(totalEstimatePrice))}
                                                </span>
                                            </p>
                                            <p>
                                                {t('distributorMaterialRequestDetail.bidPriceInWords')}{' '}
                                                <span className="font-semibold">
                                                    {numberToWordsByLang(
                                                        Number(totalEstimatePrice),
                                                        i18n.language
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Note (TinyMCE Editor) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <i className="fas fa-comment-alt mr-2 text-gray-500" />
                                        {t('distributorMaterialRequestDetail.noteToOwner')}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Editor
                                        value={message}
                                        init={{
                                            license_key: 'gpl',
                                            height: 500,
                                            menubar: false,
                                            plugins: 'lists link image code',
                                            toolbar:
                                                'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
                                            skin: false,
                                            content_css: false,
                                        }}
                                        onEditorChange={(content) => setMessage(content)}
                                    />
                                </div>

                                {/* Submit */}
                                <div>
                                    <button
                                        type="submit"
                                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={!canSubmit}
                                    >
                                        <i className="fas fa-paper-plane" />
                                        {t('distributorMaterialRequestDetail.applyForProject')}
                                    </button>
                                    <p className="mt-3 text-xs text-gray-500 text-center">
                                        <i className="fas fa-shield-alt mr-1" />
                                        {t('distributorMaterialRequestDetail.privacyNotice')}
                                    </p>
                                </div>
                            </form>
                        </div>
                    ) : (
                        // Application Details - Show when ALREADY applied
                        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-800 inline-flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 ring-4 ring-blue-100">
                                        <i className="fas fa-clipboard-check text-blue-600" />
                                    </span>
                                    {t('distributorMaterialRequestDetail.yourApplication')}
                                </h3>
                                <StatusBadge
                                    status={existingApplication.status}
                                    type="Application"
                                />
                            </div>

                            {/* Selected Badge for PendingCommission */}
                            {existingApplication.status === 'PendingCommission' && (
                                <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg p-4 ring-2 ring-yellow-400">
                                    <div className="flex items-center gap-3">
                                        <i className="fas fa-trophy text-yellow-500 text-3xl"></i>
                                        <div>
                                            <p className="font-bold text-green-700 text-lg">
                                                {t('distributorMaterialRequestDetail.youAreSelected')}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {t(
                                                    'distributorMaterialRequestDetail.selectedPendingCommissionNote'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                {/* Header */}
                                <div className="hidden lg:grid lg:grid-cols-18 gap-4 px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 font-bold text-sm text-slate-700 text-center">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-2">{t('userPage.materialRequestDetail.image')}</div>
                                    <div className="col-span-4">{t('userPage.materialRequestDetail.infor')}</div>
                                    <div className="col-span-3">{t('userPage.materialRequestDetail.quantity')}</div>
                                    <div className="col-span-2">{t('userPage.materialRequestDetail.unit')}</div>
                                    <div className="col-span-3">{t('distributorMaterialRequestDetail.price')}</div>
                                    <div className="col-span-3">{t('distributorMaterialRequestDetail.totalPrice')}</div>
                                </div>

                                {/* Material */}
                                <div className="space-y-4">
                                    {existingApplication.items.map((item, index) => {
                                        const imageUrl =
                                            item.images?.[0]?.imageUrl ||
                                            item.imageUrls?.[0];

                                        const displayName =
                                            i18n.language === 'vi'
                                                ? item.name
                                                : item.nameEN || item.name;

                                        const displayCategory =
                                            i18n.language === 'vi'
                                                ? item.categoryName
                                                : item.categoryNameEN || item.categoryName;

                                        const displayBrand =
                                            i18n.language === 'vi'
                                                ? item.brandName
                                                : item.brandNameEN || item.brandName;

                                        const displayUnit =
                                            i18n.language === 'vi'
                                                ? item.unit
                                                : item.unitEN || item.unit;

                                        return (
                                            <div
                                                key={item.materialID}
                                                className="border-2 border-slate-200 rounded-xl p-5 hover:border-green-300 hover:shadow-lg transition-all bg-white group"
                                            >
                                                <div className="hidden lg:grid lg:grid-cols-18 gap-4 items-center text-center">

                                                    {/* STT */}
                                                    <div className="col-span-1 flex justify-center">
                                                        <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                                            <span className="text-white font-bold text-xs">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Image */}
                                                    <div className="col-span-2 flex justify-center">
                                                        <div className="aspect-square w-20 bg-slate-100 rounded-xl overflow-hidden relative border-2 border-slate-200 group-hover:border-green-300 transition-all">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={displayName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <i className="fas fa-image text-slate-300 text-3xl"></i>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="col-span-4 text-left">
                                                        <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 text-sm">
                                                            {displayName}
                                                        </h3>

                                                        <div className="space-y-2">
                                                            {displayCategory && (
                                                                <div className="flex items-center justify-start text-xs text-slate-600">
                                                                    <i className="fas fa-tag text-slate-400 mr-2 w-4"></i>
                                                                    <span className="truncate font-medium">
                                                                        {displayCategory}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {displayBrand && (
                                                                <div className="flex items-center justify-start text-xs text-slate-600">
                                                                    <i className="fas fa-trademark text-slate-400 mr-2 w-4"></i>
                                                                    <span className="truncate font-medium">
                                                                        {displayBrand}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="col-span-3 flex justify-center">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-13 px-2 py-2 border-2 border-slate-200 rounded-lg text-center font-bold text-slate-900 text-sm disabled:bg-slate-50"
                                                            >
                                                                {item.quantity}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Unit */}
                                                    <div className="col-span-2 flex justify-center">
                                                        <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                                                            <p className="text-sm w-7 h-5 font-bold text-slate-900">
                                                                {displayUnit}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="col-span-3 flex justify-center">
                                                        <div
                                                            className="w-28 px-3 py-2 border-2 border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                                                        >
                                                            {formatVND(item.price)}
                                                        </div>
                                                    </div>
                                                    {/* Total Price */}
                                                    <div className="col-span-3 flex justify-center">
                                                        <div className="w-28 px-3 py-2 border-2 border-slate-200 rounded-lg text-center font-bold text-slate-900 text-sm">
                                                            {formatVND(item.price * item.quantity)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bid Price */}
                            <div className="bg-orange-50 rounded-lg p-5 ring-1 ring-orange-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="fas fa-coins text-orange-500 text-xl"></i>
                                    <p className="text-sm font-medium text-gray-700">
                                        {t('distributorMaterialRequestDetail.yourBid')}
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 mb-1">
                                    {formatVND(existingApplication.totalEstimatePrice)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {numberToWordsByLang(
                                        existingApplication.estimatePrice,
                                        i18n.language
                                    )}
                                </p>
                            </div>

                            {/* Description */}
                            {existingApplication.message && (
                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <i className="fas fa-comment-alt text-gray-700"></i>
                                        {t('distributorMaterialRequestDetail.noteToOwner')}
                                    </h4>
                                    <div
                                        className="prose prose-sm max-w-none text-gray-900 bg-gray-50 rounded-lg p-4"
                                        dangerouslySetInnerHTML={{
                                            __html: existingApplication.message,
                                        }}
                                    />
                                </div>
                            )}

                            {/* Applied Date */}
                            {existingApplication.createdAt && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-900 flex items-center gap-2">
                                        <i className="fas fa-calendar text-gray-700"></i>
                                        {t('distributorMaterialRequestDetail.appliedDate')}:{' '}
                                        <span className="font-medium">
                                            {formatDate(existingApplication.createdAt, i18n.language)}
                                        </span>
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="border-t pt-6 space-y-3">
                                {existingApplication.status === 'PendingCommission' && (
                                    <>
                                        {/* Commission Calculation Info Box */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 ring-1 ring-blue-200 space-y-4">
                                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                <i className="fas fa-calculator text-blue-600"></i>
                                                {t(
                                                    'distributorMaterialRequestDetail.commissionCalculation'
                                                )}
                                            </h4>

                                            {/* 🟢 Hiển thị bảng các mức commission tier */}
                                            <div className="bg-white/60 rounded-md p-3 ring-1 ring-blue-100">
                                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                                    {t(
                                                        'distributorMaterialRequestDetail.publicCommissionTiers'
                                                    )}
                                                </p>
                                                <table className="w-full text-xs text-gray-700">
                                                    <thead>
                                                        <tr className="border-b border-blue-200 text-left text-[13px] font-semibold">
                                                            <th className="py-1">
                                                                {t('distributorMaterialRequestDetail.priceRange')}
                                                            </th>
                                                            <th className="py-1">
                                                                {t('distributorMaterialRequestDetail.rate')}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="py-1 text-gray-500">
                                                                {t('distributorMaterialRequestDetail.tier1')}
                                                            </td>
                                                            <td className="py-1 text-blue-600 font-medium">
                                                                2%
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="py-1 text-gray-500">
                                                                {t('distributorMaterialRequestDetail.tier2')}
                                                            </td>
                                                            <td className="py-1 text-blue-600 font-medium">
                                                                1.5%
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="py-1 text-gray-500">
                                                                {t('distributorMaterialRequestDetail.tier3')}
                                                            </td>
                                                            <td className="py-1 text-blue-600 font-medium">
                                                                1%
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* 🔵 Phần tính toán riêng cho application hiện tại */}
                                            {(() => {
                                                const estimatePrice = Number(
                                                    existingApplication.estimatePrice
                                                );
                                                let commission = 0;
                                                let rate = 0;
                                                let tierInfo = '';

                                                if (estimatePrice <= 500_000_000) {
                                                    commission = estimatePrice * 0.02;
                                                    rate = 2;
                                                    tierInfo = t('distributorMaterialRequestDetail.tier1');
                                                } else if (estimatePrice <= 2_000_000_000) {
                                                    commission = estimatePrice * 0.015;
                                                    rate = 1.5;
                                                    tierInfo = t('distributorMaterialRequestDetail.tier2');
                                                } else {
                                                    commission = estimatePrice * 0.01;
                                                    if (commission > 100_000_000)
                                                        commission = 100_000_000;
                                                    rate = 1;
                                                    tierInfo = t('distributorMaterialRequestDetail.tier3');
                                                }

                                                return (
                                                    <div className="space-y-2">
                                                        {/* Estimate Price */}
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {t('distributorMaterialRequestDetail.yourBid')}:
                                                            </span>
                                                            <span className="font-semibold text-gray-900">
                                                                {formatVND(estimatePrice)}
                                                            </span>
                                                        </div>

                                                        {/* Commission Rate */}
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {t(
                                                                    'distributorMaterialRequestDetail.commissionRate'
                                                                )}
                                                                :
                                                            </span>
                                                            <span className="font-semibold text-blue-600">
                                                                {rate}% ({tierInfo})
                                                            </span>
                                                        </div>

                                                        <div className="border-t border-blue-200 my-2"></div>

                                                        {/* Total Commission */}
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {t(
                                                                    'distributorMaterialRequestDetail.commissionToPay'
                                                                )}
                                                                :
                                                            </span>
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold text-blue-700">
                                                                    {formatVND(commission)}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {numberToWordsByLang(
                                                                        commission,
                                                                        i18n.language
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Max cap note */}
                                                        {estimatePrice > 2_000_000_000 &&
                                                            commission >= 100_000_000 && (
                                                                <div className="bg-yellow-50 rounded p-2 ring-1 ring-yellow-200">
                                                                    <p className="text-xs text-yellow-700 flex items-center gap-1">
                                                                        <i className="fas fa-info-circle"></i>
                                                                        {t(
                                                                            'distributorMaterialRequestDetail.maxCommissionNote'
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* <button
                                            onClick={handlePayCommission}
                                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 font-semibold"
                                        >
                                            <i className="fas fa-hand-holding-usd" />
                                            {t('distributorMaterialRequestDetail.payCommission')}
                                        </button> */}

                                        {existingApplication.dueCommisionTime && (
                                            <CommissionCountdown
                                                dueCommisionTime={existingApplication.dueCommisionTime}
                                                onExpired={() => {
                                                    toast.warning(
                                                        t(
                                                            'distributorMaterialRequestDetail.paymentDeadlineExpired'
                                                        )
                                                    );
                                                }}
                                            />
                                        )}
                                    </>
                                )}

                                {existingApplication.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={handleDeleteApplication}
                                            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 font-semibold"
                                        >
                                            <i className="fas fa-trash-alt" />
                                            {t('distributorMaterialRequestDetail.deleteApplication')}
                                        </button>
                                        <p className="text-xs text-gray-500 text-center">
                                            <i className="fas fa-info-circle mr-1" />
                                            {t(
                                                'distributorMaterialRequestDetail.canDeleteWhilePending'
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-300 p-6 lg:sticky lg:top-24 space-y-5">
                        {/*Create Date */}
                        <div className="pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2 mr-5">
                                <i className="fas fa-calendar text-gray-500" />
                                {t('distributorMaterialRequestDetail.createAt')}
                            </h3>
                            {formatDate(materialRequest.createdAt, i18n.language)}
                        </div>
                        <div className="pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                                <i className="fa-solid fa-user-shield text-gray-500" />
                                {t('distributorMaterialRequestDetail.materialRights')}
                            </h3>

                            <div className="grid grid-cols-2 gap-3">

                                {/* Ô canAddMaterial */}
                                <div
                                    className={`p-4 rounded-lg text-center border 
                                        ${canAddMaterial
                                            ? "bg-green-50 border-green-200"
                                            : "bg-red-50 border-red-200"
                                        }`}
                                >
                                    <p className="text-sm text-gray-800 mb-2 whitespace-nowrap">
                                        {t('distributorMaterialRequest.canAddMaterial')}
                                    </p>

                                    <div className="flex flex-col items-center gap-1">
                                        <i
                                            className={`fa-solid text-xl 
                                            ${canAddMaterial ? "fa-check text-green-600" : "fa-xmark text-red-600"}
                                        `}
                                        />
                                    </div>
                                </div>

                                {/* Ô canEditQuantity */}
                                <div
                                    className={`p-4 rounded-lg text-center border 
                                        ${canEditQuantity
                                            ? "bg-green-50 border-green-200"
                                            : "bg-red-50 border-red-200"
                                        }`}
                                >
                                    <p className="text-sm text-gray-800 mb-2 whitespace-normal">
                                        {t('distributorMaterialRequest.canEditQuantity')}
                                    </p>

                                    <div className="flex flex-col items-center gap-1">
                                        <i
                                            className={`fa-solid text-xl 
                                            ${canEditQuantity ? "fa-check text-green-600" : "fa-xmark text-red-600"}
                                        `}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>


                        {/* Status Badge */}
                        <div className="pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2 mr-5">
                                <i className="fas fa-info-circle text-gray-500" />
                                {t('distributorMaterialRequestDetail.projectStatus')}
                            </h3>
                            <StatusBadge status={materialRequest.status} type="Request" />
                        </div>

                        {/* Contractors Info */}
                        <div className="pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                                <i className="fas fa-users text-gray-500" />
                                {t('distributorMaterialRequestDetail.distributorApplied')}
                            </h3>
                            <div className="bg-green-50 rounded-lg p-4 ring-1 ring-green-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">
                                        {t('distributorMaterialRequestDetail.totalApplications')}
                                    </span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {totalApplications}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Application Status Summary */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-flex items-center gap-2">
                                <i className="fas fa-clipboard-check text-gray-500" />
                                {t('distributorMaterialRequestDetail.applicationStatus')}
                            </h3>

                            {/* No application from current contractor */}
                            {existingApplication ? (
                                /* existingApplication exists -> show details */
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-4">
                                        <StatusBadge
                                            status={existingApplication.status}
                                            type={'Application'}
                                        />
                                    </div>

                                    <div className="bg-orange-50 rounded-lg  p-3 ring-1 ring-orange-200">
                                        <p className="text-xs text-black mb-1">
                                            {t('distributorMaterialRequestDetail.yourBid')}
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatVND(existingApplication.totalEstimatePrice)}
                                        </p>
                                    </div>

                                    {/* If request closed, show appropriate note */}
                                    {isRequestClosed && (
                                        <>
                                            {/* You were approved */}
                                            {existingApplication.status === 'Approved' && (
                                                <div className="bg-green-50 rounded-lg p-3 ring-1 ring-green-200">
                                                    <p className="text-xs text-green-700 flex items-center gap-2">
                                                        <i className="fas fa-check-circle" />
                                                        {t(
                                                            'distributorMaterialRequestDetail.requestApprovedNote'
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Request closed and awarded to another contractor (not you) */}
                                            {materialRequest.selectedDistributorApplication
                                                ?.distributorID &&
                                                materialRequest.selectedDistributorApplication
                                                    .distributorID !== user.id && (
                                                    <div className="bg-yellow-50 rounded-lg p-3 ring-1 ring-yellow-200">
                                                        <p className="text-xs text-yellow-700 flex items-center gap-2">
                                                            <i className="fas fa-info-circle" />
                                                            {t(
                                                                'distributorMaterialRequestDetail.requestClosedNote'
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 ring-1 ring-gray-200 text-center">
                                    {isRequestClosed ? (
                                        <>
                                            <i className="fas fa-ban text-gray-400 text-3xl mb-2" />
                                            <p className="text-sm font-semibold text-gray-700 mb-1">
                                                {t('distributorMaterialRequestDetail.closedApplication')}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                {t(
                                                    'distributorMaterialRequestDetail.requestAlreadyClosed'
                                                )}
                                            </p>

                                            {/* If request closed and selected contractor is someone else -> show note */}
                                            {materialRequest.selectedDistributorApplication
                                                ?.distributorID &&
                                                materialRequest.selectedDistributorApplication
                                                    .distributorID !== user.id && (
                                                    <div className="bg-yellow-50 rounded-lg p-3 ring-1 ring-yellow-200 mt-2">
                                                        <p className="text-xs text-yellow-700 flex items-center gap-2">
                                                            <i className="fas fa-info-circle" />
                                                            {t(
                                                                'distributorMaterialRequestDetail.requestClosedNote'
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-file-contract text-gray-400 text-3xl mb-2" />
                                            <p className="text-sm text-gray-600">
                                                {t('distributorMaterialRequestDetail.notAppliedYet')}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
            <MaterialRequestModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onSelect={handleSelectMaterial}
            />
        </div >
    );
}
