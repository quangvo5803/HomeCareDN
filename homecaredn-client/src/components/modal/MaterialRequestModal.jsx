import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Pagination } from 'antd';
import PropTypes from 'prop-types';
import LoadingComponent from '../LoadingComponent';
import { useTranslation } from 'react-i18next';
import { useMaterial } from '../../hook/useMaterial';

export default function MaterialRequestModal({ isOpen, onClose, onSelect, excludedMaterialIDs = [] }) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const pageSize = 12;
  const { materials, totalMaterials, loading, fetchMaterials } = useMaterial();
  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      await fetchMaterials({
        PageNumber: currentPage,
        PageSize: pageSize,
        Search: debouncedSearch || null,
      });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentPage, debouncedSearch]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setCurrentPage(1);
      setSelectedMaterials([]);
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // toggle chọn nhiều
  const handleToggleMaterial = (material) => {
    setSelectedMaterials((prev) => {
      const exists = prev.some((m) => m.materialID === material.materialID);
      if (exists) {
        return prev.filter((m) => m.materialID !== material.materialID);
      } else {
        return [...prev, material];
      }
    });
  };

  const handleAdd = () => {
    if (selectedMaterials.length > 0) {
      onSelect?.(selectedMaterials);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  const filteredMaterials = materials.filter(
    (m) => !excludedMaterialIDs.includes(m.materialID)
  );

  const renderContent = () => {
    if (loading) return <LoadingComponent />;

    if (filteredMaterials.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-500 py-16 space-y-4 min-h-[400px]">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <i className="fas fa-box-open text-4xl text-gray-400"></i>
          </div>
          <div className="text-center">
            <p className="text-xl font-medium text-gray-700 mb-1">
              {t('ModalPopup.MaterialRequestModal.noMaterials')}
            </p>
            {search && (
              <p className="text-sm text-gray-500">
                {t('ModalPopup.MaterialRequestModal.noResults', { search })}
              </p>
            )}
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('ModalPopup.MaterialRequestModal.clearSearch')}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMaterials.map((m) => {
          const isSelected = selectedMaterials.some(
            (item) => item.materialID === m.materialID
          );
          const imageUrl = m.imageUrls?.[0];
          const displayName = i18n.language == 'vi' ? m.name : m.nameEN;
          const displayCategory =
            i18n.language == 'vi' ? m.categoryName : m.categoryNameEN;
          const displayBrand =
            i18n.language == 'vi' ? m.brandName : m.brandNameEN;
          const displayUnit = i18n.language == 'vi' ? m.unit : m.unitEN;

          return (
            <button
              key={m.materialID}
              onClick={() => handleToggleMaterial(m)}
              className={`border-2 rounded-lg p-3 text-left hover:shadow-lg transition-all duration-200 w-full group ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${imageUrl ? 'hidden' : 'flex'
                    }`}
                >
                  <i className="fas fa-image text-3xl text-gray-300"></i>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                    <i className="fas fa-check text-sm"></i>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3
                  className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]"
                  title={displayName}
                >
                  {displayName}
                </h3>

                <div className="space-y-1.5">
                  {displayCategory && (
                    <div className="flex items-start text-xs text-gray-600">
                      <i className="fas fa-tags text-gray-400 mr-2 mt-0.5 flex-shrink-0"></i>
                      <span className="truncate" title={displayCategory}>
                        {displayCategory}
                      </span>
                    </div>
                  )}

                  {displayBrand && (
                    <div className="flex items-start text-xs text-gray-600">
                      <i className="fas fa-star text-gray-400 mr-2 mt-0.5 flex-shrink-0"></i>
                      <span className="truncate" title={displayBrand}>
                        {displayBrand}
                      </span>
                    </div>
                  )}

                  {displayUnit && (
                    <div className="flex items-start text-xs text-gray-600">
                      <i className="fas fa-box text-gray-400 mr-2 mt-0.5 flex-shrink-0"></i>
                      <span className="truncate" title={displayUnit}>
                        {displayUnit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
    >
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        type="button"
      />

      <div className="relative bg-white w-full max-w-6xl rounded-xl shadow-2xl z-50 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('ModalPopup.MaterialRequestModal.title')}
            </h2>
            {totalMaterials > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {t('ModalPopup.MaterialRequestModal.found', {
                  count: totalMaterials,
                })}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 pb-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg pl-11 pr-10 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder={t(
                'ModalPopup.MaterialRequestModal.searchPlaceholder'
              )}
              value={search}
              onChange={handleSearch}
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          {/* Pagination */}
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalMaterials}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />

          {/* Right side: selected count + Add button */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {t('ModalPopup.MaterialRequestModal.selectedCount', {
                count: selectedMaterials.length,
              })}
            </p>

            <button
              disabled={selectedMaterials.length === 0}
              onClick={handleAdd}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${selectedMaterials.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
            >
              {t('BUTTON.Add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

MaterialRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
};
