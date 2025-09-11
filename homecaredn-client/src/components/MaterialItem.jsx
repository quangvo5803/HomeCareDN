import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export default function MaterialItem({ item }) {
    const { t, i18n } = useTranslation();

    return (
        <article
            key={item.materialID}
            className="flex flex-col h-full overflow-hidden transition border border-gray-300 shadow-sm group bg-gray-50 rounded-xl hover:shadow-md"
        >
            {/* Ảnh */}
            <div className="relative flex items-center justify-center overflow-hidden bg-gray-100 h-72">
                <img
                    src={item.imageUrls}
                    alt={item.name}
                    className="object-contain max-w-full max-h-full"
                />
            </div>

            {/* Nội dung */}
            <div className="flex flex-col flex-grow p-5 text-center transition-colors duration-300 group-hover:bg-orange-400 group-hover:text-white">
                <h5 className="mb-2 text-lg font-semibold">
                    {i18n.language === "vi" ? item.name : item.nameEN || item.name}
                </h5>

                <p className="mb-4 text-gray-600 group-hover:text-white min-h-[3rem]">
                    {i18n.language === "vi"
                        ? item.description
                            ? `${item.description.slice(0, 100)}...`
                            : null
                        : item.descriptionEN || item.description
                            ? `${(item.descriptionEN || item.description).slice(0, 100)}...`
                            : null}
                </p>

                {/* Đẩy nút xuống cuối để các card ngang bằng */}
                <div className="mt-auto">
                    <a
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 underline-offset-4 decoration-orange-400 hover:decoration-white group-hover:text-white"
                        aria-label={`${t("home.fact_read_more")} ${item.materialID}`}
                    >
                        {t("home.fact_read_more")}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M13.172 12 9.88 8.707l1.415-1.414L16 12l-4.707 4.707-1.414-1.414z" />
                        </svg>
                    </a>
                </div>
            </div>
        </article>

    );
}

MaterialItem.propTypes = {
    item: PropTypes.shape({
        materialID: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        nameEN: PropTypes.string,
        description: PropTypes.string,
        descriptionEN: PropTypes.string,
        imageUrls: PropTypes.string,
    }).isRequired,
};
