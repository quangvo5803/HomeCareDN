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