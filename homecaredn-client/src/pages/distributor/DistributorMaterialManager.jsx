import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { handleApiError } from '../../utils/handleApiError';
import Loading from '../../components/Loading';
import Swal from 'sweetalert2';
import { useMaterial } from '../../hook/useMaterial';
import { Pagination } from 'antd';
import MaterialModal from '../../components/distributor/MaterialModal';
import { useAuth } from '../../hook/useAuth';

export default function MaterialTable() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    materials,
    totalMaterials,
    loading,
    fetchMaterialsByUserId,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  } = useMaterial();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  useEffect(() => {
    fetchMaterialsByUserId({
      PageNumber: currentPage,
      PageSize: pageSize,
      FilterID: user.id,
    });
  }, [fetchMaterialsByUserId, currentPage, pageSize, user.id]);

  // Delete Material
  const handleDelete = async (materialID) => {
    Swal.fire({
      title: t('ModalPopup.DeleteMaterialModal.title'),
      text: t('ModalPopup.DeleteMaterialModal.text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('BUTTON.Delete'),
      cancelButtonText: t('BUTTON.Cancel'),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: t('ModalPopup.DeletingLoadingModal.title'),
            text: t('ModalPopup.DeletingLoadingModal.text'),
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          await deleteMaterial(materialID);
          const lastPage = Math.ceil((totalMaterials - 1) / pageSize);
          if (currentPage > lastPage) {
            setCurrentPage(lastPage || 1);
          } else {
            fetchMaterialsByUserId({
              PageNumber: currentPage,
              PageSize: pageSize,
              FilterID: user.id,
            });
          }
          Swal.close();
          toast.success(t('SUCCESS.DELETE'));
        } catch (err) {
          Swal.close();
          if (err.handled) return;
          toast.error(handleApiError(err));
        }
      }
    });
  };

  // Save Material (Create / Update)
  const handleSave = async (materialData) => {
    if (materialData.MaterialID) {
      await updateMaterial(materialData);
      toast.success(t('SUCCESS.MATERIAL_UPDATE'));
    } else {
      await createMaterial(materialData);
      toast.success(t('SUCCESS.MATERIAL_ADD'));
      const lastPage = Math.ceil((totalMaterials + 1) / pageSize);
      setCurrentPage(lastPage);
    }

    setIsModalOpen(false);
    setEditingMaterial(null);
  };

  if (loading) return <Loading />;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-lg text-gray-800">
          <i className="fa-solid fa-box mr-2"></i>
          {t('distributorMaterialManager.title')}
        </h3>
        <button
          className="text-sm px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
          onClick={() => {
            setEditingMaterial(null);
            setIsModalOpen(true);
          }}
        >
          <i className="fa-solid fa-plus mr-2"></i>
          {t('BUTTON.AddNewMaterial')}
        </button>
      </div>

      {/*  render modal */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMaterial(null);
        }}
        onSave={handleSave}
        material={editingMaterial}
      />

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t('distributorMaterialManager.no')}
              </th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide text-xs">
                {t('distributorMaterialManager.materialName')}
              </th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t('distributorMaterialManager.brand')}
              </th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t('distributorMaterialManager.category')}
              </th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t('distributorMaterialManager.unit')}
              </th>
              <th className="px-4 py-3 text-center font-semibold uppercase tracking-wide text-xs">
                {t('distributorMaterialManager.action')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials && materials.length > 0 ? (
              materials.map((material, index) => (
                <tr
                  key={material.materialID}
                  className={`hover:bg-sky-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  {/* STT */}
                  <td className="px-4 py-4 text-center align-middle">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {(currentPage - 1) * pageSize + index + 1}
                    </span>
                  </td>

                  {/* Material Name + Avatar */}
                  <td className="px-6 py-4 text-left flex items-center gap-3">
                    {material.imageUrls?.length > 0 && material.imageUrls[0] ? (
                      <img
                        src={material.imageUrls[0]}
                        alt={material.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center rounded-lg">
                        <span className="text-white font-bold text-sm">
                          {material.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-gray-900">
                      {i18n.language === 'vi'
                        ? material.name
                        : material.nameEN || material.name}
                    </span>
                  </td>

                  {/* Brand */}
                  <td className="px-6 py-4 text-center">
                    {i18n.language === 'vi'
                      ? material.brandName
                      : material.brandNameEN || material.brandName}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-center">
                    {i18n.language === 'vi'
                      ? material.categoryName
                      : material.categoryNameEN || material.categoryName}
                  </td>

                  {/* Unit */}
                  <td className="px-6 py-4 text-center">
                    {i18n.language === 'vi'
                      ? material.unit
                      : material.unitEN || material.unit}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                        onClick={() => {
                          setEditingMaterial(material);
                          setIsModalOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-pen"></i> {t('BUTTON.Edit')}
                      </button>

                      <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                        onClick={() => handleDelete(material.materialID)}
                      >
                        <i className="fa-solid fa-trash"></i>{' '}
                        {t('BUTTON.Delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {t('distributorMaterialManager.noMaterial')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t('distributorMaterialManager.letStart')}
                    </p>
                    <button
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <i className="fa-solid fa-plus mr-3"></i>
                      {t('BUTTON.AddNewMaterial')}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex justify-center py-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalMaterials}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            size="small"
          />
        </div>
      </div>
    </div>
  );
}
