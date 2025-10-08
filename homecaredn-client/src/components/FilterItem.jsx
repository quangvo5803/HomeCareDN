import { useState } from "react";
import { useEnums } from "../hook/useEnums";
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function FilterService({ title, options, name, selectedValue, onChange }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { t } = useTranslation();

    return (
        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white hover:border-gray-300 transition-colors">
            <button
                type="button"
                className="w-full flex items-center justify-between group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="font-semibold text-base md:text-lg text-gray-800">{title}</h2>

                <div className="flex items-center gap-2">
                    {/* Clear button */}
                    {selectedValue && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            aria-label="Clear selection"
                        >
                            <i className="fa-solid fa-xmark text-sm"></i>
                        </button>
                    )}

                    {/* Toggle button */}
                    <i
                        className={`fas fa-chevron-down text-gray-500 group-hover:text-gray-700 transition-all duration-300 text-sm ${isExpanded ? "rotate-180" : ""
                            }`}
                    ></i>
                </div>
            </button>


            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-60 mt-4 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="max-h-52 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <ul className="space-y-3">
                        {options.map((item) => (
                            <li key={item.value}>
                                <label
                                    htmlFor={`${title}-${item.value}`}
                                    className="flex items-center cursor-pointer group/item hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded transition-colors"
                                >
                                    <input
                                        id={`${title}-${item.value}`}
                                        type="radio"
                                        name={name}
                                        value={item.value}
                                        checked={selectedValue === item.value}
                                        onChange={(e) => onChange(e.target.value)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="ml-3 text-sm text-gray-700 group-item/hover:text-gray-900">
                                        {t(`Enums.${name}.${item.value}`)}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
FilterService.propTypes = {
    title: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
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
    //Material
    itemType,
    label,
    options,
    selectedValue,
    onChange,
    name,
    nameEN,
    valueID,

}) {
    const enums = useEnums();
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    if (itemType.type === 'service') {
        const filterService = [
            {
                key: "packageOption",
                title: t("sharedEnums.packageOption"),
                name: "PackageOption",
                options: enums?.packageOptions || [],
                selectedValue: packageOption,
                onChange: onPackageOptionChange,
            },
            {
                key: "buildingType",
                title: t("sharedEnums.buildingType"),
                name: "BuildingType",
                options: enums?.buildingTypes || [],
                selectedValue: buildingType,
                onChange: onBuildingTypeChange,
            },
            {
                key: "mainStructure",
                title: t("sharedEnums.mainStructure"),
                name: "MainStructure",
                options: enums?.mainStructures || [],
                selectedValue: mainStructure,
                onChange: onMainStructureTypeChange,
            },
            {
                key: "designStyle",
                title: t("sharedEnums.designStyle"),
                name: "DesignStyle",
                options: enums?.designStyles || [],
                selectedValue: designStyle,
                onChange: onDesignStyleChange,
            },
        ];

        return (
            <div className="lg:col-span-1 w-75 mt-20">
                {filterService.map((fs) => (
                    <FilterService
                        key={fs.key}
                        title={fs.title}
                        name={fs.name}
                        options={fs.options}
                        selectedValue={fs.selectedValue}
                        onChange={fs.onChange}
                    />
                ))}
            </div>
        );
    }

    //Filter Material
    if (itemType.type === 'material') {
        return (
            <div className="relative w-full">
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 pr-10 border rounded-lg text-left transition-all ${selectedValue
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                    <span className="text-sm md:text-base font-medium truncate">
                        {selectedValue
                            ? (() => {
                                const op = options?.find(op => op[valueID] === selectedValue);
                                return op?.[i18n.language === 'vi' ? name : nameEN || name];
                            })()
                            : label}
                    </span>
                </button>

                {selectedValue && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors z-20"
                        aria-label="Clear selection"
                    >
                        <i className="fa-solid fa-xmark text-base"></i>
                    </button>
                )}

                {/* Icon dropdown */}
                {!selectedValue && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <i
                            className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </div>
                )}

                {/* Dropdown Menu */}
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            role="button"
                            tabIndex={0}
                            onClick={() => setIsOpen(false)}
                            onKeyDown={(e) => e.key === "Enter" || e.key === " " ? setIsOpen(false) : null}
                        />

                        {/* Options */}
                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {options?.map((op) => (
                                <button
                                    key={op[valueID]}
                                    type="button"
                                    onClick={() => {
                                        onChange(op[valueID]);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedValue === op[valueID]
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    {i18n.language === 'vi' ? op[name] : op[nameEN] || op[name]}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

        );
    }
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
    //material
    itemType: PropTypes.object.isRequired,
    label: PropTypes.string,
    options: PropTypes.array,
    selectedValue: PropTypes.string,
    onChange: PropTypes.func,
    name: PropTypes.string,
    valueID: PropTypes.string,
    nameEN: PropTypes.string,
};


