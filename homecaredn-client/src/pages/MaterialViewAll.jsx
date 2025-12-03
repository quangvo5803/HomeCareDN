import { useMaterial } from '../hook/useMaterial';
import { useCategory } from '../hook/useCategory';
import { useBrand } from '../hook/useBrand';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Pagination } from 'antd';
import CardItem from '../components/CardItem';
import { handleApiError } from '../utils/handleApiError';
import { toast } from 'react-toastify';
import LoadingComponent from '../components/LoadingComponent';

export default function MaterialViewAll() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('random');
  const { materials, totalMaterials, fetchMaterials, loading } = useMaterial();
  const pageSize = 12;
  const { fetchAllCategories } = useCategory();
  const { fetchAllBrands } = useBrand();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Dropdown states
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);

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
    fetchMaterials({
      PageNumber: currentPage,
      PageSize: pageSize,
      SortBy: sortOption,
      FilterCategoryID: selectedCategoryId || null,
      FilterBrandID: selectedBrandId || null,
    });
  }, [
    currentPage,
    sortOption,
    fetchMaterials,
    selectedCategoryId,
    selectedBrandId,
  ]);

  const getSortLabel = () => {
    if (sortOption === 'random') return t('home.default');
    if (sortOption === 'materialname' || sortOption === 'materialnameen')
      return 'A-Z';
    if (
      sortOption === 'materialname_desc' ||
      sortOption === 'materialnameen_desc'
    )
      return 'Z-A';
    return t('home.default');
  };

  const getCategoryLabel = () => {
    if (!selectedCategoryId) return null;
    const category = categories.find(
      (c) => c.categoryID === selectedCategoryId
    );
    return category
      ? i18n.language === 'vi'
        ? category.categoryName
        : category.categoryNameEN || category.categoryName
      : null;
  };

  const getBrandLabel = () => {
    if (!selectedBrandId) return null;
    const brand = brands.find((b) => b.brandID === selectedBrandId);
    return brand
      ? i18n.language === 'vi'
        ? brand.brandName
        : brand.brandNameEN || brand.brandName
      : null;
  };

  const resetAllFilters = () => {
    setSelectedCategoryId('');
    setSelectedBrandId('');
    setSortOption('random');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategoryId || selectedBrandId || sortOption !== 'random';

  return (
    <div className="min-h-screen font-sans bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with item count */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('materialViewAll.listMaterial')}
          </h1>
          <p className="text-sm text-gray-600">{totalMaterials} sản phẩm</p>
        </div>

        {/* Filter Bar - IKEA Style */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-3 mb-3">
            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowCategoryDropdown(false);
                  setShowBrandDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-full"
              >
                <span>
                  {t('common.sort')} {getSortLabel()}
                </span>
                <i
                  className={`fas fa-chevron-down text-xs text-gray-600 transition-transform ${
                    showSortDropdown ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>

              {showSortDropdown && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSortOption('random');
                        setCurrentPage(1);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        sortOption === 'random' ? 'font-semibold' : ''
                      }`}
                    >
                      {t('home.default')}
                    </button>
                    <button
                      onClick={() => {
                        setSortOption(
                          i18n.language === 'vi'
                            ? 'materialname'
                            : 'materialnameen'
                        );
                        setCurrentPage(1);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        sortOption === 'materialname' ||
                        sortOption === 'materialnameen'
                          ? 'font-semibold'
                          : ''
                      }`}
                    >
                      A-Z
                    </button>
                    <button
                      onClick={() => {
                        setSortOption(
                          i18n.language === 'vi'
                            ? 'materialname_desc'
                            : 'materialnameen_desc'
                        );
                        setCurrentPage(1);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        sortOption === 'materialname_desc' ||
                        sortOption === 'materialnameen_desc'
                          ? 'font-semibold'
                          : ''
                      }`}
                    >
                      Z-A
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowSortDropdown(false);
                  setShowBrandDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-full"
              >
                <span>{t('common.category')}</span>
                <i
                  className={`fas fa-chevron-down text-xs text-gray-600 transition-transform ${
                    showCategoryDropdown ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSelectedCategoryId('');
                        setCurrentPage(1);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedCategoryId ? '' : 'font-semibold'
                      }`}
                    >
                      {t('common.All')}
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.categoryID}
                        onClick={() => {
                          setSelectedCategoryId(category.categoryID);
                          setCurrentPage(1);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          selectedCategoryId === category.categoryID
                            ? 'font-semibold'
                            : ''
                        }`}
                      >
                        {i18n.language === 'vi'
                          ? category.categoryName
                          : category.categoryNameEN || category.categoryName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Brand Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowBrandDropdown(!showBrandDropdown);
                  setShowSortDropdown(false);
                  setShowCategoryDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-full"
              >
                <span>{t('common.brand')}</span>
                <i
                  className={`fas fa-chevron-down text-xs text-gray-600 transition-transform ${
                    showBrandDropdown ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>

              {showBrandDropdown && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSelectedBrandId('');
                        setCurrentPage(1);
                        setShowBrandDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedBrandId ? '' : 'font-semibold'
                      }`}
                    >
                      {t('common.All')}
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand.brandID}
                        onClick={() => {
                          setSelectedBrandId(brand.brandID);
                          setCurrentPage(1);
                          setShowBrandDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          selectedBrandId === brand.brandID
                            ? 'font-semibold'
                            : ''
                        }`}
                      >
                        {i18n.language === 'vi'
                          ? brand.brandName
                          : brand.brandNameEN || brand.brandName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Tag */}
              {selectedCategoryId && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-900 rounded-full text-sm">
                  <span className="font-medium">
                    {t('common.category')}: {getCategoryLabel()}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategoryId('');
                      setCurrentPage(1);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              )}

              {/* Brand Tag */}
              {selectedBrandId && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-900 rounded-full text-sm">
                  <span className="font-medium">
                    {t('common.brand')}: {getBrandLabel()}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBrandId('');
                      setCurrentPage(1);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              )}

              {/* Reset All Button */}
              <button
                onClick={resetAllFilters}
                className="text-sm text-gray-900 hover:text-gray-600 underline font-medium"
              >
                {t('common.resetFilter')}
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-96">
            <LoadingComponent />
          </div>
        ) : materials && materials.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {materials.map((item) => (
                <CardItem key={item.materialID} item={item} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center py-6 border-t border-gray-200">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalMaterials}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {t('materialViewAll.noMaterial')}
            </p>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showSortDropdown || showCategoryDropdown || showBrandDropdown) && (
        <button
          type="button"
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowSortDropdown(false);
            setShowCategoryDropdown(false);
            setShowBrandDropdown(false);
          }}
          aria-label="Close dropdowns"
        ></button>
      )}
    </div>
  );
}
