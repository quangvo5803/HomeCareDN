import { useState, useEffect } from "react";
import { Pagination } from "antd";
import Avatar from "react-avatar";
import { formatVND } from "../../utils/formatters";
import { useUser } from '../../hook/useUser';
import { useParams, useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";

export default function AdminUserDetail() {

    const { getUserById } = useUser();
    const navigate = useNavigate();
    const [userDetail, setUserDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const { userID } = useParams();

    useEffect(() => {
        const fetchUserById = async () => {
            try {
                if (!userID) return;
                const data = await getUserById(userID);
                setUserDetail(data);
            } catch (err) {
                console.error("Lỗi lấy user:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserById();
    }, [getUserById, userID]);


    if (loading) {
        return <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>;
    }

    if (!userDetail) {
        return <div className="text-center py-10 text-red-500">Không tìm thấy người dùng.</div>;
    }
    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen rounded-3xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-6 rounded-3xl mb-3">
                <div className="mx-auto flex items-center gap-4">
                    <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer"
                        onClick={() => navigate('/Admin/UserManager')}
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <h1 className="text-2xl font-bold">{userDetail.fullName}</h1>
                </div>
            </div>

            {/* Top Section */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6 mb-6 max-w-5xl mx-auto">
                <Avatar
                    name={userDetail.fullName}
                    size="100"
                    round
                    color="#FB8C00"
                    fgColor="#FFF"
                    className="shadow-md"
                />
                <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center">
                    {/* Cột trái: thông tin cơ bản */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-800">{userDetail.fullName}</h2>
                        <p className="text-gray-600">
                            <i className="fa-solid fa-envelope text-orange-500 mr-2"></i>
                            {userDetail.email}
                        </p>
                        <p className="text-gray-600">
                            <i className="fa-solid fa-phone text-orange-500 mr-2"></i>
                            {userDetail.phoneNumber}
                        </p>
                        <div className="text-gray-600">
                            {userDetail.address && userDetail.address.length > 0 ? (
                                <div className="space-y-1">
                                    {userDetail.address.slice(0, 3).map((addr) => (
                                        <div key={addr.id} className="flex items-start">
                                            <i className="fa-solid fa-location-dot text-orange-500 mr-2 mt-1"></i>
                                            <span>
                                                {addr.detail}, {addr.district}, {addr.city}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <i className="fa-solid fa-location-dot text-gray-400 mr-2"></i>
                                    <span>Chưa có địa chỉ</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cột phải: rating & project count */}
                    {userDetail.contractorApplications.length > 0 && (
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center min-w-[110px]">
                                <p className="text-yellow-600 text-sm font-medium">Đánh giá</p>
                                <p className="text-lg font-bold text-yellow-700 flex items-center justify-center gap-1">
                                    <i className="fa-solid fa-star"></i>
                                    {userDetail.averageRating}
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center min-w-[110px]">
                                <p className="text-blue-600 text-sm font-medium">Dự án đã nhận</p>
                                <p className="text-lg font-bold text-blue-700">
                                    {userDetail.projectCount}
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-white rounded-2xl shadow-md p-6 max-w-5xl mx-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {userDetail.serviceRequests.length > 0
                        ? "Lịch sử yêu cầu dịch vụ"
                        : "Lịch sử Apply công việc"}
                </h3>

                {userDetail.serviceRequests.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <i className="fa-solid fa-inbox text-4xl mb-2"></i>
                        <p>Chưa có lịch sử nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {userDetail.serviceRequests.map((item) => (
                            <div
                                key={item.id}
                                className="border rounded-xl p-4 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {item.title || item.customerEmail}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                    <p className="text-emerald-600 font-semibold">
                                        {formatVND(item.estimatePrice)}
                                    </p>
                                </div>
                                <p className="text-sm mt-1 text-gray-500">
                                    Trạng thái:{" "}
                                    <span className="font-medium text-gray-700">
                                        <StatusBadge status={item.status} type="Request" />
                                    </span>
                                </p>
                            </div>
                        ))}

                        {userDetail.serviceRequests.length > pageSize && (
                            <div className="flex justify-center pt-4">
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={userDetail.serviceRequests.length}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

