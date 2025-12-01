import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hook/useAuth';
import { useMaterialRequest } from '../hook/useMaterialRequest';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExsitingMaterialRequestModal from './modal/ExistingMaterialRequestModal';

export default function CardItem({ item }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { createMaterialRequest } = useMaterialRequest();
  const navigate = useNavigate();
  const [showAddToExistingModal, setShowAddToExistingModal] = useState(false);

  let link = '#';

  if (item.type === 'material') {
    link = `/MaterialDetail/${item.materialID}`;
  } else if (item.type === 'service') {
    link = `/ServiceDetail/${item.serviceID}`;
  }

  const handleAddNewMaterialRequest = (materialID) => {
    if (!user) {
      toast.error(t('common.notLogin'));
      navigate('/Login');
      return;
    }
    createMaterialRequest({ CustomerID: user.id, FirstMaterialID: materialID });
  };

  const handleAddExistingMaterialRequest = () => {
    if (!user) {
      toast.error(t('common.notLogin'));
      navigate('/Login');
      return;
    }
    setShowAddToExistingModal(true);
  };

  const handleAddNewServiceRequest = (service) => {
    if (!user) {
      toast.error(t('common.notLogin'));
      navigate('/Login');
      return;
    }
    navigate('/Customer/ServiceRequest', { state: { service } });
  };
  const isNew = () => {
    if (!item.createdAt) return false;
    const createdDate = new Date(item.createdAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return createdDate >= twoWeeksAgo;
  };

  return (
    <div className="group flex flex-col h-full bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden">
      {/* Badge */}
      <div className="relative">
        {/* Image Container */}
        <a href={link} className="block relative overflow-hidden h-64 bg-white">
          {isNew() && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 z-1 uppercase">
              {t('common.new')}
            </span>
          )}
          <img
            src={
              item.imageUrls?.[0] ||
              'https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg'
            }
            alt={item.name || 'No image'}
            className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110 p-4"
          />
        </a>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-5">
        {/* Title */}
        <a href={link}>
          <h5 className="text-base font-semibold text-gray-900 mb-4 line-clamp-2 min-h-[48px] group-hover:text-orange-600 transition-colors duration-300">
            {i18n.language === 'vi' ? item.name : item.nameEN || item.name}
          </h5>
        </a>

        <div className="flex-grow"></div>

        {/* Tags */}
        {item.type === 'material' && (
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-300 text-orange-700 rounded-md">
              <i className="fas fa-tags text-xs flex-shrink-0"></i>
              <span className="text-xs font-medium whitespace-nowrap">
                {i18n.language === 'vi'
                  ? item.categoryName
                  : item.categoryNameEN || item.categoryName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-300 text-blue-700 rounded-md">
              <i className="fas fa-star text-xs flex-shrink-0"></i>
              <span className="text-xs font-medium whitespace-nowrap">
                {i18n.language === 'vi'
                  ? item.brandName
                  : item.brandNameEN || item.brandName}
              </span>
            </div>
          </div>
        )}

        {item.type === 'service' && (
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 rounded-md">
              <i className="fas fa-tools text-xs flex-shrink-0"></i>
              <span className="text-xs font-medium whitespace-nowrap">
                {t(`Enums.ServiceType.${item.serviceType}`)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-300 text-gray-700 rounded-md">
              <i className="fas fa-building text-xs flex-shrink-0"></i>
              <span className="text-xs font-medium whitespace-nowrap">
                {t(`Enums.BuildingType.${item.buildingType}`)}
              </span>
            </div>
          </div>
        )}

        <ExsitingMaterialRequestModal
          isOpen={showAddToExistingModal}
          onClose={() => setShowAddToExistingModal(false)}
          materialID={item.materialID}
        />
        {/* Action Buttons */}
        {item.type === 'material' && (
          <div className="space-y-2">
            <button
              onClick={(e) => handleAddNewMaterialRequest(e, item.materialID)}
              className="w-full py-2.5 border-2 border-black text-black font-bold text-sm bg-white  hover:border-orange-500 hover:text-orange-500"
            >
              {t('BUTTON.AddNewRequest')}
            </button>

            <button
              onClick={(e) => handleAddExistingMaterialRequest(e)}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors duration-200"
            >
              {t('BUTTON.AddToExisting')}
            </button>
          </div>
        )}

        {item.type === 'service' && (
          <button
            onClick={(e) => handleAddNewServiceRequest(e, item)}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors duration-200"
          >
            {t('BUTTON.AddNewRequest')}
          </button>
        )}
      </div>
    </div>
  );
}

CardItem.propTypes = {
  item: PropTypes.shape({
    type: PropTypes.string.isRequired,
    materialID: PropTypes.string,
    name: PropTypes.string.isRequired,
    nameEN: PropTypes.string,
    categoryName: PropTypes.string,
    categoryNameEN: PropTypes.string,
    brandName: PropTypes.string,
    brandNameEN: PropTypes.string,
    serviceID: PropTypes.string,
    serviceType: PropTypes.string,
    buildingType: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};
