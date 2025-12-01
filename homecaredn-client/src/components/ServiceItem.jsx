import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { useService } from '../hook/useService';
import LoadingComponent from '../components/LoadingComponent';
import { Pagination } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterItem from './FilterItem';
import PropTypes from 'prop-types';

export default function ServiceItem({ itemServiceType }) {
  const { t, i18n } = useTranslation();
  const { services, fetchServices, loading, totalServices } = useService();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('random');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
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
  }, [
    currentPage,
    sortOption,
    fetchServices,
    selectedServiceType,
    packageOption,
    buildingType,
    mainStructureType,
    designStyle,
  ]);

  const getSortLabel = () => {
    if (sortOption === 'random') return t('home.default');
    if (sortOption === 'servicename' || sortOption === 'servicenameen')
      return 'A → Z';
    if (
      sortOption === 'servicename_desc' ||
      sortOption === 'servicenameen_desc'
    )
      return 'Z → A';
    return t('home.default');
  };

  const start =
    totalServices > 0 && !loading ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalServices);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar Filter - IKEA Style */}
          <aside className="lg:col-span-3">
            <div className="sticky top-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
                {t('serviceViewAll.title')}
              </h1>

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
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            {/* Top Bar - Minimalist */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-3 sm:mb-0">
                {t('serviceViewAll.pagination', {
                  start,
                  end,
                  totalServices,
                })}
              </p>

              {/* Sort Dropdown - IKEA Style */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-full"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">
                      {t('common.sort')}
                      {': '} {getSortLabel()}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      showSortDropdown ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showSortDropdown && (
                  <>
                    {/* Backdrop */}
                    <button
                      type="button"
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSortDropdown(false)}
                      aria-label="Close dropdown"
                    ></button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[200px] overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setSortOption('random');
                            setCurrentPage(1);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            sortOption === 'random'
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{t('home.default')}</span>
                          {sortOption === 'random' && (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>

                        <div className="h-px bg-gray-200 my-1"></div>

                        <button
                          onClick={() => {
                            setSortOption(
                              i18n.language === 'vi'
                                ? 'servicename'
                                : 'servicenameen'
                            );
                            setCurrentPage(1);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            sortOption === 'servicename' ||
                            sortOption === 'servicenameen'
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>A → Z</span>
                          {(sortOption === 'servicename' ||
                            sortOption === 'servicenameen') && (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setSortOption(
                              i18n.language === 'vi'
                                ? 'servicename_desc'
                                : 'servicenameen_desc'
                            );
                            setCurrentPage(1);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            sortOption === 'servicename_desc' ||
                            sortOption === 'servicenameen_desc'
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Z → A</span>
                          {(sortOption === 'servicename_desc' ||
                            sortOption === 'servicenameen_desc') && (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Service Cards Grid - IKEA Clean Layout */}
            {loading ? (
              <div className="flex flex-col items-center justify-center w-full h-96">
                <LoadingComponent />
              </div>
            ) : services && services.length > 0 ? (
              <>
                <div className="space-y-6">
                  {services.map((item) => (
                    <Link
                      to={`/ServiceDetail/${item.serviceID}`}
                      key={item.serviceID}
                      className="group block bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image Container - IKEA square aesthetic */}
                        <div className="md:w-2/5 bg-gray-50 flex items-center justify-center overflow-hidden">
                          <img
                            src={
                              item.imageUrls?.[0] ||
                              'https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg'
                            }
                            alt={item.name || 'Service image'}
                            className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Content - Clean Typography */}
                        <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {i18n.language === 'vi'
                                  ? item.name
                                  : item.nameEN || item.name}
                              </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {t('serviceViewAll.verifiedLicense')}
                              </span>

                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {t(`Enums.ServiceType.${item.serviceType}`)}
                              </span>
                            </div>
                          </div>

                          {/* CTA Area */}
                          <div className="pt-4 mt-auto">
                            <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                              <span>Xem chi tiết</span>
                              <svg
                                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination - Clean Design */}
                <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalServices}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('serviceViewAll.noService')}
                </h3>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

ServiceItem.propTypes = {
  itemServiceType: PropTypes.string.isRequired,
};
