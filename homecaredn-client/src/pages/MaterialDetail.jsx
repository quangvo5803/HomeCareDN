<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { materialService } from '../services/materialService';

export default function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [material, setMaterial] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        if (!id) throw new Error('Missing id');

        const res = await materialService.getMaterialById(id);
        const data = res?.data ?? res;
        const nm = normalizeMaterial(data);
        if (mounted) setMaterial(nm);

        const listRes = await materialService.getAllMaterial();
        const list = Array.isArray(listRes) ? listRes : listRes?.data ?? [];
        const relatedNm = list
          .map(normalizeMaterial)
          .filter((x) => x.id != null && String(x.id) !== String(id))
          .slice(0, 4);
        if (mounted) setRelated(relatedNm);
      } catch (e) {
        console.error(e);
        if (mounted) setError('Failed to load material');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-red-600">{error}</p>
        <Link to="/MaterialsCatalog" className="text-orange-600 font-medium">
          {t('materials.detail.back_to_list')}
        </Link>
      </main>
    );
  }

  if (!material) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-gray-600">{t('materials.detail.not_found')}</p>
        <Link to="/MaterialsCatalog" className="text-orange-600 font-medium">
          {t('materials.detail.back_to_list')}
        </Link>
      </main>
    );
  }

  return (
    <main>
      <section className="relative h-[46vh] md:h-[56vh]">
        <img
          src={material.img}
          alt={material.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <nav className="text-white/85 text-sm mb-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">
              {t('materials.catalog.breadcrumbs_home')}
            </Link>
            <span className="mx-2">/</span>
            <Link to="/MaterialsCatalog" className="hover:text-white">
              {t('materials.catalog.breadcrumbs_materials')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white font-semibold">{material.title}</span>
          </nav>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5 self-start">
          <div className="rounded-2xl overflow-hidden">
            <img
              src={material.img}
              alt={material.title}
              className="w-full aspect-[1/1] object-cover"
            />
          </div>

          {material.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {material.images.slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  className="rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label={`${material.title} thumbnail ${i + 1}`}
                  onClick={() => setMaterial((prev) => ({ ...prev, img: src }))}
                >
                  <img
                    src={src}
                    alt={`${material.title} thumbnail ${i + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-7 lg:pl-4 self-start">
          <div className="lg:sticky lg:top-20 h-fit space-y-6">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {material.title}
              </h2>
              <p className="mt-2 text-gray-600">{material.desc}</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow"
                  onClick={() => {}}
                >
                  {t('materials.detail.cta_add_new_request')}
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl bg-white ring-1 ring-black/10 hover:ring-black/20 text-gray-900 font-semibold"
                  onClick={() => {}}
                >
                  {t('materials.detail.cta_add_to_existing')}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="border-b flex">
                <button className="px-4 md:px-6 py-3 text-sm font-medium text-orange-600 border-b-2 border-orange-500">
                  {t('materials.detail.description_tab')}
                </button>
              </div>
              <div className="p-6 text-gray-600">
                <p>
                  {t('materials.detail.description_tab')} —{' '}
                  <strong>{material.title}</strong>.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div className="flex items-end justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {t('materials.detail.related_title')}
          </h3>
          <Link
            to="/MaterialsCatalog"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            {t('home.material_more', 'More Materials')} →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((m) => (
            <article
              key={m.id}
              onClick={() => navigate(`/Materials/${m.id}`)}
              className="group cursor-pointer bg-white rounded-2xl shadow-sm ring-1 ring-black/5 hover:ring-orange-500 hover:shadow-md transition overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={m.img}
                  alt={m.title}
                  className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ring-2 ring-inset ring-orange-500/20 pointer-events-none" />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition">
                  {m.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">{m.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
=======
import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMaterial } from "../hook/useMaterial"
import { useTranslation } from "react-i18next";
import Loading from '../components/Loading';
import DOMPurify from "dompurify";
import he from "he";

export default function MaterialDetail() {
    const { materialID } = useParams();
    const { t, i18n } = useTranslation();
    const [material, setMaterial] = useState({});
    const [mainImage, setMainImage] = useState();
    const { getMaterialById, loading, fetchMaterials } = useMaterial();
    const [randomMaterials, setRandomMaterials] = useState([]);
    const location = useLocation();

    // đóng mở mô tả
    const [showFullDesc, setShowFullDesc] = useState(false);
    //mô tả
    const MAX_LENGTH = 500;
    const description =
        i18n.language === "vi"
            ? material.description
            : material.descriptionEN || material.description;

    //get by id
    useEffect(() => {
        const fetchMaterial = async () => {
            const data = await getMaterialById(materialID);
            setMaterial(data || {});
            setMainImage(data.imageUrls?.[0]);
        };
        fetchMaterial();
    }, [materialID, getMaterialById, location.key]);

    // luôn nhảy lên đầu 
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [location.key]);

    //lọc theo cate
    useEffect(() => {
        if (!material.categoryID) return
        const loadMaterials = async () => {
            try {
                const data = await fetchMaterials({
                    PageNumber: 1,
                    PageSize: 8,
                    SortBy: "random",
                    FilterID: material.categoryID || null
                });
                setRandomMaterials(data.items || []);
            } catch (err) {
                console.error(err);
                setRandomMaterials([]);
            }
        };

        loadMaterials();
    }, [fetchMaterials, material.categoryID]);



    if (loading) return <Loading />;
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section với gradient overlay */}
            <section className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
                <img
                    src={material.imageUrls?.[0]}
                    alt={material.name}
                    className="absolute inset-0 object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                <div className="relative z-10 flex flex-col justify-end h-full pb-12">
                    <div className="container px-4 mx-auto md:px-6 lg:px-8">
                        {/* Breadcrumb với style mới */}
                        <nav className="flex items-center mb-4 space-x-2 text-sm" aria-label="Breadcrumb">
                            <Link to="/" className="flex items-center transition-colors text-white/70 hover:text-white">
                                <i className="mr-1 fa-solid fa-house"></i>
                                {t('materialDetail.breadcrumb_home')}
                            </Link>
                            <span className="text-white/40">/</span>
                            <Link to="/MaterialViewAll" className="transition-colors text-white/70 hover:text-white">
                                {t('materialDetail.breadcrumb_material')}
                            </Link>
                            <span className="text-white/40">/</span>
                            <span className="font-medium text-white">
                                {i18n.language === 'vi' ? material.name : material.nameEN || material.name}
                            </span>
                        </nav>

                        {/* Hero Title */}
                        <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                            {i18n.language === 'vi' ? material.name : material.nameEN || material.name}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container relative z-20 px-4 mx-auto -mt-8 md:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">

                    {/* Gallery Section */}
                    <div className="lg:col-span-5">
                        <div className="sticky space-y-4 top-4">
                            {/* Main Image */}
                            <div className="p-8 overflow-hidden bg-white shadow-xl rounded-2xl">
                                <div className="flex items-center justify-center aspect-square">
                                    <img
                                        src={mainImage}
                                        alt={material.name}
                                        className="object-contain max-w-full max-h-full"
                                    />
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {material.imageUrls?.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {material.imageUrls.slice(0, 4).map((src, i) => (
                                        <button
                                            key={src}
                                            onClick={() => setMainImage(src)}
                                            className={`
                                                relative 
                                                bg-white 
                                                rounded-xl 
                                                overflow-hidden 
                                                aspect-square 
                                                flex items-center justify-center
                                                transition-all duration-300 hover:shadow-lg
                                                ${mainImage === src
                                                    ? 'ring-2 ring-orange-500 shadow-md scale-105'
                                                    : 'hover:scale-105 shadow-sm'}
                                                `}
                                            aria-label={`${material.name} thumbnail ${i + 1}`}
                                        >
                                            <img
                                                src={src}
                                                alt={`${material.name} thumbnail ${i + 1}`}
                                                className="object-contain w-[95px] h-[95px]"
                                            />
                                            {mainImage === src && (
                                                <div className="absolute inset-0 bg-orange-500/10" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="lg:col-span-7">
                        <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
                            {/* Header với gradient */}
                            <div className="p-6 text-white bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="mb-2 text-2xl font-bold">
                                    {i18n.language === 'vi' ? material.name : material.nameEN || material.name}
                                </h2>

                            </div>

                            {/* Product Details */}
                            <div className="p-6 space-y-6 lg:p-8">
                                <div className="grid gap-6 md:grid-cols-3">
                                    <div className="group">
                                        <div className="flex items-center mb-2">
                                            <div className="flex items-center justify-center w-10 h-10 mr-3 transition-colors bg-blue-100 rounded-lg group-hover:bg-blue-200">
                                                <i className="text-lg text-blue-600 fa-solid fa-tag"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs tracking-wider text-gray-500 uppercase">
                                                    {t('materialDetail.category')}
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {i18n.language === 'vi' ? material.categoryName : material.categoryNameEN || material.categoryName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <div className="flex items-center mb-2">
                                            <div className="flex items-center justify-center w-10 h-10 mr-3 transition-colors bg-orange-100 rounded-lg group-hover:bg-orange-200">
                                                <i className="text-lg text-orange-600 fa-solid fa-star"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs tracking-wider text-gray-500 uppercase">
                                                    {t('materialDetail.brand')}
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {i18n.language === 'vi' ? material.brandName : material.brandNameEN || material.brandName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <div className="flex items-center mb-2">
                                            <div className="flex items-center justify-center w-10 h-10 mr-3 transition-colors bg-green-100 rounded-lg group-hover:bg-green-200">
                                                <i className="text-lg text-green-600 fa-solid fa-scale-balanced"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs tracking-wider text-gray-500 uppercase">
                                                    {t('materialDetail.unit')}
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {i18n.language === 'vi' ? material.unit : material.unitEN || material.unit}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-4 mt-10 sm:flex-row">
                                    <button className="flex-1 group relative px-6 py-3 bg-orange-500 text-white font-medium rounded-xl  transition-all  hover:scale-[1.02]">
                                        <span className="relative z-10 flex items-center justify-center">
                                            <i className="mr-2 fa-solid fa-plus"></i>
                                            {t('BUTTON.AddNewRequest')}
                                        </span>

                                    </button>

                                    <button className="flex-1 group relative px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2  transition-all  hover:border-orange-500 hover:text-orange-600  hover:scale-[1.02]">
                                        <span className="relative z-10 flex items-center justify-center">
                                            <i className="mr-2 fa-solid fa-clipboard"></i>
                                            {t('BUTTON.AddToExisting')}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Description Tab */}
                        <div className="mt-8 overflow-hidden bg-white shadow-xl rounded-2xl">
                            <div className="border-b border-gray-200">
                                <nav className="flex -mb-px">
                                    <button className="relative px-6 py-4 text-sm font-medium text-orange-600 border-b-2 border-orange-500 bg-orange-50">
                                        {t('materialDetail.description')}
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
                                    </button>
                                </nav>
                            </div>

                            <div className="p-6 lg:p-8">
                                <div
                                    className="leading-relaxed text-gray-700"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            he.decode(
                                                showFullDesc || description?.length <= MAX_LENGTH
                                                    ? description
                                                    : description?.slice(0, MAX_LENGTH) + "..."
                                            )
                                        ),
                                    }}
                                />

                                {/* Nút toggle */}
                                {description?.length > MAX_LENGTH && (
                                    <button
                                        onClick={() => setShowFullDesc(!showFullDesc)}
                                        className="mt-3 font-medium text-orange-600 cursor-pointer hover:underline"
                                    >
                                        {showFullDesc ? t('BUTTON.Reduce') : t('BUTTON.ReadMore')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            <section className="container px-4 py-16 mx-auto md:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {t('materialDetail.relatedMaterial')}
                        </h3>
                    </div>
                    <Link
                        to="/MaterialsCatalog"
                        className="flex items-center font-medium text-orange-600 transition-colors group hover:text-orange-700"
                    >
                        {t('home.material_more', 'More Materials')}
                        <i className="fa-solid fa-arrow-right ms-2"></i>
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {randomMaterials.map((m) => (
                        <Link
                            key={m.materialID}
                            to={`/MaterialDetail/${m.materialID}`}
                            className="overflow-hidden transition-all duration-300 bg-white shadow-lg group rounded-2xl hover:shadow-2xl hover:-translate-y-1"
                        >
                            <div className="relative p-4 aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                                <img
                                    src={m.imageUrls?.[0]}
                                    alt={m.name}
                                    className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            <div className="p-5">
                                <h4 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-orange-600">
                                    {i18n.language === 'vi' ? m.name : m.nameEN || m.name}
                                </h4>
                                <p
                                    className="text-sm text-gray-600 line-clamp-2"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            i18n.language === "vi" ? m.description : m.descriptionEN || m.description,
                                            { FORBID_TAGS: ["img"] }   // loại bỏ ảnh
                                        ),
                                    }}
                                ></p>

                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}
>>>>>>> develop
