import { Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import he from 'he';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useAuth } from '../hook/useAuth';
import { toast } from 'react-toastify';
import { useMaterialRequest } from '../hook/useMaterialRequest';

export default function ItemDetail({ item, relatedItems = [] }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [mainImage, setMainImage] = useState(item.imageUrls?.[0]);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const navigate = useNavigate();
  const MAX_LENGTH = 500;
  const { createMaterialRequest } = useMaterialRequest();
  useEffect(() => {
    if (item?.imageUrls?.length > 0) {
      setMainImage(item.imageUrls[0]);
    }
  }, [item]);

  const serviceTypeConfig = {
    Construction: {
      route: '/ConstructionViewAll',
      breadcrumb: 'serviceDetail.breadcrumb_construction',
      more: 'home.service_construction_more',
      related: 'serviceDetail.relatedConstruction',
    },
    Repair: {
      route: '/RepairViewAll',
      breadcrumb: 'serviceDetail.breadcrumb_repair',
      more: 'home.service_repair_more',
      related: 'serviceDetail.relatedRepair',
    },
  };

  const getText = (vi, en) => (i18n.language === 'vi' ? vi : en || vi);

  const showName = getText(item.name, item.nameEN);
  const showDescription = getText(item.description, item.descriptionEN);
  const showCategory = getText(item.categoryName, item.categoryNameEN);
  const showBrand = getText(item.brandName, item.brandNameEN);
  const showUnit = getText(item.unit, item.unitEN);

  const handleAddNewServiceRequest = (service) => {
    if (!user) {
      toast.error(t('common.notLogin'));
      navigate('/Login');
      return;
    }
    navigate('/Customer/ServiceRequest', { state: { service } });
  };
  const handleAddNewMaterialRequest = (materialID) => {
    if (!user) {
      toast.error(t('common.notLogin'));
      navigate('/Login');
      return;
    }
    createMaterialRequest({ CustomerID: user.id, FirstMaterialID: materialID });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
        <img
          src={item.imageUrls?.[0]}
          alt={item.name}
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end h-full pb-12">
          <div className="container px-4 mx-auto md:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center mb-4 space-x-2 text-sm">
              <Link
                to="/"
                className="flex items-center transition-colors text-white/70 hover:text-white"
              >
                <i className="mr-1 fa-solid fa-house"></i>
                {t(`breadcrumb_home`)}
              </Link>
              <span className="text-white/40">/</span>
              <Link
                to={
                  item.type === 'material'
                    ? '/MaterialViewAll'
                    : serviceTypeConfig[item.serviceType]?.route
                }
                className="transition-colors text-white/70 hover:text-white"
              >
                {t(
                  item.type === 'material'
                    ? 'materialDetail.breadcrumb_material'
                    : serviceTypeConfig[item.serviceType]?.breadcrumb
                )}
              </Link>
              <span className="text-white/40">/</span>
              <span className="font-medium text-white">{showName}</span>
            </nav>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {showName}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container relative z-20 px-4 mx-auto -mt-8 md:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Gallery */}
          <div className="lg:col-span-5">
            <div className="sticky space-y-4 top-4">
              <div className="p-8 overflow-hidden bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-center aspect-square">
                  <img
                    src={mainImage}
                    alt={item.name}
                    className="object-contain max-w-full max-h-full"
                  />
                </div>
              </div>

              {item.imageUrls?.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {item.imageUrls.slice(0, 4).map((src, i) => (
                    <button
                      key={src}
                      onClick={() => setMainImage(src)}
                      className={`relative bg-white rounded-xl overflow-hidden aspect-square flex items-center justify-center transition-all duration-300 hover:shadow-lg ${
                        mainImage === src
                          ? 'ring-2 ring-orange-500 shadow-md scale-105'
                          : 'hover:scale-105 shadow-sm'
                      }`}
                      aria-label={`${item.name} thumbnail ${i + 1}`}
                    >
                      <img
                        src={
                          src ||
                          'https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg'
                        }
                        alt={
                          item.name
                            ? `${item.name} thumbnail ${i + 1}`
                            : 'No image'
                        }
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

          {/* Info */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
              <div className="p-6 text-white bg-gradient-to-r from-orange-500 to-orange-600">
                <h2 className="mb-2 text-2xl font-bold">{showName}</h2>
              </div>

              {/* Details */}
              <div className="p-6 space-y-6 lg:p-8">
                {/* Nếu là Material */}
                {item.type === 'material' && (
                  <>
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Category */}
                      <div className="group">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg">
                            <i className="text-lg text-blue-600 fa-solid fa-tag"></i>
                          </div>
                          <div>
                            <p className="text-xs tracking-wider text-gray-500 uppercase">
                              {t(`materialDetail.category`)}
                            </p>
                            <p className="font-semibold text-gray-800">
                              {showCategory}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Brand */}
                      <div className="group">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-10 h-10 mr-3 bg-orange-100 rounded-lg">
                            <i className="text-lg text-orange-600 fa-solid fa-star"></i>
                          </div>
                          <div>
                            <p className="text-xs tracking-wider text-gray-500 uppercase">
                              {t(`materialDetail.brand`)}
                            </p>
                            <p className="font-semibold text-gray-800">
                              {showBrand}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Unit */}
                      <div className="group">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
                            <i className="text-lg text-green-600 fa-solid fa-scale-balanced"></i>
                          </div>
                          <div>
                            <p className="text-xs tracking-wider text-gray-500 uppercase">
                              {t(`${item.type}Detail.unit`)}
                            </p>
                            <p className="font-semibold text-gray-900">
                              {showUnit}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Buttons */}
                    <div className="flex flex-col gap-4 mt-10 sm:flex-row">
                      <button
                        className="flex-1 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:scale-[1.02] transition-all"
                        onClick={() =>
                          handleAddNewMaterialRequest(item.materialID)
                        }
                      >
                        <i className="mr-2 fa-solid fa-plus"></i>
                        {t('BUTTON.AddNewRequest')}
                      </button>
                      <button className="flex-1 px-6 py-3 bg-white border-2 text-gray-700 font-semibold rounded-xl hover:border-orange-500 hover:text-orange-600 hover:scale-[1.02] transition-all">
                        <i className="mr-2 fa-solid fa-clipboard"></i>
                        {t('BUTTON.AddToExisting')}
                      </button>
                    </div>
                  </>
                )}

                {/* Nếu là Service */}
                {item.type === 'service' && (
                  <>
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Service Type */}
                      <div className="group">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg">
                            <i className="flex-shrink-0 text-lg text-blue-600 fas fa-tools"></i>
                          </div>
                          <div>
                            <p className="text-xs tracking-wider text-gray-500 uppercase">
                              {t('sharedEnums.serviceType')}
                            </p>
                            <p className="font-semibold text-gray-800">
                              {t(`Enums.ServiceType.${item.serviceType}`)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Building Type */}
                      <div className="group">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-10 h-10 mr-3 bg-orange-100 rounded-lg">
                            <i className="flex-shrink-0 text-lg text-orange-600 fas fa-building"></i>
                          </div>
                          <div>
                            <p className="text-xs tracking-wider text-gray-500 uppercase">
                              {t('sharedEnums.buildingType')}
                            </p>
                            <p className="font-semibold text-gray-800">
                              {t(`Enums.BuildingType.${item.buildingType}`)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Package Option */}
                      {item?.packageOption && (
                        <div className="group">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
                              <i className="text-lg text-green-600 fa-solid fa-box-open"></i>
                            </div>
                            <div>
                              <p className="text-xs tracking-wider text-gray-500 uppercase">
                                {t('sharedEnums.packageOption')}
                              </p>
                              <p className="font-semibold text-gray-800">
                                {t(`Enums.PackageOption.${item.packageOption}`)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center gap-6 md:col-span-3">
                        {/* Design style */}
                        {item?.designStyle && (
                          <div className="w-50 group">
                            <div className="flex items-center mb-2">
                              <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
                                <i className="text-lg text-purple-600 fa-solid fa-palette"></i>
                              </div>
                              <div>
                                <p className="text-xs tracking-wider text-gray-500 uppercase">
                                  {t('sharedEnums.designStyle')}
                                </p>
                                <p className="font-semibold text-gray-800">
                                  {t(`Enums.DesignStyle.${item.designStyle}`)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Main Structure Type */}
                        {item?.mainStructureType && (
                          <div className="group">
                            <div className="flex items-center mb-2">
                              <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
                                <i className="text-lg text-red-600 fa-solid fa-building-columns"></i>
                              </div>
                              <div>
                                <p className="text-xs tracking-wider text-gray-500 uppercase">
                                  {t('sharedEnums.mainStructure')}
                                </p>
                                <p className="font-semibold text-gray-800">
                                  {t(
                                    `Enums.MainStructure.${item.mainStructureType}`
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-4 mt-10 sm:flex-row">
                      <button
                        className="flex-1 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:scale-[1.02] transition-all"
                        onClick={() => handleAddNewServiceRequest(item)}
                      >
                        <i className="mr-2 fa-solid fa-plus"></i>
                        {t('BUTTON.AddNewRequest')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 overflow-hidden bg-white shadow-xl rounded-2xl">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button className="relative px-6 py-4 text-sm font-medium text-orange-600 border-b-2 border-orange-500 bg-orange-50">
                    {t(`materialDetail.description`)}
                  </button>
                </nav>
              </div>

              <div className="p-6 lg:p-8">
                {showDescription && showDescription.trim().length > 0 ? (
                  <>
                    <div
                      className="leading-relaxed text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          he.decode(
                            showFullDesc || showDescription.length <= MAX_LENGTH
                              ? showDescription
                              : showDescription.slice(0, MAX_LENGTH) + '...'
                          )
                        ),
                      }}
                    />
                    {showDescription.length > MAX_LENGTH && (
                      <button
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        className="mt-3 font-medium text-orange-600 hover:underline"
                      >
                        {showFullDesc
                          ? t('BUTTON.Reduce')
                          : t('BUTTON.ReadMore')}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 italic">
                    {t('home.noDescription')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="container px-4 py-16 mx-auto md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            {t(
              item.type === 'material'
                ? 'materialDetail.relatedMaterial'
                : serviceTypeConfig[item.serviceType]?.related
            )}
          </h3>
          <Link
            to={
              item.type === 'material'
                ? '/MaterialCatalog'
                : serviceTypeConfig[item.serviceType]?.route
            }
            className="flex items-center font-medium text-orange-600 hover:text-orange-700"
          >
            {t(
              item.type === 'material'
                ? 'home.material_more'
                : serviceTypeConfig[item.serviceType]?.more
            )}
            <i className="fa-solid fa-arrow-right ms-2"></i>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedItems.map((m) => (
            <Link
              key={m.serviceID || m.materialID}
              to={`/${
                item.type === 'material' ? 'MaterialDetail' : 'ServiceDetail'
              }/${m.serviceID || m.materialID}`}
              className="overflow-hidden transition-all bg-white shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="relative p-4 aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={
                    m.imageUrls?.[0] ||
                    'https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg'
                  }
                  alt={m.name || 'No image'}
                  className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5">
                <h4 className="mb-2 font-semibold text-gray-900 group-hover:text-orange-600">
                  {i18n.language === 'vi' ? m.name : m.nameEN || m.name}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
ItemDetail.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameEN: PropTypes.string,
    description: PropTypes.string,
    descriptionEN: PropTypes.string,
    categoryName: PropTypes.string,
    categoryNameEN: PropTypes.string,
    brandName: PropTypes.string,
    brandNameEN: PropTypes.string,
    unit: PropTypes.string,
    unitEN: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    type: PropTypes.string,
    serviceType: PropTypes.string,
    designStyle: PropTypes.string,
    packageOption: PropTypes.string,
    mainStructureType: PropTypes.string,
    // ✅ Thêm vào đây
    materialID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    serviceID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  relatedItems: PropTypes.array,
};
