import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from '../../components/Loading';
import { useTranslation } from "react-i18next";
import { useServiceRequest } from "../../hook/useServiceRequest";
import { formatVND } from '../../utils/formatters';

const contractors = [
    {
        name: 'Phan Đình Phúc',
        email: 'abc@gmail.com'
    },
    {
        name: 'Nguyễn Văn A',
        email: 'afgdsas@gmail.com'
    },
    {
        name: 'Nguyễn Văn A',
        email: 'dsas@gmail.com'
    },
    {
        name: 'Nguyễn Văn A',
        email: 'gdsas@gmail.com'
    },
    {
        name: 'Nguyễn Văn A',
        email: 'fgdsas@gmail.com'
    }
];


export default function AdminServiceRequestDetail() {
    const { id } = useParams();
    const { t } = useTranslation();
    const [detail, setDetail] = useState(null);
    const navigate = useNavigate();

    const { getServiceRequestById } = useServiceRequest();

    useEffect(() => {
        const fetchData = async () => {

            const detailServiceRes = await getServiceRequestById(id);
            setDetail(detailServiceRes);
        };
        fetchData();
    }, [id, getServiceRequestById]);

    const icons = {
        Repair: 'fa-drafting-compass',
        Construction: 'fa-hammer',
    };

    if (!detail) return <Loading />;


    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-6 text-white">
                        <div className="flex items-center gap-4">
                            <button
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center backdrop-blur-sm"
                                onClick={() => navigate("/Admin/ServiceRequestManager")}
                            >
                                <i className="fas fa-arrow-left text-white"></i>
                            </button>

                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <i
                                    className={`fas ${icons[detail?.serviceType] || 'fa-wrench'} text-2xl text-white`}
                                />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">{t(`Enums.ServiceType.${detail.serviceType}`)}</h1>
                                <div className="flex items-center gap-4 text-white/90 text-sm mt-1">
                                    <span className="flex items-center gap-1.5">
                                        <i className="far fa-calendar"></i>
                                        {new Date(
                                            detail.createdAt
                                        ).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <i className="fas fa-hashtag"></i>
                                        {detail.serviceRequestID.substring(0, 8)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="p-6">
                        <p className="text-gray-700 leading-relaxed mb-6">
                            {detail.description}
                        </p>


                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <i className="fa-solid fa-star text-orange-600"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('sharedEnums.packageOption')}</p>
                                    <p className="font-semibold text-gray-800">{t(`Enums.PackageOption.${detail.packageOption}`)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-building text-blue-600"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('sharedEnums.buildingType')}</p>
                                    <p className="font-semibold text-gray-800">{t(`Enums.BuildingType.${detail.buildingType}`)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <i className="fa-solid fa-building-columns text-red-600"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('sharedEnums.mainStructure')}</p>
                                    <p className="font-semibold text-gray-800">{t(`Enums.MainStructure.${detail.mainStructureType}`)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                    <i className="fa-solid fa-palette text-pink-500"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('sharedEnums.designStyle')}</p>
                                    <p className="font-semibold text-gray-800">{t(`Enums.DesignStyle.${detail.designStyle}`)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-ruler text-green-600"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('adminServiceRequestManager.acreage')}</p>
                                    <p className="font-semibold text-gray-800">{detail.width}m × {detail.length}m</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-layer-group text-purple-600"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('adminServiceRequestManager.numberOfFloors')}</p>
                                    <p className="font-semibold text-gray-800">{detail.floors}</p>
                                </div>
                            </div>
                        </div>


                        <div className="border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                {/* Địa chỉ */}
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-location-dot text-red-500 mt-1"></i>
                                    <div>
                                        <p className="text-sm text-gray-500">{t('adminServiceRequestManager.address')}</p>
                                        <p className="font-medium">
                                            {detail.address.detail}, {detail.address.ward},{' '}
                                            {detail.address.district}, {detail.address.city}
                                        </p>
                                    </div>
                                </div>

                                {/* Giá */}
                                <div className="flex items-start justify-end gap-3">
                                    <i className="fas fa-money-bill-wave text-emerald-500 mt-1"></i>
                                    <div>
                                        <p className="text-sm text-gray-500">{t('adminServiceRequestManager.estimatePrice')}</p>
                                        <p className="font-semibold text-emerald-600 text-lg">
                                            {formatVND(Number(detail.estimatePrice))}
                                        </p>
                                    </div>
                                </div>



                                {/* Trạng thái */}
                                <div className="flex items-center justify-end">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${detail.isOpen
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-red-500'
                                            }`}
                                    >
                                        <i
                                            className={`fas ${detail.isOpen ? 'fa-check-circle' : 'fa-clock'} mr-1`}
                                        ></i>
                                        {detail.isOpen
                                            ? t('userPage.serviceRequest.label_open')
                                            : t('userPage.serviceRequest.label_close')}
                                    </span>
                                </div>
                            </div>
                        </div>


                        {/* Hình ảnh */}
                        {detail.imageUrls?.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-4">
                                {detail.imageUrls.map((url, i) => (
                                    <div
                                        key={`${url}-${i}`}
                                        className="bg-white rounded-lg border border-gray-200 p-2 flex items-center justify-center w-28 h-28"
                                    >
                                        <img
                                            src={url}
                                            alt={`img-${i}`}
                                            className="max-w-full max-h-full object-contain rounded-md hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-bold text-gray-800">{t('adminServiceRequestManager.listCandidate')}</h3>
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">3 {t('adminServiceRequestManager.totalCandidate')}</span>
                    </div>

                    <div className="space-y-3">
                        {contractors.map((contractor, index) => (
                            <div
                                key={index}
                                className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    contractor.email || 'User'
                                                )}&background=random`}
                                                alt="avatar"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{contractor.name}</p>
                                            <p className="text-sm text-gray-500">{contractor.email}</p>
                                        </div>
                                    </div>
                                    <button className="text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors duration-200 font-medium">
                                        {t('adminServiceRequestManager.viewProfile')} <i className="fa-solid fa-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
