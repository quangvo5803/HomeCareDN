import { useState, useRef, useEffect } from "react";
import { useEnums } from "../hook/useEnums";
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function FilterService({
    title,
    options = [],
    name,
    selectedValue,
    onChange,
    isSort = false,
    sortValue,
    sortOptions = [],
    onSortChange
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <div ref={wrapperRef} className="relative inline-block">

            {/* BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 
                           bg-white border border-gray-300 hover:bg-gray-50 rounded-full w-full"
            >
                <span className="truncate">
                    {title}:{" "}
                    {!isSort
                        ? selectedValue
                            ? t(`Enums.${name}.${selectedValue}`)
                            : t("common.All")
                        : sortOptions.find(s => s.value === sortValue)?.label
                    }
                </span>

                {!isSort && selectedValue && (
                    <i
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                        }}
                        className="fas fa-times text-xs text-gray-600 hover:text-gray-900"
                    ></i>
                )}

                <i
                    className={`fas fa-chevron-down text-xs text-gray-600 transition-transform ${open ? "rotate-180" : ""
                        }`}
                ></i>
            </button>

            {open && (
                <div className="absolute top-full mt-2 left-0 bg-white border shadow-lg z-20 min-w-[200px]">
                    <div className="py-2">

                        {isSort ? (
                            // SORT LIST
                            sortOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        onSortChange(opt.value);
                                        setOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left flex justify-between ${sortValue === opt.value ? "font-bold" : ""}`}
                                >
                                    {opt.label}
                                    {sortValue === opt.value && <i className="fas fa-check"></i>}
                                </button>
                            ))
                        ) : (
                            // FILTER LIST
                            <>
                                <button
                                    onClick={() => {
                                        onChange(null);
                                        setOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${!selectedValue ? "font-semibold" : ""}`}
                                >
                                    {t("common.All")}
                                </button>

                                {options.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedValue === opt.value ? "font-semibold" : ""}`}
                                    >
                                        {t(`Enums.${name}.${opt.value}`)}
                                    </button>
                                ))}
                            </>
                        )}

                    </div>
                </div>
            )}

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
    showSortDropdown,
    showCategoryDropdown,
    showBrandDropdown,
    setShowSortDropdown,
    setShowCategoryDropdown,
    setShowBrandDropdown,
    sortOption,
    setSortOption,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    brands,
    selectedBrandId,
    setSelectedBrandId,
    getSortLabel,
    getCategoryLabel,
    getBrandLabel,
    hasActiveFilters,
    resetAllFilters,
    setCurrentPage,

}) {
    const enums = useEnums();
    const { t, i18n } = useTranslation();

    if (itemType.type === 'service') {
        const filterService = [
            {
                key: "sort",
                title: t("common.sort"),
                isSort: true,
                sortValue: sortOption,
                sortOptions: [
                    { value: "random", label: t("home.default") },
                    {
                        value: i18n.language === "vi" ? "servicename" : "servicenameen",
                        label: "A → Z"
                    },
                    {
                        value:
                            i18n.language === "vi"
                                ? "servicename_desc"
                                : "servicenameen_desc",
                        label: "Z → A"
                    }
                ],
                onSortChange: (v) => {
                    setSortOption(v);
                    setCurrentPage(1);
                }
            },
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
            <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="mb-3 flex flex-wrap gap-3">
                    {filterService.map((fs) => (
                        <FilterService
                            key={fs.key}
                            title={fs.title}
                            name={fs.name}
                            options={fs.options}
                            selectedValue={fs.selectedValue}
                            onChange={fs.onChange}
                            isSort={fs.isSort}
                            sortValue={fs.sortValue}
                            sortOptions={fs.sortOptions}
                            onSortChange={fs.onSortChange}
                        />
                    ))}

                </div>
                {/* Active Tags */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={resetAllFilters}
                            className="text-sm text-gray-900 hover:text-gray-600 underline font-medium"
                        >
                            {t("common.resetFilter")}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    //Filter Material
    if (itemType.type === 'material') {
        return (
            <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex flex-wrap gap-3 mb-3">
                    {/* Sort Filter */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowSortDropdown(!showSortDropdown);
                                setShowCategoryDropdown(false);
                                setShowBrandDropdown(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-full"
                        >
                            <span>
                                {t("common.sort")} {getSortLabel()}
                            </span>
                            <i
                                className={`fas fa-chevron-down text-xs text-gray-600 transition-transform ${showSortDropdown ? "rotate-180" : ""
                                    }`}
                            ></i>
                        </button>

                        {showSortDropdown && (
                            <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setSortOption("random");
                                            setCurrentPage(1);
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortOption === "random" ? "font-semibold" : ""
                                            }`}
                                    >
                                        {t("home.default")}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSortOption(
                                                i18n.language === "vi"
                                                    ? "materialname"
                                                    : "materialnameen"
                                            );
                                            setCurrentPage(1);
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortOption === "materialname" ||
                                            sortOption === "materialnameen"
                                            ? "font-semibold"
                                            : ""
                                            }`}
                                    >
                                        A-Z
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSortOption(
                                                i18n.language === "vi"
                                                    ? "materialname_desc"
                                                    : "materialnameen_desc"
                                            );
                                            setCurrentPage(1);
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortOption === "materialname_desc" ||
                                            sortOption === "materialnameen_desc"
                                            ? "font-semibold"
                                            : ""
                                            }`}
                                    >
                                        Z-A
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowCategoryDropdown(!showCategoryDropdown);
                                setShowSortDropdown(false);
                                setShowBrandDropdown(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-full"
                        >
                            <span>{t("common.category")}</span>
                            <i
                                className={`fas fa-chevron-down text-xs text-gray-600 transition-transform ${showCategoryDropdown ? "rotate-180" : ""
                                    }`}
                            ></i>
                        </button>

                        {showCategoryDropdown && (
                            <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setSelectedCategoryId("");
                                            setCurrentPage(1);
                                            setShowCategoryDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedCategoryId ? "" : "font-semibold"
                                            }`}
                                    >
                                        {t("common.All")}
                                    </button>

                                    {categories.map((category) => (
                                        <button
                                            key={category.categoryID}
                                            onClick={() => {
                                                setSelectedCategoryId(category.categoryID);
                                                setCurrentPage(1);
                                                setShowCategoryDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedCategoryId === category.categoryID
                                                ? "font-semibold"
                                                : ""
                                                }`}
                                        >
                                            {i18n.language === "vi"
                                                ? category.categoryName
                                                : category.categoryNameEN || category.categoryName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Brand Filter */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowBrandDropdown(!showBrandDropdown);
                                setShowSortDropdown(false);
                                setShowCategoryDropdown(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-full"
                        >
                            <span>{t("common.brand")}</span>
                            <i
                                className={`fas fa-chevron-down text-xs text-gray-600 transition-transform ${showBrandDropdown ? "rotate-180" : ""
                                    }`}
                            ></i>
                        </button>

                        {showBrandDropdown && (
                            <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setSelectedBrandId("");
                                            setCurrentPage(1);
                                            setShowBrandDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedBrandId ? "" : "font-semibold"
                                            }`}
                                    >
                                        {t("common.All")}
                                    </button>

                                    {brands.map((brand) => (
                                        <button
                                            key={brand.brandID}
                                            onClick={() => {
                                                setSelectedBrandId(brand.brandID);
                                                setCurrentPage(1);
                                                setShowBrandDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedBrandId === brand.brandID
                                                ? "font-semibold"
                                                : ""
                                                }`}
                                        >
                                            {i18n.language === "vi"
                                                ? brand.brandName
                                                : brand.brandNameEN || brand.brandName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Tags */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedCategoryId && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-900 rounded-full text-sm">
                                <span className="font-medium">
                                    {t("common.category")}: {getCategoryLabel()}
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedCategoryId("");
                                        setCurrentPage(1);
                                    }}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <i className="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        )}

                        {selectedBrandId && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-900 rounded-full text-sm">
                                <span className="font-medium">
                                    {t("common.brand")}: {getBrandLabel()}
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedBrandId("");
                                        setCurrentPage(1);
                                    }}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <i className="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        )}

                        <button
                            onClick={resetAllFilters}
                            className="text-sm text-gray-900 hover:text-gray-600 underline font-medium"
                        >
                            {t("common.resetFilter")}
                        </button>
                    </div>
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

};


