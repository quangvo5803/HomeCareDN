import { useMaterial } from '../hook/useMaterial';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Pagination } from 'antd';
import MaterialItem from '../components/MaterialItem';
export default function MaterialViewAll() {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const {
        materials,
    } = useMaterial();

    // Pagination logic
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentMaterials = materials.slice(indexOfFirstItem, indexOfLastItem);

    //hiển thị kết quả
    const total = materials.length;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);


    return (
        <body className="font-sans text-black bg-white">
            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <div className="flex flex-col mb-6 md:flex-row md:justify-between md:items-center">
                    <h1 className="text-lg font-bold text-orange-400 md:text-xl">Gạch ốp lát</h1>
                    <div className="flex items-center mt-4 space-x-4 md:mt-0">
                        <p className="text-sm md:text-base">Hiển thị {start}–{end} của {total} kết quả</p>
                        <select
                            aria-label="Sort options"
                            className="px-3 py-1 text-sm border border-gray-300 rounded md:text-base"
                        >
                            <option>Mặc định</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col gap-6 md:flex-row">
                    {/* Left sidebar */}
                    <aside className="md:w-1/4">
                        <div className="mb-6">
                            <h2 className="mb-2 text-sm font-bold uppercase md:text-base">
                                Danh mục sản phẩm
                            </h2>
                            <div className="w-12 mb-4 border-b border-gray-300"></div>
                            <ul className="space-y-2 text-sm font-semibold md:text-base">
                                <li className="flex justify-between">
                                    <a className="hover:underline" href="/category/floor-tiles">
                                        Gạch lát nền
                                    </a>
                                    <span className="text-gray-500">(527)</span>
                                </li>
                                <li className="flex justify-between">
                                    <a className="hover:underline" href="/category/wall-tiles">
                                        Gạch ốp tường
                                    </a>
                                    <span className="text-gray-500">(278)</span>
                                </li>
                                <li className="flex justify-between">
                                    <a className="hover:underline" href="/category/decor-tiles">
                                        Gạch trang trí
                                    </a>
                                    <span className="text-gray-500">(7)</span>
                                </li>
                            </ul>

                        </div>
                        <div className="space-y-4">
                            <select
                                aria-label="Brand filter"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded md:text-base"
                            >
                                <option>Bất kỳ Thương Hiệu</option>
                            </select>
                            <select
                                aria-label="Surface filter"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded md:text-base"
                            >
                                <option>Bất kỳ Bề Mặt</option>
                            </select>
                            <select
                                aria-label="Size filter"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded md:text-base"
                            >
                                <option>Bất kỳ Kích Thước</option>
                            </select>
                            <select
                                aria-label="Color filter"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded md:text-base"
                            >
                                <option>Bất kỳ Màu Sắc</option>
                            </select>
                        </div>
                        <div className="mt-8">
                            <h3 className="mb-2 text-sm font-bold uppercase md:text-base">
                                Lọc theo giá
                            </h3>
                            <input
                                type="range"
                                min="0"
                                max="2329200"
                                step="10000"
                                defaultValue="2329200"
                                className="w-full h-1 mt-2 mb-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-orange-400"
                            />
                            <p className="text-xs md:text-sm">
                                Giá: <span>0₫</span> — <span>2.329.200₫</span>
                            </p>
                        </div>
                    </aside>
                    {/* Products grid */}
                    <section className="grid grid-cols-1 gap-6 md:w-3/4 sm:grid-cols-2 lg:grid-cols-3">
                        {materials && materials.length > 0 ? (
                            currentMaterials.map((item, index) => (
                                <>
                                    <MaterialItem key={item.MaterialID} item={item} />

                                    {/*  pagination*/}
                                    {index === currentMaterials.length - 1 && (
                                        <div className="flex justify-center py-4 col-span-full">
                                            <Pagination
                                                current={currentPage}
                                                pageSize={pageSize}
                                                total={materials.length}
                                                onChange={(page) => setCurrentPage(page)}
                                                showSizeChanger={false}
                                                size="small"
                                            />
                                        </div>
                                    )}
                                </>
                            ))
                        ) : (
                            <p className="text-gray-500 col-span-full">{t('common.no_data')}</p>
                        )}
                    </section>


                </div>

            </div >
        </body >
    )
}
