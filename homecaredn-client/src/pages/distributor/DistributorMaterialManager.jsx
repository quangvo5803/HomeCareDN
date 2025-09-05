import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { handleApiError } from "../../utils/handleApiError";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";
import { useMaterial } from "../../hook/useMaterial";
import { Pagination } from "antd";

export default function MaterialTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { t } = useTranslation();

  const {
    materials,
    loading,
    fetchMaterials,
    //createMaterial,
    //updateMateria,
    deleteMaterial,
  } = useMaterial();

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);
  // Pagination logic
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentMaterials = materials.slice(indexOfFirstItem, indexOfLastItem);

  if (currentPage > 1 && currentMaterials.legth === 0) {
    setCurrentPage(currentPage - 1);
  }

  const handleView = (material) => {
    alert(`Xem thông tin material: ${material.name}`);
  };

  // Delete Brand
  const handleDelete = async (materialID) => {
    Swal.fire({
      title: t("ModalPopup.DeleteBrandModal.title"),
      text: t("ModalPopup.DeleteBrandModal.text"),
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
          await deleteMaterial(materialID);
          Swal.close();
          toast.success(t("SUCCESS.DELETE"));
        } catch (err) {
          Swal.close();
          if (err.handled) return;
          toast.error(handleApiError(err));
        }
      }
    });
  };

  if (loading) return <Loading />;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-lg text-gray-800">
          📦 {t("distributorMaterialManager.title")}
        </h3>
        <button className="text-sm px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition">
          + {t("distributorMaterialManager.create_Material")}
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t("distributorMaterialManager.no")}
              </th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide text-xs">
                {t("distributorMaterialManager.materialName")}
              </th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t("distributorMaterialManager.brand")}
              </th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t("distributorMaterialManager.category")}
              </th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t("distributorMaterialManager.unit_Price")}
              </th>
              <th className="px-4 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t("distributorMaterialManager.action")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials && materials.legth > 0 ? (
              currentMaterials.map((material, index) => (
                <tr
                  key={material.materialID}
                  className={`hover:bg-sky-50 transition-colors duration-150 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  {/* STT */}
                  <td className="px-4 py-4 text-center align-middle">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {indexOfFirstItem + index + 1}
                    </span>
                  </td>

                  {/* Material Name + Avatar */}
                  <td className="px-6 py-4 text-left flex items-center gap-3">
                    {material.imageUrls ? (
                      <img
                        src={material.imageUrls[0]}
                        alt={material.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {material.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <span className="font-medium text-gray-900">
                      {material.name}
                    </span>
                  </td>

                  {/* Brand */}
                  <td className="px-6 py-4 text-center">
                    {material.brandName}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-center">
                    {material.categoryName}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-center font-semibold text-emerald-600">
                    {material.unitPrice.toLocaleString()} ₫
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => handleView(material)}
                      >
                        <i className="fa-solid fa-eye"></i> Xem
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition">
                        <i className="fa-solid fa-pen"></i> Sửa
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition"
                        onClick={() => handleDelete(material.materialID)}
                      >
                        <i className="fa-solid fa-trash"></i> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <div>chưa có material</div>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
