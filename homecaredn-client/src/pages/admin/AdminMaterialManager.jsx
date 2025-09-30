import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { useMaterial } from '../../hook/useMaterial';
import { Pagination } from 'antd';
import MaterialModal from '../../components/modal/MaterialModal';
import { showDeleteModal } from '../../components/modal/DeleteModal';
import { useBrand } from '../../hook/useBrand';
import { useCategory } from '../../hook/useCategory';
import { handleApiError } from '../../utils/handleApiError';

export default function AdminMaterialManager() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const { fetchAllBrands } = useBrand();
  const { fetchAllCategories } = useCategory();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const {
    materials,
    totalMaterials,
    loading,
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  } = useMaterial();
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
  // Fetch materials khi vào trang
  useEffect(() => {
    fetchMaterials({ PageNumber: currentPage, PageSize: pageSize });
  }, [currentPage, fetchMaterials]);

  // Delete Material
  const handleDelete = async (materialId) => {
    showDeleteModal({
      t,
      titleKey: 'ModalPopup.DeleteMaterialModal.title',
      textKey: 'ModalPopup.DeleteMaterialModal.text',
      onConfirm: async () => {
        await deleteMaterial(materialId);

        const lastPage = Math.ceil((totalMaterials - 1) / pageSize);
        if (currentPage > lastPage) {
          setCurrentPage(lastPage || 1);
        } else {
          fetchMaterials({ PageNumber: currentPage, PageSize: pageSize });
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
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl">
            <i className="mr-3 fa-solid fa-tags"></i>
            {t('adminMaterialManager.title')}
          </h2>
          <p className="text-gray-600">{t('adminMaterialManager.subtitle')}</p>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
          {/* Table Header Actions */}
          <div className="flex flex-col items-start justify-between gap-3 px-4 py-4 border-b border-gray-200 lg:px-6 bg-gray-50 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {totalMaterials || 0} {t('adminMaterialManager.material')}
              </span>
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

          {/* Add/Edit Material Modal */}
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
          <div className="w-full">
            {/* NOSONAR */}
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminMaterialManager.no')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminMaterialManager.materialName')}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase ">
                      {t('adminMaterialManager.numberOfMaterials')}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                      {t('adminMaterialManager.status')}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase ">
                      {t('adminMaterialManager.createdBy')}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase ">
                      {t('adminMaterialManager.action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {materials && materials.length > 0 ? (
                    materials.map((mat, index) => (
                      <tr
                        key={mat.materialID}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        <td className="px-4 py-4 text-center align-middle">
                          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                            {(currentPage - 1) * pageSize + index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center justify-center w-10 h-10 mr-3 overflow-hidden rounded-lg">
                              {mat.materialLogo ? (
                                <img
                                  src={mat.materialLogo}
                                  alt={mat.materialName}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <img
                                  src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg"
                                  alt="No image"
                                  className="object-cover w-13 h-13"
                                />
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {i18n.language === 'vi'
                                ? mat.materialName
                                : mat.materialNameEN || mat.materialName}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center align-middle">
                          <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                            {mat.materials?.length || 0}{' '}
                            {t('adminMaterialManager.materials')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center align-middle"></td>
                        <td className="px-4 py-4 text-center align-middle">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                              onClick={() => {
                                setEditingMaterial(mat);
                                setIsModalOpen(true);
                              }}
                            >
                              {t('BUTTON.Edit')}
                            </button>

                            <button
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-md bg-red-50 hover:bg-red-100"
                              onClick={() => handleDelete(mat.materialID)}
                            >
                              {t('BUTTON.Delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
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
                            {t('adminMaterialManager.noMaterial')}
                          </h3>
                          <p className="mb-4 text-gray-500">
                            {t('adminMaterialManager.letStart')}
                          </p>
                          <button
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="lg:hidden">
              <div className="p-4 space-y-4">
                {materials && materials.length > 0 ? (
                  materials.map((mat, index) => (
                    <div
                      key={mat.materialID}
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                            {(currentPage - 1) * pageSize + index + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {mat.materialName}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex space-x-4">
                          <div className="text-center">
                            <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                              {mat.subMaterials?.length || 0}
                            </span>
                            <p className="mt-1 text-xs text-gray-500">
                              Sub Materials
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full"></span>
                            <p className="mt-1 text-xs text-gray-500">
                              Materials
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="mt-1 text-xs text-gray-500">
                          {t('adminMaterialManager.status')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 px-3 py-2 text-xs font-medium border rounded-md border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          onClick={() => {
                            setEditingMaterial(mat);
                            setIsModalOpen(true);
                          }}
                        >
                          {t('BUTTON.Edit')}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-gray-400"
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
                      {t('adminMaterialManager.noMaterial')}
                    </h3>
                    <p className="mb-4 text-gray-500">
                      {t('adminMaterialManager.letStart')}
                    </p>
                    <button
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <i className="mr-3 fa-solid fa-plus"></i>
                      {t('BUTTON.AddNewMaterial')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalMaterials > 0 && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
