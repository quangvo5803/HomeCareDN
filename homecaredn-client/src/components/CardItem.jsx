import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function CardItem({ item }) {
  const { t, i18n } = useTranslation();

  return (
    <Link
      to={item.type === 'material' ? `/MaterialDetail/${item.materialID}` : '#'}
      className="flex flex-col h-full overflow-hidden transition-all duration-300 border border-gray-300 shadow-sm group bg-gray-50 rounded-xl hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Ảnh  */}
      <div className="relative flex items-center justify-center overflow-hidden bg-gray-100 h-72">
        <img
          src={item.imageUrls?.[0]}
          alt={item.name}
          className="object-contain max-w-[350px] max-h-[200px] duration-300 group-hover:scale-110"
        />
      </div>

      {/* Nội dung */}
      <div className="flex flex-col flex-grow p-5 text-center transition-colors duration-300 group-hover:bg-orange-400 group-hover:text-white">
        <h5 className="mb-2 text-lg font-semibold line-clamp-2 min-h-[56px] flex items-center justify-center">
          {i18n.language === 'vi' ? item.name : item.nameEN || item.name}
        </h5>
        {item.type === 'material' && (
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 min-w-[110px] h-[35px] justify-center rounded-xl text-xs font-bold text-white shadow-lg bg-blue-600 px-3 truncate">
              <i className="fas fa-tags"></i>
              <span className="truncate">
                {i18n.language === 'vi'
                  ? item.categoryName
                  : item.categoryNameEN || item.categoryName}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 min-w-[110px] h-[35px] justify-center rounded-xl text-xs font-bold text-white shadow-lg bg-orange-600 px-3 truncate">
              <i className="fas fa-star"></i>
              <span className="truncate">
                {i18n.language === 'vi'
                  ? item.brandName
                  : item.brandNameEN || item.brandName}
              </span>
            </span>
          </div>
        )}
        <div className="mt-3">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 underline-offset-4 decoration-orange-400 hover:decoration-white group-hover:text-white">
            {t('BUTTON.ReadMore')}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13.172 12 9.88 8.707l1.415-1.414L16 12l-4.707 4.707-1.414-1.414z" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

CardItem.propTypes = {
  item: PropTypes.shape({
    materialID: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    nameEN: PropTypes.string,
    description: PropTypes.string,
    descriptionEN: PropTypes.string,
    imageUrls: PropTypes.string,
    categoryName: PropTypes.string.isRequired,
    categoryNameEN: PropTypes.string,
    brandName: PropTypes.string.isRequired,
    brandNameEN: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
};
