import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function CardItem({ item }) {
  const { t, i18n } = useTranslation();

  return (
    <Link
      to={
        item.type === 'material'
          ? `/MaterialDetail/${item.materialID}`
          : item.type === 'service'
            ? `/ServiceDetail/${item.serviceID}`
            : '#'
      }
      className="flex flex-col h-full overflow-hidden transition-all duration-300 border border-gray-300 shadow-sm group bg-gray-50 rounded-xl hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Ảnh */}
      <div className="relative flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-100 h-72">
        <img
          src={
            item.imageUrls?.[0]
            || "https://res.cloudinary.com/dl4idg6ey/image/upload/v1758524975/no_img_nflf9h.jpg"
          }
          alt={item.name || "No image"}
          className={`object-contain duration-300 group-hover:scale-110
            ${item.type === "material" ? "max-w-[250px] max-h-[250px]" : ""}
            ${item.type === "service" ? "max-w-[350px] max-h-[360px]" : ""}
          `}
        />
      </div>

      {/* Nội dung */}
      <div className="flex flex-col flex-grow p-5 text-center transition-colors duration-300 group-hover:bg-orange-400 group-hover:text-white">
        {/* Tiêu đề với chiều cao cố định */}
        <div className="mb-2">
          <h5 className="text-lg font-semibold leading-tight text-center break-words hyphens-auto">
            {i18n.language === 'vi' ? item.name : item.nameEN || item.name}
          </h5>
        </div>

        {/* Spacer để đẩy buttons xuống dưới */}
        <div className="flex-grow"></div>

        {/* Nếu là Material */}
        {item.type === 'material' && (
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="flex items-center gap-1 w-[110px] h-10 justify-center rounded-xl text-sm font-bold text-white shadow-lg bg-blue-600 px-2">
              <i className="flex-shrink-0 fas fa-tags"></i>
              <span className="text-xs truncate">
                {i18n.language === 'vi'
                  ? item.categoryName
                  : item.categoryNameEN || item.categoryName}
              </span>
            </span>

            <span className="flex items-center gap-1 w-[110px] h-10 justify-center rounded-xl text-sm font-bold text-white shadow-lg bg-orange-600 px-2">
              <i className="flex-shrink-0 fas fa-star"></i>
              <span className="text-xs truncate">
                {i18n.language === 'vi'
                  ? item.brandName
                  : item.brandNameEN || item.brandName}
              </span>
            </span>
          </div>
        )}

        {/* Nếu là Service */}
        {item.type === 'service' && (
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="flex items-center gap-1 w-[110px] h-10 justify-center rounded-xl text-sm font-bold text-white shadow-lg bg-blue-600 px-2">
              <i className="flex-shrink-0 fas fa-tools"></i>
              <span className="text-xs truncate">
                {t(`Enums.ServiceType.${item.serviceType}`)}
              </span>
            </span>

            <span className="flex items-center gap-1 w-[110px] h-10 justify-center rounded-xl text-sm font-bold text-white shadow-lg bg-orange-600 px-2">
              <i className="flex-shrink-0 fas fa-building"></i>
              <span className="text-xs truncate">
                {t(`Enums.BuildingType.${item.buildingType}`)}
              </span>
            </span>
          </div>
        )}

        {/* Read More Button với chiều cao cố định */}
        <div className="flex items-center justify-center h-8 mt-3">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 underline-offset-4 decoration-orange-400 hover:decoration-white group-hover:text-white">
            {t('BUTTON.ReadMore')}
            <i class="mr-2 fa-solid fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </Link>
  );
}

CardItem.propTypes = {
  item: PropTypes.shape({
    type: PropTypes.string.isRequired,
    // Material
    materialID: PropTypes.string,
    name: PropTypes.string.isRequired,
    nameEN: PropTypes.string,
    categoryName: PropTypes.string,
    categoryNameEN: PropTypes.string,
    brandName: PropTypes.string,
    brandNameEN: PropTypes.string,
    // Service
    serviceID: PropTypes.string,
    serviceType: PropTypes.string,
    buildingType: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};
