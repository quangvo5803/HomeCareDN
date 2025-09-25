import { useMaterial } from '../hook/useMaterial';
import { useCategory } from '../hook/useCategory';
import { useBrand } from '../hook/useBrand';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Pagination } from 'antd';
import CardItem from '../components/CardItem';
import Loading from '../components/Loading';
import { handleApiError } from '../utils/handleApiError';
import { toast } from 'react-toastify';
import FilterItem from '../components/FilterItem';

export default function MaterialViewAll() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('random');
  const { materials, totalMaterials, fetchMaterials, loading } = useMaterial();
  const pageSize = 9;
  const { fetchAllCategories } = useCategory();
  const { fetchAllBrands } = useBrand();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, sortOption, fetchMaterials, selectedCategoryId, selectedBrandId]);

  const start = totalMaterials > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalMaterials);
  if (loading) return <Loading />;

  return (
    <body className="font-sans text-black bg-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-col mb-6 md:flex-row md:justify-between md:items-center">
          <h1 className="text-lg font-bold text-orange-400 md:text-xl">
            {t('materialViewAll.listMaterial')}
          </h1>
          {/* Sort */}
          <div className="flex items-center mt-4 space-x-4 md:mt-0">
            <p className="text-sm md:text-base">
              {t('materialViewAll.pagination', { start, end, totalMaterials })}
            </p>
            <select
              aria-label="Sort options"
              className="px-3 py-1 text-sm border border-gray-300 rounded md:text-base"
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="random">{t('home.default')}</option>
              <option
                value={
                  i18n.language === 'vi' ? 'materialname' : 'materialnameen'
                }
              >
                A-Z
              </option>
              <option
                value={
                  i18n.language === 'vi' ? 'materialname_desc' : 'materialnameen_desc'
                }
              >
                Z-A
              </option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Filter */}
          <aside className="md:w-1/5 -ml-10 mr-16">
            <div className="w-20 mb-4 border-b border-gray-400"></div>
            {/* Category */}
            <FilterItem
              itemType={{ type: 'material' }}
              label={t("materialViewAll.filterCategory")}
              options={categories}
              selectedValue={selectedCategoryId}
              onChange={setSelectedCategoryId}
              name="categoryName"
              nameEN="categoryNameEN"
              valueID="categoryID"
              countValue="materialCount"
            />

            {/* Brand */}
            <FilterItem
              itemType={{ type: 'material' }}
              label={t("materialViewAll.filterBrand")}
              options={brands}
              selectedValue={selectedBrandId}
              onChange={setSelectedBrandId}
              name="brandName"
              nameEN="brandNameEN"
              valueID="brandID"
              countValue="materialCount"
            />
          </aside>

          {/* Products grid */}
          <section className="grid grid-cols-1 gap-6 md:w-4/5 sm:grid-cols-2 lg:grid-cols-3 min-h-[500px]">
            {materials && materials.length > 0 ? (
              <>
                {materials.map((item) => (
                  <CardItem key={item.MaterialID} item={item} />
                ))}

                <div className="flex justify-center py-4 col-span-full">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalMaterials}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    size="small"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center col-span-full py-10 text-gray-500">
                <i className="fas fa-box-open text-4xl mb-3 text-gray-400"></i>
                <p className="text-lg font-medium">{t('materialViewAll.noMaterial')}</p>
              </div>
            )}
          </section>
        </div>
      </div >
    </body >
  );
}
