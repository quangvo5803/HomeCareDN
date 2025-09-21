import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { useMaterial } from '../../hook/useMaterial';
import { Pagination } from 'antd';
import MaterialModal from '../../components/modal/MaterialModal';
import { useAuth } from '../../hook/useAuth';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { useBrand } from '../../hook/useBrand';
import { useCategory } from '../../hook/useCategory';
import { handleApiError } from '../../utils/handleApiError';

export default function DistributorMaterialManager() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { fetchAllBrands } = useBrand();
  const { fetchAllCategories } = useCategory();
  const [uploadProgress, setUploadProgress] = useState(0);
  const {
    materials,
    totalMaterials,
    loading,
    fetchMaterialsByUserId,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  } = useMaterial();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const [brandList, categoryList] = await Promise.all([
          fetchAllBrands(),
          fetchAllCategories({ FilterBool: true }),
        ]);
        setBrands(brandList);
        setCategories(categoryList);
      } catch (err) {
        toast.error(handleApiError(err));
      }
    })();
  }, [fetchAllBrands, fetchAllCategories]);

  useEffect(() => {
    fetchMaterialsByUserId({
      PageNumber: currentPage,
      PageSize: pageSize,
      FilterID: user.id,
    });
  }, [fetchMaterialsByUserId, currentPage, pageSize, user.id]);

  // Delete Material
  const handleDelete = async (materialID) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteMaterialModal.title',
      textKey: 'ModalPopup.DeleteMaterialModal.text',
      onConfirm: async () => {
        await deleteMaterial(materialID);

        const lastPage = Math.ceil((totalMaterials - 1) / pageSize);
        if (currentPage > lastPage) {
          setCurrentPage(lastPage || 1);
        } else {
          await fetchMaterialsByUserId({
            PageNumber: currentPage,
            PageSize: pageSize,
            FilterID: user.id,
          });
        }

        toast.success(t('SUCCESS.DELETE'));
      },
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
  if (uploadProgress) return <Loading progress={uploadProgress} />;
  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex flex-col space-y-1">
          <h3 className="flex items-center text-lg font-semibold text-gray-800">
            <i className="mr-2 fa-solid fa-box"></i>
            {t('distributorMaterialManager.title')}
          </h3>

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {totalMaterials || 0} {t('distributorMaterialManager.material')}
            </span>
          </div>
        </div>

        <button
          className="px-4 py-2 text-sm text-white transition rounded-lg bg-emerald-500 hover:bg-emerald-600"
          onClick={() => {
            setEditingMaterial(null);
            setIsModalOpen(true);
          }}
        >
          <i className="mr-2 fa-solid fa-plus"></i>
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
        brands={brands}
        categories={categories}
        setUploadProgress={setUploadProgress}
      />

      {/* Table */}
      <div className="w-full overflow-x-auto">
        {/* NOSONAR */}
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                {t('distributorMaterialManager.no')}
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase">
                {t('distributorMaterialManager.materialName')}
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                {t('distributorMaterialManager.brand')}
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                {t('distributorMaterialManager.category')}
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                {t('distributorMaterialManager.unit')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-center uppercase">
                {t('distributorMaterialManager.action')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials && materials.length > 0 ? (
              materials.map((material, index) => (
                <tr
                  key={material.materialID}
                  className={`hover:bg-sky-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                >
                  {/* STT */}
                  <td className="px-4 py-4 text-center align-middle">
                    <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                      {(currentPage - 1) * pageSize + index + 1}
                    </span>
                  </td>

                  {/* Material Name + Avatar */}
                  <td className="flex items-center gap-3 px-6 py-4 text-left">
                    {material.imageUrls?.length > 0 && material.imageUrls[0] ? (
                      <img
                        src={material.imageUrls[0]}
                        alt={material.name}
                        className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600">
                        <span className="text-sm font-bold text-white">
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
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 mb-4 text-gray-400"
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
                    <h3 className="mb-1 text-lg font-medium text-gray-900">
                      {t('distributorMaterialManager.noMaterial')}
                    </h3>
                    <p className="mb-4 text-gray-500">
                      {t('distributorMaterialManager.letStart')}
                    </p>
                    <button
                      className="px-4 py-2 text-white rounded-lg bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <i className="mr-3 fa-solid fa-plus"></i>
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
