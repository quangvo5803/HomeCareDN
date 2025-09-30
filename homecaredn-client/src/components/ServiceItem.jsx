import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { useService } from '../hook/useService';
import Loading from '../components/Loading';
import { Pagination } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import FilterItem from "./FilterItem";
import PropTypes from 'prop-types';

export default function ServiceItem({ itemServiceType }) {
    const { t, i18n } = useTranslation();
    const { services, fetchServices, loading, totalServices } = useService();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('random');
    const selectedServiceType = itemServiceType;

    //filter enum
    const [packageOption, setPackageOption] = useState(null);
    const [buildingType, setBuildingType] = useState(null);
    const [mainStructureType, setMainStructureType] = useState(null);
    const [designStyle, setDesignStyle] = useState(null);

    const pageSize = 10;

    useEffect(() => {
        fetchServices({
            PageNumber: currentPage,
            PageSize: pageSize,
            SortBy: sortOption,
            FilterServiceType: selectedServiceType,
            FilterPackageOption: packageOption,
            FilterBuildingType: buildingType,
            FilterMainStructureType: mainStructureType,
            FilterDesignStyle: designStyle,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage,
        sortOption,
        fetchServices,
        selectedServiceType,
        packageOption,
        buildingType,
        mainStructureType,
        designStyle,
    ]);

    const start = totalServices > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const end = Math.min(currentPage * pageSize, totalServices);
    if (loading) return <Loading />;

    return (
        <div className="bg-gray-50 pb-20 pt-8">
            <div className="max-w-[1440px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Filter */}
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-semibold text-orange-400 ms-6 -mb-8">
                            {t("serviceViewAll.title")}
                        </h2>

                        <FilterItem
                            itemType={{ type: 'service' }}
                            packageOption={packageOption}
                            buildingType={buildingType}
                            mainStructure={mainStructureType}
                            designStyle={designStyle}
                            onPackageOptionChange={setPackageOption}
                            onBuildingTypeChange={setBuildingType}
                            onMainStructureTypeChange={setMainStructureType}
                            onDesignStyleChange={setDesignStyle}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 flex flex-col">
                        {/* Sort */}
                        <div className="flex justify-end space-x-4 items-center pb-7">
                            <div className="flex items-center">
                                <p className="text-sm md:text-base">
                                    {t('serviceViewAll.pagination', { start, end, totalServices })}
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

                        {/* Service Cards List */}
                        <div className="flex flex-col space-y-6">
                            {services && services.length > 0 ? (
                                services.map((item) => {
                                    return (
                                        <Link
                                            to={`/ServiceDetail/${item.serviceID}`}
                                            key={item.serviceID}
                                            className="block rounded-lg shadow-sm overflow-hidden transform transition group duration-300 hover:shadow-2xl hover:-translate-y-1"
                                        >
                                            <div className="flex flex-col lg:flex-row">
                                                {/* Image */}
                                                <div className=" flex items-center justify-center ">
                                                    <div className=" flex items-center justify-center">
                                                        <img
                                                            src={
                                                                item.imageUrls?.[0] ||
                                                                "https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg"
                                                            }
                                                            alt={item.name || "No image"}
                                                            className="max-w-[400px] max-h-[200px] object-cover duration-300 transform group-hover:scale-105"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="lg:w-2/3 p-6 flex flex-col flex-1">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-xl font-semibold text-gray-900 truncate">
                                                                {i18n.language === "vi"
                                                                    ? item.name
                                                                    : item.nameEN || item.name}
                                                            </h3>
                                                            <div className="flex items-center mt-2">
                                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                                                                    <i className="fas fa-check-circle mr-1"></i>
                                                                    {t("serviceViewAll.verifiedLicense")}
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


                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
                                    <i className="flex-shrink-0 fas fa-tools text-4xl mb-4"></i>
                                    <p className="text-lg font-medium">
                                        {t("serviceViewAll.noService")}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {services && services.length > 0 && (
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
                        )}
                    </div>
                </div>
            </div>
        </div>


    );
}
ServiceItem.propTypes = {
    itemServiceType: PropTypes.string.isRequired,
};