import { useMaterial } from '../hook/useMaterial';
import { useCategory } from '../hook/useCategory';
import { useBrand } from '../hook/useBrand';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Pagination } from 'antd';
import { useSearchParams } from 'react-router-dom';
import CardItem from '../components/CardItem';
import { handleApiError } from '../utils/handleApiError';
import { toast } from 'react-toastify';
import LoadingComponent from '../components/LoadingComponent';
import FilterItem from '../components/FilterItem';
import { useService } from '../hook/useService';

export default function ItemViewAll() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('random');
  const { materials, totalMaterials, fetchMaterials, loading: loadingMaterials } = useMaterial();
  const { services, fetchServices, totalServices, loading: loadingServices } = useService();

  const loading = loadingMaterials || loadingServices;
  const pageSize = 12;
  const { fetchAllCategories } = useCategory();
  const { fetchAllBrands } = useBrand();
  const [selectedType, setSelectedType] = useState("Material");
  const [_, setSelectedServiceType] = useState("Repair");
  const urlType = searchParams.get("type");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    searchParams.get('categoryId') || ''
  );
  const [selectedBrandId, setSelectedBrandId] = useState(
    searchParams.get('brandId') || ''
  );

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Dropdown states
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);

  //filter enum
  const [packageOption, setPackageOption] = useState(null);
  const [buildingType, setBuildingType] = useState(null);
  const [mainStructureType, setMainStructureType] = useState(null);
  const [designStyle, setDesignStyle] = useState(null);

  const [isDropdown, setIsDropdown] = useState(false);
  const searchValue = searchParams.get("search") || "";

  useEffect(() => {
    const catId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    if (catId !== null) setSelectedCategoryId(catId);
    if (brandId !== null) setSelectedBrandId(brandId);
  }, [searchParams]);

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
    if (selectedType === "Material") {
      fetchMaterials({
        PageNumber: currentPage,
        PageSize: pageSize,
        SortBy: sortOption,
        FilterCategoryID: selectedCategoryId || null,
        FilterBrandID: selectedBrandId || null,
        Search: searchValue || null,
      });
    } else {
      fetchServices({
        PageNumber: currentPage,
        PageSize: pageSize,
        SortBy: sortOption,
        FilterServiceType: selectedType,
        FilterPackageOption: packageOption || undefined,
        FilterBuildingType: buildingType || undefined,
        FilterMainStructureType: mainStructureType || undefined,
        FilterDesignStyle: designStyle || undefined,
        Search: searchValue || null,
      });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [
    selectedType,
    currentPage,
    sortOption,
    selectedCategoryId,
    selectedBrandId,
    packageOption,
    buildingType,
    mainStructureType,
    designStyle,
    fetchMaterials,
    fetchServices,
    searchValue,
  ]);
  useEffect(() => {
    if (urlType) {
      setSelectedType(urlType);

      if (urlType !== "Material") {
        setSelectedServiceType(urlType);
      }
    }
  }, [urlType]);
  const handleSelectType = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
    resetAllFiltersService();
    if (type !== "Material") {
      setSelectedServiceType(type);
      resetAllFiltersMaterial();
    }
  };

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

  const resetAllFiltersMaterial = () => {
    setSelectedCategoryId('');
    setSelectedBrandId('');
    setSortOption('random');
    setCurrentPage(1);
  };

  const resetAllFiltersService = () => {
    setPackageOption('');
    setBuildingType('');
    setMainStructureType('');
    setDesignStyle('');
    setSortOption('random');
    setCurrentPage(1);
  };

  const hasActiveFiltersMaterial =
    selectedCategoryId || selectedBrandId || sortOption !== 'random';

  const hasActiveFiltersService =
    packageOption || buildingType || designStyle || mainStructureType || sortOption !== 'random';

  const renderList = (list, total) => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-96">
          <LoadingComponent />
        </div>
      );
    }

    if (!list || list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {t("itemViewAll.noItem")}
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {list.map((item) => (
            <CardItem
              key={item.materialID || item.serviceID}
              item={item}
            />
          ))}
        </div>

        <div className="flex justify-center py-6 border-t border-gray-200">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </>
    );
  };
  const totalCount =
    selectedType === "Material"
      ? `${loading ? 0 : totalMaterials} ${t("itemViewAll.materials")}`
      : `${loading ? 0 : totalServices} ${t("itemViewAll.services")}`;

  return (
    <div className="min-h-screen font-sans bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with item count */}
        <div className="flex items-center gap-3 mb-1">
          {/* Title */}
          <h1 className="text-xl font-semibold text-gray-800">
            {t("itemViewAll.list")}
          </h1>

          {/* Wrapper select + icon */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => handleSelectType(e.target.value)}
              onClick={() => setIsDropdown(!isDropdown)}
              onBlur={() => setIsDropdown(false)}
              className="border px-3 py-2 pr-10 rounded-lg shadow-sm text-gray-800 cursor-pointer hover:border-blue-400 focus:border-blue-500 transition duration-200 appearance-none"
            >
              <option value="Material">{t("itemViewAll.dropMaterial")}</option>
              <option value="Repair">{t("itemViewAll.dropRepair")}</option>
              <option value="Construction">{t("itemViewAll.dropConstruction")}</option>
            </select>
            {/* Icon */}
            <i
              className={`
                absolute right-3 top-1/2 -translate-y-1/2 
                text-gray-600 pointer-events-none transition duration-200
                ${isDropdown ? "fa fa-chevron-up" : "fa fa-chevron-down"}
              `}
            ></i>
          </div>
        </div>

        {/* Counter phía dưới */}
        <div className="text-gray-600 text-sm mb-10">
          {totalCount}
        </div>


        {/* Filter Bar - IKEA Style */}
        {selectedType === "Material" && (
          <FilterItem
            itemType={{ type: "material" }}
            showSortDropdown={showSortDropdown}
            setShowSortDropdown={setShowSortDropdown}
            showCategoryDropdown={showCategoryDropdown}
            setShowCategoryDropdown={setShowCategoryDropdown}
            showBrandDropdown={showBrandDropdown}
            setShowBrandDropdown={setShowBrandDropdown}
            sortOption={sortOption}
            setSortOption={setSortOption}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            brands={brands}
            selectedBrandId={selectedBrandId}
            setSelectedBrandId={setSelectedBrandId}
            getSortLabel={getSortLabel}
            getCategoryLabel={getCategoryLabel}
            getBrandLabel={getBrandLabel}
            hasActiveFilters={hasActiveFiltersMaterial}
            resetAllFilters={resetAllFiltersMaterial}
            setCurrentPage={setCurrentPage}
          />
        )}

        {selectedType !== "Material" && (
          <FilterItem
            itemType={{ type: "service" }}
            packageOption={packageOption}
            buildingType={buildingType}
            mainStructure={mainStructureType}
            designStyle={designStyle}
            onPackageOptionChange={setPackageOption}
            onBuildingTypeChange={setBuildingType}
            onMainStructureTypeChange={setMainStructureType}
            onDesignStyleChange={setDesignStyle}
            sortOption={sortOption}
            setSortOption={setSortOption}
            setCurrentPage={setCurrentPage}
            hasActiveFilters={hasActiveFiltersService}
            resetAllFilters={resetAllFiltersService}
          />
        )}

        {/* Products Grid */}
        {selectedType === "Material"
          ? renderList(materials, totalMaterials)
          : renderList(services, totalServices)
        }
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
