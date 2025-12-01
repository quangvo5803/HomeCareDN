import { Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import he from 'he';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useAuth } from '../hook/useAuth';
import { toast } from 'react-toastify';
import { useMaterialRequest } from '../hook/useMaterialRequest';
import VenoBox from 'venobox';
import 'venobox/dist/venobox.min.css';
import ExsitingMaterialRequestModal from './modal/ExistingMaterialRequestModal';

export default function ItemDetail({ item, relatedItems = [] }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [mainImage, setMainImage] = useState(item.imageUrls?.[0]);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showAddToExistingModal, setShowAddToExistingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const navigate = useNavigate();
  const MAX_LENGTH = 500;
  const { createMaterialRequest } = useMaterialRequest();

  useEffect(() => {
    if (item?.imageUrls?.length > 0) {
      setMainImage(item.imageUrls[0]);
    }
  }, [item]);

  useEffect(() => {
    const vb = new VenoBox({ selector: '.venobox' });
    return () => vb.close();
  });

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

  const handleAddExsitingMaterialRequest = () => {
    if (!user) {
      toast.error(t('common.notLogin'));
      navigate('/Login');
      return;
    }
    setShowAddToExistingModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb - IKEA Style */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t(`breadcrumb_home`)}
            </Link>
            <i className="fas fa-chevron-right text-xs text-gray-400"></i>
            <Link
              to={
                item.type === 'material'
                  ? '/MaterialViewAll'
                  : serviceTypeConfig[item.serviceType]?.route
              }
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t(
                item.type === 'material'
                  ? 'materialDetail.breadcrumb_material'
                  : serviceTypeConfig[item.serviceType]?.breadcrumb
              )}
            </Link>
            <i className="fas fa-chevron-right text-xs text-gray-400"></i>
            <span className="text-gray-900 font-medium">{showName}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column - Gallery */}
          <div className="lg:col-span-5">
            <div className="sticky top-4 space-y-4">
              {/* Main Image */}
              <div className="bg-white border border-gray-200">
                <div className="w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                  <a
                    key={mainImage}
                    href={mainImage}
                    className="venobox w-full h-full flex items-center justify-center hover:opacity-90 transition-opacity"
                    data-gall="item-gallery"
                  >
                    <img
                      src={mainImage}
                      alt={item.name}
                      className="w-full h-full object-contain p-8"
                    />
                  </a>
                </div>
              </div>

              {/* Hidden anchors for Venobox gallery */}
              {item.imageUrls?.map((src) =>
                src !== mainImage ? (
                  <a
                    key={'hidden-' + src}
                    href={src}
                    className="venobox hidden"
                    data-gall="item-gallery"
                  />
                ) : null
              )}

              {/* Thumbnails - IKEA Style */}
              {item.imageUrls?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {item.imageUrls.map((src, i) => (
                    <button
                      key={src}
                      onClick={() => setMainImage(src)}
                      className={`flex-shrink-0 w-20 h-20 bg-white border flex items-center justify-center overflow-hidden transition-all ${
                        mainImage === src
                          ? 'border-2 border-black'
                          : 'border-gray-200 hover:border-gray-400'
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
                        className="w-full h-full object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="lg:col-span-7">
            {/* Product Title */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {showName}
              </h1>
            </div>

            {/* Product Details Grid - IKEA Style */}
            <div className="bg-gray-50 p-6 mb-6">
              {/* Material Info */}
              {item.type === 'material' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-tag text-blue-600"></i>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          {t(`materialDetail.category`)}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {showCategory}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-star text-orange-600"></i>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          {t(`materialDetail.brand`)}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {showBrand}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-ruler text-green-600"></i>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          {t(`${item.type}Detail.unit`)}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {showUnit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Info */}
              {item.type === 'service' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-tools text-blue-600"></i>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          {t('sharedEnums.serviceType')}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {t(`Enums.ServiceType.${item.serviceType}`)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-building text-orange-600"></i>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          {t('sharedEnums.buildingType')}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {t(`Enums.BuildingType.${item.buildingType}`)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-box-open text-purple-600"></i>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          {t('sharedEnums.packageOption')}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {item.packageOption
                            ? t(`Enums.PackageOption.${item.packageOption}`)
                            : t(`sharedEnums.updating`)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-palette text-pink-600"></i>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          {t('sharedEnums.designStyle')}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {item.designStyle
                            ? t(`Enums.DesignStyle.${item.designStyle}`)
                            : t(`sharedEnums.updating`)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 col-span-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-hammer text-red-600"></i>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          {t('sharedEnums.mainStructure')}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {item.mainStructureType
                            ? t(`Enums.MainStructure.${item.mainStructureType}`)
                            : t(`sharedEnums.updating`)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - IKEA Style */}
            {item.type === 'material' && (
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  className="flex-1 px-8 py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors"
                  onClick={() => handleAddNewMaterialRequest(item.materialID)}
                >
                  <i className="mr-2 fa-solid fa-plus"></i>
                  {t('BUTTON.AddNewRequest')}
                </button>
                <button
                  className="flex-1 px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => handleAddExsitingMaterialRequest()}
                >
                  <i className="mr-2 fa-solid fa-clipboard"></i>
                  {t('BUTTON.AddToExisting')}
                </button>
              </div>
            )}

            {item.type === 'service' && (
              <div className="mb-8">
                <button
                  className="w-full sm:w-auto px-8 py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors"
                  onClick={() => handleAddNewServiceRequest(item)}
                >
                  <i className="mr-2 fa-solid fa-plus"></i>
                  {t('BUTTON.AddNewRequest')}
                </button>
              </div>
            )}

            {/* Tabs - IKEA Style */}
            <div className="border-b border-gray-300 mb-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 font-semibold text-sm transition-colors relative inline-flex items-center gap-2 ${
                  activeTab === 'description'
                    ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="fas fa-align-left text-xs"></i>
                {t(`materialDetail.description`)}
              </button>
            </div>

            {/* Description Content */}
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                {showDescription && showDescription.trim().length > 0 ? (
                  <>
                    <div
                      className="text-gray-700 leading-relaxed text-sm"
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
                        className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
                      >
                        {showFullDesc
                          ? t('BUTTON.Reduce')
                          : t('BUTTON.ReadMore')}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    {t('home.noDescription')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products - IKEA Style */}
      {relatedItems && relatedItems.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {t(
                  item.type === 'material'
                    ? 'materialDetail.relatedMaterial'
                    : serviceTypeConfig[item.serviceType]?.related
                )}
              </h2>
              <Link
                to={
                  item.type === 'material'
                    ? '/MaterialViewAll'
                    : serviceTypeConfig[item.serviceType]?.route
                }
                className="text-sm font-semibold text-blue-700 hover:underline flex items-center"
              >
                {t(
                  item.type === 'material'
                    ? 'home.material_more'
                    : serviceTypeConfig[item.serviceType]?.more
                )}
                <i className="fa-solid fa-arrow-right ms-2 text-xs"></i>
              </Link>
            </div>

            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {relatedItems.map((m) => (
                <Link
                  key={m.serviceID || m.materialID}
                  to={`/${
                    item.type === 'material'
                      ? 'MaterialDetail'
                      : 'ServiceDetail'
                  }/${m.serviceID || m.materialID}`}
                  className="group bg-white hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="aspect-square bg-white flex items-center justify-center overflow-hidden border-b border-gray-200">
                    <img
                      src={
                        m.imageUrls?.[0] ||
                        'https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg'
                      }
                      alt={m.name || 'No image'}
                      className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-700">
                      {i18n.language === 'vi' ? m.name : m.nameEN || m.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal */}
      <ExsitingMaterialRequestModal
        isOpen={showAddToExistingModal}
        onClose={() => setShowAddToExistingModal(false)}
        materialID={item.materialID}
      />
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
    buildingType: PropTypes.string,
    designStyle: PropTypes.string,
    packageOption: PropTypes.string,
    mainStructureType: PropTypes.string,
    materialID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    serviceID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  relatedItems: PropTypes.array,
};
