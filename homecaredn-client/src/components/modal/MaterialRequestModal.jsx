import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { publicService } from '../../services/publicService';
import { Pagination } from 'antd';
import { handleApiError } from '../../utils/handleApiError';
import { toast } from 'react-toastify';
import LoadingModal from './LoadingModal';
import PropTypes from 'prop-types';

export default function MaterialRequestModal({ isOpen, onClose, onSelect }) {
  const [modalLoading, setModalLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        setModalLoading(true);
        const data = await publicService.material.getAllMaterial({
          PageNumber: currentPage,
          PageSize: pageSize,
          Search: debouncedSearch || null,
        });
        setMaterials(data.items || []);
        setTotalMaterials(data.totalCount || 0);
      } catch (err) {
        toast.error(handleApiError(err));
      } finally {
        setModalLoading(false);
      }
    };
    fetchData();
  }, [isOpen, currentPage, debouncedSearch]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (!isOpen) return null;
  const renderContent = () => {
    if (modalLoading)
      return (
        <div className="flex justify-center py-12">
          <LoadingModal />
        </div>
      );
    if (materials.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-500 py-8 space-y-2 min-h-[300px]">
          <i className="fas fa-box-open text-5xl"></i>
          <p className="text-xl mt-3">Không có vật liệu</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {materials.map((m) => (
          <button
            key={m.materialID}
            onClick={() => onSelect?.(m)}
            className="border rounded-lg p-4 text-left hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 w-full"
          >
            <div className="flex flex-col space-y-2">
              <span
                className="font-medium text-gray-800 truncate"
                title={m.materialName}
              >
                {m.materialName}
              </span>
              <span className="text-gray-500 text-sm">
                #{m.materialID.slice(0, 8)}
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Overlay */}
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black opacity-40"
        aria-label="Close modal"
        type="button"
        style={{ all: 'unset' }}
      ></button>

      {/* Modal content - Tăng kích thước modal */}
      <div className="relative bg-white w-full max-w-5xl rounded-lg shadow-lg p-6 z-50 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Chọn vật liệu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring focus:outline-none"
          placeholder="Tìm kiếm vật liệu..."
          value={search}
          onChange={handleSearch}
        />

        {/* Material Grid - 4 items per row */}
        <div className="flex-1 overflow-y-auto mb-4">{renderContent()}</div>

        {/* Pagination */}
        <div className="flex justify-center pt-4 border-t">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalMaterials}
            onChange={setCurrentPage}
            showSizeChanger={false}
            size="default"
          />
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
