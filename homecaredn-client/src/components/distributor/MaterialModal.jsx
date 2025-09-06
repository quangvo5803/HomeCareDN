import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useBrand } from "../../hook/useBrand";
import { useCategory } from "../../hook/useCategory";
import Swal from "sweetalert2";
import { handleApiError } from "../../utils/handleApiError";
import { useMaterial } from "../../hook/useMaterial";
import { useAuth } from "../../hook/useAuth";

export default function MaterialModal({ isOpen, onClose, onSave, material }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { deleteMaterialImage } = useMaterial();
  // lấy danh sách brand & category từ context
  const { brands } = useBrand();
  const { categories } = useCategory();

  const [name, setName] = useState("");
  const [brandID, setBrandID] = useState("");
  const [categoryID, setCategoryID] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [dbImagesCount, setDbImagesCount] = useState(
    material?.images?.length || 0
  );
  const [existingImages, setExistingImages] = useState([]);

  // Delete Material image
  const handleDeleteImage = async (materialID, imageID, onSuccess) => {
    Swal.fire({
      title: t("ModalPopup.DeleteMaterialImageModal.title"),
      text: t("ModalPopup.DeleteMaterialImageModal.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("BUTTON.Delete"),
      cancelButtonText: t("BUTTON.Cancel"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: t("ModalPopup.DeletingLoadingModal.title"),
            text: t("ModalPopup.DeletingLoadingModal.text"),
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await deleteMaterialImage(materialID, imageID);

          Swal.close();
          toast.success(t("SUCCESS.DELETE"));

          // Gọi callback sau khi xóa
          if (onSuccess) onSuccess();
          setDbImagesCount((prev) => prev - 1);
        } catch (err) {
          Swal.close();
          if (err.handled) return;
          toast.error(handleApiError(err));
        }
      }
    });
  };

  // fill data khi edit
  useEffect(() => {
    if (isOpen) {
      if (material) {
        //map brandId
        const foundBrand = brands.find(
          (b) => b.brandName === material.brandName
        );
        //map CateId
        const foundCategory = categories.find(
          (c) => c.categoryName === material.categoryName
        );
        setName(material.name || "");
        setBrandID(material.brandID || foundBrand?.brandID || "");
        setCategoryID(material.categoryID || foundCategory?.categoryID || "");
        setUnit(material.unit || "");
        setDescription(material.description || "");
        setUnitPrice(material.unitPrice || "");
        setImagePreviews(material.images.map((img) => img.imageUrls) || []);
        setImageFiles([]);
        setDbImagesCount(material.images.length);
        setExistingImages(material.images || []);
      } else {
        setName("");
        setBrandID("");
        setCategoryID("");
        setUnit("");
        setDescription("");
        setUnitPrice("");
        setImagePreviews([]);
        setImageFiles([]);
      }
    }
  }, [isOpen, material, brands, categories]);

  //chọn và hiển thị ảnh
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = [...existingImages, ...imageFiles, ...files];

    if (totalFiles.length > 5) {
      toast.error(t("ERROR.REQUIRED_MATERIAL_IMAGE"));
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const previews = [
      ...imagePreviews,
      ...files.map((f) => URL.createObjectURL(f)),
    ];
    setImagePreviews(previews);
  };

  //Summit update/add
  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error(t("ERROR.REQUIRED_MATERIAL_NAME"));
      return;
    }
    if (!unit.trim()) {
      toast.error(t("ERROR.REQUIRED_MATERIAL_UNIT"));
      return;
    }
    if (!brandID.trim()) {
      toast.error(t("ERROR.REQUIRED_MATERIAL_BRAND"));
      return;
    }
    if (!categoryID.trim()) {
      toast.error(t("ERROR.REQUIRED_MATERIAL_CATEGORY"));
      return;
    }
    if (!material && imageFiles.length === 0) {
      toast.error(t("ERROR.REQUIRED_MATERIAL_IMAGES"));
      return;
    }

    const data = {
      MaterialID: material?.materialID,
      UserID: user?.id || null,
      Name: name || null,
      Unit: unit || null,
      BrandID: brandID || null,
      CategoryID: categoryID || null,
      Description: description || null,
      UnitPrice:
        unitPrice !== undefined && unitPrice !== "" ? Number(unitPrice) : null,
      Images: imageFiles.length > 0 ? imageFiles : null,
      // Giữ ảnh cũ nếu không có ảnh mới
    };

    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-900">
            {material ? t("BUTTON.UpdateMaterial") : t("BUTTON.AddNewMaterial")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {/* Material Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("distributorMaterialManager.materialModal.materialName")}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("distributorMaterialManager.materialModal.unit")}
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>

          {/* Brand Select */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("distributorMaterialManager.materialModal.brand")}{" "}
            </label>
            <select
              value={brandID || ""}
              onChange={(e) => setBrandID(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {!material && <option value="">{t("Chọn brand")}</option>}
              {brands.map((b) => (
                <option key={b.brandID} value={b.brandID}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("distributorMaterialManager.materialModal.category")}{" "}
            </label>
            <select
              value={categoryID || ""}
              onChange={(e) => setCategoryID(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {!material && <option value="">{t("Chọn category")}</option>}
              {categories.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("distributorMaterialManager.materialModal.unit_Price")}
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg"
              value={unitPrice}
              onChange={(e) => {
                const value = e.target.value;
                setUnitPrice(value === "" ? 0 : Number(value));
              }}
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              {t("distributorMaterialManager.materialModal.description")}
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Images */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              {t("distributorMaterialManager.materialModal.images")}
            </label>

            {imagePreviews.length < 5 && (
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-600
              hover:file:bg-blue-100
              file:cursor-pointer
              file:content['']"
              />
            )}

            <div className="grid grid-cols-5 gap-3 mt-3">
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                >
                  <img
                    src={src}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition">
                    {!(dbImagesCount === 1 && material?.images[i]) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            material &&
                            material.images &&
                            material.images[i]
                          ) {
                            handleDeleteImage(
                              material.materialID,
                              material.images[i].imageID,
                              () => {
                                setImageFiles((prev) =>
                                  prev.filter((_, index) => index !== i)
                                );
                                setImagePreviews((prev) =>
                                  prev.filter((_, index) => index !== i)
                                );
                              }
                            );
                          } else {
                            // Nếu là ảnh local thì xoá ngay
                            setImageFiles((prev) =>
                              prev.filter((_, index) => index !== i)
                            );
                            setImagePreviews((prev) =>
                              prev.filter((_, index) => index !== i)
                            );
                          }
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow hover:bg-red-700"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {t("BUTTON.Cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            {material ? t("BUTTON.Update") : t("BUTTON.Add")}
          </button>
        </div>
      </div>
    </div>
  );
}

MaterialModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  material: PropTypes.object,
};

MaterialModal.defaultProps = {
  material: null,
};
