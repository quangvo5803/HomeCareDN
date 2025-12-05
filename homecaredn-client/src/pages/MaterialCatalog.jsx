// src/pages/MaterialCatalog.jsx
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCategory } from '../hook/useCategory';
import { useBrand } from '../hook/useBrand';
import Loading from '../components/Loading';
import Reveal from '../components/Reveal';

export default function MaterialCatalog() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('all');
  const [sort, setSort] = useState('relevant');
  const [categories, setCategories] = useState(null);
  const [brands, setBrands] = useState(null);
  const { loading: loadingCategories, fetchAllCategories } = useCategory();
  const { loading: loadingBrands, fetchAllBrands } = useBrand();

  const TAGS = [
    { id: 'all', i18n: 'materialsCatalog.tag_all', icon: 'fa-th-large' },
    { id: 'category', i18n: 'materialsCatalog.tag_category', icon: 'fa-tags' },
    { id: 'brand', i18n: 'materialsCatalog.tag_brand', icon: 'fa-star' },
  ];

  useEffect(() => {
    const loadData = async () => {
      const cats = await fetchAllCategories({
        FilterBool: true,
      });
      const brs = await fetchAllBrands();
      setCategories(cats);
      setBrands(brs);
    };
    loadData();
  }, [fetchAllCategories, fetchAllBrands]);

  // Hàm xáo trộn ngẫu nhiên (Fisher–Yates shuffle)
  const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // Sử dụng useMemo để chỉ tính toán khi categories hoặc brands thay đổi
  const allItems = useMemo(() => {
    const categoryItems = (categories || []).map((c) => ({
      id: c.categoryID,
      title: c.categoryName,
      titleEN: c.categoryNameEN,
      desc: c.categoryNameEN,
      img: c.categoryLogo,
      type: 'category',
    }));

    const brandItems = (brands || []).map((b) => ({
      id: b.brandID,
      title: b.brandName,
      titleEN: b.brandNameEN,
      desc: b.brandNameEN,
      img: b.brandLogo,
      type: 'brand',
    }));

    // Xáo trộn riêng từng nhóm trước khi gộp
    return [...shuffleArray(categoryItems), ...shuffleArray(brandItems)];
  }, [categories, brands]);

  // Filter
  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      q === '' ||
      item.title.toLowerCase().includes(q.toLowerCase()) ||
      item.desc?.toLowerCase().includes(q.toLowerCase());

    const matchesTag = tag === 'all' || item.type === tag;

    return matchesSearch && matchesTag;
  });

  // Sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sort === 'asc') return a.title.localeCompare(b.title);
    if (sort === 'desc') return b.title.localeCompare(a.title);
    return 0;
  });

  const handleCardClick = (item) => {
    if (item.type === 'category') {
      navigate(`/MaterialViewAll?categoryId=${item.id}`);
    } else if (item.type === 'brand') {
      navigate(`/MaterialViewAll?brandId=${item.id}`);
    }
  };

  if (loadingCategories || loadingBrands) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b shadow-lg">
        <div className="px-6 py-12 mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-gradient-to-r from-blue-600 to-orange-600 rounded-2xl">
              <i className="text-xl text-white fas fa-cube"></i>
            </div>
            <h1 className="mb-3 text-5xl font-bold text-gray-800">
              {t('materialsCatalog.title')}
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              {t('materialsCatalog.subtitle')}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center justify-center gap-6 mb-8 md:flex-row">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <i className="text-blue-600 fas fa-search"></i>
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('materialsCatalog.search_placeholder')}
                className="w-full py-3 pl-12 pr-12 transition-all bg-white border-2 border-gray-200 shadow-sm outline-none rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {q && (
                <button
                  className="absolute flex items-center justify-center text-gray-500 transition-all -translate-y-1/2 bg-gray-100 rounded-lg right-3 top-1/2 w-7 h-7 hover:bg-red-100 hover:text-red-600"
                  onClick={() => setQ('')}
                >
                  <i className="text-sm fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-6 py-3 pr-10 font-medium transition-all bg-white border-2 border-gray-200 shadow-sm outline-none appearance-none rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="asc"> A → Z</option>
                <option value="desc"> Z → A</option>
              </select>
              <i className="absolute text-blue-600 -translate-y-1/2 pointer-events-none fas fa-chevron-down right-3 top-1/2"></i>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-3">
            {TAGS.map((tg) => {
              const active = tag === tg.id;
              return (
                <button
                  key={tg.id}
                  onClick={() => setTag(tg.id)}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${active
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-600'
                    }`}
                >
                  <i
                    className={`fas ${tg.icon} mr-2 ${active ? 'text-white' : 'text-blue-600'
                      }`}
                  ></i>
                  {t(tg.i18n)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="px-6 py-10 mx-auto max-w-7xl">
        {sortedItems.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 shadow-lg rounded-2xl">
              <i className="text-3xl text-gray-400 fas fa-search-minus"></i>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-400">
              {t('materialsCatalog.noCategory')}
            </h3>
            <p className="text-gray-500">{t('materialsCatalog.noCategory')}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedItems.map((m, i) => (
              <Reveal
                key={m.id}
                className="h-full"
                // thêm delay cho từng card
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <button
                  onClick={() => handleCardClick(m)}
                  className="h-full overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-lg cursor-pointer group rounded-2xl hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative w-full bg-gray-50 aspect-[4/3]">
                    <img
                      src={
                        m.img ||
                        'https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg'
                      }
                      alt={m.title || 'No image'}
                      className="object-contain w-full h-full p-3 transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg ${m.type === 'category'
                            ? 'bg-blue-600'
                            : 'bg-orange-600'
                          }`}
                      >
                        <i
                          className={`fas ${m.type === 'category' ? 'fa-tags' : 'fa-star'
                            }`}
                        ></i>
                        {m.type === 'category'
                          ? t('materialsCatalog.tag_category')
                          : t('materialsCatalog.tag_brand')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="mb-2 text-lg font-bold text-center text-gray-900 transition-colors group-hover:text-blue-600">
                      {i18n.language === 'vi' ? m.title : m.titleEN || m.title}
                    </h3>

                    <button className="flex items-center justify-center gap-2 mx-auto text-sm font-semibold text-orange-600 transition-all hover:text-orange-700 group-hover:gap-3">
                      {t('BUTTON.ReadMore')}
                      <div className="flex items-center justify-center w-6 h-6 transition-all rounded-lg bg-orange-600/10 group-hover:bg-orange-600">
                        <i className="text-xs transition-colors fas fa-arrow-right group-hover:text-white"></i>
                      </div>
                    </button>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
