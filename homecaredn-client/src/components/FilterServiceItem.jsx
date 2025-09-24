import { useState } from "react";
import { useEnums } from "../hook/useEnums";
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function FilterSection({ title, options, names, selectedValue, onChange }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { t } = useTranslation();

    return (
        <div className="w-75 border border-gray-200 rounded-lg p-4 mb-4">
            <button
                type="button"
                className="w-full text-left p-0 border-none bg-transparent outline-none relative flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="font-medium text-lg">{title}</h2>

                <div className="flex items-center space-x-3">
                    {/* icon X */}
                    {selectedValue && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                            <i className="fa-solid fa-xmark mr-3"></i>
                        </button>
                    )}

                    {/* Nút toggle */}
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-600 hover:text-gray-800 transition-transform"
                    >
                        <i
                            className={`fas fa-chevron-down transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                                }`}
                        ></i>
                    </button>
                </div>
            </button>

            {/* Nội dung */}
            {isExpanded && (
                <div className="max-h-48 overflow-y-auto pr-2 mt-4">
                    <ul className="space-y-2">
                        {options.map((item) => (
                            <li key={item.value} className="flex items-center relative">
                                <input
                                    id={`${title}-${item.value}`}
                                    type="radio"
                                    name={names}
                                    value={item.value}
                                    checked={selectedValue === item.value}
                                    onChange={(e) => onChange(e.target.value)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label
                                    htmlFor={`${title}-${item.value}`}
                                    className="ml-2 text-sm text-gray-700"
                                >
                                    {t(`Enums.${names}.${item.value}`)}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
FilterSection.propTypes = {
    title: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
        })
    ).isRequired,
    names: PropTypes.string.isRequired,
    selectedValue: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default function FilterItem({
    packageOption,
    buildingType,
    mainStructure,
    designStyle,
    onPackageOptionChange,
    onBuildingTypeChange,
    onMainStructureTypeChange,
    onDesignStyleChange,
}) {
    const enums = useEnums();
    const { t } = useTranslation();

    const filters = [
        {
            key: "packageOption",
            title: t("sharedEnums.packageOption"),
            names: "PackageOption",
            options: enums?.packageOptions || [],
            selectedValue: packageOption,
            onChange: onPackageOptionChange,
        },
        {
            key: "buildingType",
            title: t("sharedEnums.buildingType"),
            names: "BuildingType",
            options: enums?.buildingTypes || [],
            selectedValue: buildingType,
            onChange: onBuildingTypeChange,
        },
        {
            key: "mainStructure",
            title: t("sharedEnums.mainStructure"),
            names: "MainStructure",
            options: enums?.mainStructures || [],
            selectedValue: mainStructure,
            onChange: onMainStructureTypeChange,
        },
        {
            key: "designStyle",
            title: t("sharedEnums.designStyle"),
            names: "DesignStyle",
            options: enums?.designStyles || [],
            selectedValue: designStyle,
            onChange: onDesignStyleChange,
        },
    ];

    return (
        <div className="lg:col-span-1 w-75 mt-20">
            {filters.map((f) => (
                <FilterSection
                    key={f.key}
                    title={f.title}
                    names={f.names}
                    options={f.options}
                    selectedValue={f.selectedValue}
                    onChange={f.onChange}
                />
            ))}
        </div>
    );
}
FilterItem.propTypes = {
    packageOption: PropTypes.string,
    buildingType: PropTypes.string,
    mainStructure: PropTypes.string,
    designStyle: PropTypes.string,
    onPackageOptionChange: PropTypes.func.isRequired,
    onBuildingTypeChange: PropTypes.func.isRequired,
    onMainStructureTypeChange: PropTypes.func.isRequired,
    onDesignStyleChange: PropTypes.func.isRequired,
};


