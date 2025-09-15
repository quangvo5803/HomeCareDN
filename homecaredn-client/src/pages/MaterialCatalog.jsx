// src/pages/MaterialCatalog.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategory } from '../hook/useCategory';
import { useBrand } from '../hook/useBrand';
import Loading from '../components/Loading';
import Reveal from '../components/Reveal';

export default function MaterialCatalog() {
  const { t, i18n } = useTranslation();
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

  if (loadingCategories || loadingBrands) return <Loading />;

  const allItems = [
    ...(categories || []).map((c) => ({
      id: c.categoryID,
      title: c.categoryName,
      titleEN: c.categoryNameEN,
      desc: c.categoryNameEN,
      img: c.categoryLogo,
      type: 'category',
    })),
    ...(brands || []).map((b) => ({
      id: b.brandID,
      title: b.brandName,
      titleEN: b.brandNameEN,
      desc: b.brandNameEN,
      img: b.brandLogo,
      type: 'brand',
    })),
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-600 rounded-2xl shadow-lg mb-4">
              <i className="fas fa-cube text-white text-xl"></i>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-3">
              {t('materialsCatalog.title')}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('materialsCatalog.subtitle')}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-search text-blue-600"></i>
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('materialsCatalog.search_placeholder')}
                className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none shadow-sm transition-all"
              />
              {q && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-600 transition-all"
                  onClick={() => setQ('')}
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none px-6 py-3 pr-10 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none shadow-sm font-medium transition-all"
              >
                <option value="asc"> A → Z</option>
                <option value="desc"> Z → A</option>
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none"></i>
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
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-600'
                  }`}
                >
                  <i
                    className={`fas ${tg.icon} mr-2 ${
                      active ? 'text-white' : 'text-blue-600'
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
      <div className="max-w-7xl mx-auto px-6 py-10">
        {sortedItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl shadow-lg mb-4">
              <i className="fas fa-search-minus text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Không tìm thấy kết quả
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
                <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                  {/* Image */}
                  <div className="relative h-52 bg-gradient-to-br from-gray-50 to-white">
                    <img
                      src={m.img}
                      alt={m.title}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 p-3"
                      loading="lazy"
                    />
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg ${
                          m.type === 'category'
                            ? 'bg-blue-600'
                            : 'bg-orange-600'
                        }`}
                      >
                        <i
                          className={`fas ${
                            m.type === 'category' ? 'fa-tags' : 'fa-star'
                          }`}
                        ></i>
                        {m.type === 'category' ? 'Danh mục' : 'Thương hiệu'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-center text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {i18n.language === 'vi' ? m.title : m.titleEN || m.title}
                    </h3>

                    <button className="flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-all group-hover:gap-3 mx-auto">
                      {t('materialsCatalog.read_more')}
                      <div className="w-6 h-6 bg-orange-600/10 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-all">
                        <i className="fas fa-arrow-right text-xs group-hover:text-white transition-colors"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
