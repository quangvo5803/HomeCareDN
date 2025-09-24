import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { useService } from '../hook/useService';
import Loading from '../components/Loading';
import { Pagination } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

export default function ServiceItem({ serviceType }) {
    const { t, i18n } = useTranslation();
    const { services, fetchServices, loading, totalServices } = useService();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('random');
    const pageSize = 10;

    useEffect(() => {
        fetchServices({
            PageNumber: currentPage,
            PageSize: pageSize,
            SortBy: sortOption,
            FilterService: serviceType || null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, sortOption, fetchServices, serviceType]);
    const start = totalServices > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const end = Math.min(currentPage * pageSize, totalServices);
    if (loading) return <Loading />;

    return (
        <div className="bg-gray-50 pb-20 pt-8">
            <div className="max-w-7xl mx-auto p-4">
                {/* Search & Sort */}
                <div className="flex justify-end space-x-4 items-center pb-7">
                    <div className="flex items-center">
                        <p className="text-sm md:text-base">
                            {t('serviceViewAll.pagination', {
                                start,
                                end,
                                totalServices,
                            })}
                        </p>
                    </div>

                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                        value={sortOption}
                        onChange={(e) => {
                            setSortOption(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="random">{t('home.default')}</option>
                        <option value={i18n.language === 'vi' ? 'servicename' : 'servicenameen'}>
                            A - Z
                        </option>
                        <option value={i18n.language === 'vi' ? 'servicename_desc' : 'servicenameen_desc'}>
                            Z - A
                        </option>
                    </select>
                </div>

                {/* Service Cards */}
                <div className="space-y-8">
                    {services.map((item, index) => {
                        const description =
                            i18n.language === "vi"
                                ? item.description || ""
                                : item.descriptionEN || item.description || "";

                        return (
                            <Link
                                to={`/ServiceDetail/${item.serviceID}`}
                                key={index}
                                className="block rounded-lg shadow-sm overflow-hidden transform transition group duration-300 hover:shadow-2xl hover:-translate-y-1"
                            >
                                <div className="flex flex-col lg:flex-row">
                                    <div className="lg:w-1/3 flex items-center justify-center ">
                                        <div className=" flex items-center justify-center">
                                            <img
                                                src={item.imageUrls?.[0] || 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg'}
                                                alt={item.name || "No image"}
                                                className="max-w-[370px] max-h-[380px] object-cover duration-300 transform group-hover:scale-110"
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:w-2/3 p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-semibold text-gray-900 truncate">{i18n.language === 'vi' ? item.name : item.nameEN || item.name}</h3>
                                                <div className="flex items-center mt-2">
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                                                        <i className="fas fa-check-circle mr-1"></i>{t('serviceViewAll.verifiedLicense')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                                                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm whitespace-nowrap">
                                                    <i className="flex-shrink-0 fas fa-tools mr-2"></i>
                                                    <span className="text-xs truncate">
                                                        {t(`Enums.ServiceType.${item.serviceType}`)}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center mb-4 text-sm">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded mr-3">
                                                $$$$$
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <div className="text-gray-700 mb-4 flex items-start min-h-[48px]">
                                            {description && description.trim().length > 0 ? (
                                                <>
                                                    <i className="fas fa-plus text-green-600 mr-2 mt-1"></i>
                                                    <p
                                                        className="flex-1 line-clamp-2"
                                                        dangerouslySetInnerHTML={{
                                                            __html: DOMPurify.sanitize(
                                                                description,
                                                                { FORBID_TAGS: ["img"] }
                                                            ),
                                                        }}
                                                    ></p>
                                                    <i className="fas fa-info-circle text-gray-400 ml-1 mt-1"></i>
                                                </>
                                            ) : (
                                                <p className="flex-1 text-gray-400 italic">{t('home.noDescription')}</p>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                                                {t('BUTTON.ReadMore')} <i className="fas fa-chevron-right ml-1"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                        );
                    })}
                    <div className="flex justify-center py-4 col-span-full">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={totalServices}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            size="small"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
