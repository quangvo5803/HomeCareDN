import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceRequestDetail = () => {
  const navigate = useNavigate();
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'contractor', text: 'Xin chào, tôi đã xem yêu cầu của bạn.' },
  ]);
  const [input, setInput] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxType, setLightboxType] = useState('project');

  const serviceRequest = {
    serviceType: 'Xây dựng',
    description:
      'Xây nhà 2 tầng phong cách hiện đại, thiết kế tối ưu ánh sáng tự nhiên, sử dụng vật liệu cao cấp và bền vững. Yêu cầu hoàn thiện nội thất cơ bản bao gồm sơn tường, lát gạch, trần thạch cao và hệ thống điện nước đầy đủ.',
    address: {
      detail: '123 Đường Nguyễn Văn Linh',
      ward: 'Hòa Thuận Tây',
      district: 'Hải Châu',
      city: 'Đà Nẵng',
    },
    width: 6,
    length: 20,
    floors: 2,
    estimatePrice: 850000000,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    ],
    createdDate: '15/03/2024',
    status: 'Đang tìm nhà thầu',
  };

  const contractors = [
    {
      id: 1,
      name: 'Công ty Xây Dựng An Phát',
      bidPrice: 820000000,
      phone: '0905 123 456',
      email: 'anphat@gmail.com',
      rating: 4.8,
      reviewCount: 50,
      completedProjects: 47,
      description:
        'Chuyên xây dựng nhà phố, biệt thự hiện đại với đội ngũ kỹ sư giàu kinh nghiệm.',
      proposalDescription:
        'Chúng tôi đề xuất phương án xây dựng với công nghệ hiện đại, sử dụng vật liệu cao cấp từ Đức và Nhật Bản. Quy trình thi công được giám sát chặt chẽ bởi kỹ sư có chứng chỉ quốc tế. Cam kết hoàn thành đúng tiến độ 6 tháng với bảo hành 5 năm.',
      proposalImages: [
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      ],
    },
    {
      id: 2,
      name: 'Nhà Thầu Minh Quang',
      bidPrice: 870000000,
      phone: '0912 456 789',
      email: 'minhquang@gmail.com',
      rating: 4.9,
      reviewCount: 55,
      completedProjects: 63,
      description:
        'Uy tín hàng đầu trong lĩnh vực xây dựng dân dụng, cam kết chất lượng và tiến độ.',
      proposalDescription:
        'Phương án thi công tối ưu chi phí với vật liệu nội địa chất lượng cao. Đội ngũ thợ lành nghề, kinh nghiệm trên 10 năm. Áp dụng kỹ thuật xây nhanh, tiết kiệm thời gian. Bảo hành công trình 3 năm, hỗ trợ bảo trì trọn đời.',
      proposalImages: [
        'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800&q=80',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80',
      ],
    },
    {
      id: 3,
      name: 'DNTN Hoàng Gia',
      bidPrice: 800000000,
      phone: '0987 111 222',
      email: 'hoanggia@gmail.com',
      rating: 4.5,
      reviewCount: 60,
      completedProjects: 28,
      description:
        'Đơn vị thi công trẻ, năng động với giá cả cạnh tranh và dịch vụ tận tâm.',
      proposalDescription:
        'Chúng tôi cam kết mang đến giải pháp xây dựng thông minh với giá tốt nhất thị trường. Sử dụng công nghệ quản lý dự án hiện đại, minh bạch từng chi phí. Đội ngũ trẻ, nhiệt huyết, sẵn sàng làm việc ngoài giờ để đảm bảo tiến độ.',
      proposalImages: [
        'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
      ],
    },
  ];

  const handleSend = () => {
    if (!input.trim() || !selectedContractor) return;
    const newMsg = { sender: 'user', text: input };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  const openLightbox = (index, type = 'project') => {
    setLightboxType(type);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    if (lightboxType === 'project') {
      setLightboxIndex((prev) => (prev + 1) % serviceRequest.images.length);
    } else {
      setLightboxIndex(
        (prev) => (prev + 1) % selectedContractor.proposalImages.length
      );
    }
  };

  const prevImage = () => {
    if (lightboxType === 'project') {
      setLightboxIndex((prev) =>
        prev === 0 ? serviceRequest.images.length - 1 : prev - 1
      );
    } else {
      setLightboxIndex((prev) =>
        prev === 0 ? selectedContractor.proposalImages.length - 1 : prev - 1
      );
    }
  };

  const getCurrentImages = () => {
    return lightboxType === 'project'
      ? serviceRequest.images
      : selectedContractor.proposalImages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b shadow-md">
        <button
          onClick={() =>
            navigate('/Customer/Profile', {
              state: { tab: 'service_requests' },
            })
          }
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
        >
          <i className="fas fa-arrow-left"></i>
          <span className="font-medium">Quay lại</span>
        </button>
        <h1 className="text-2xl font-bold text-orange-600">
          Chi tiết yêu cầu dịch vụ
        </h1>
        <div className="w-24"></div>
      </div>

      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        <div className="w-2/3 space-y-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <i className="fas fa-hard-hat text-orange-600 text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {serviceRequest.serviceType}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Mã YC: #SR{Math.floor(Math.random() * 10000)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    <i className="fas fa-clock mr-1"></i>
                    {serviceRequest.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <i className="fas fa-calendar-plus text-green-600 text-lg"></i>
                  <div>
                    <p className="text-xs text-gray-500">Ngày tạo</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {serviceRequest.createdDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-align-left text-orange-500 text-lg"></i>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Mô tả chi tiết
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed pl-7">
                  {serviceRequest.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-location-dot text-orange-500 text-lg"></i>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Địa chỉ thi công
                  </h3>
                </div>
                <p className="text-gray-700 pl-7">
                  {`${serviceRequest.address.detail}, ${serviceRequest.address.ward}, ${serviceRequest.address.district}, ${serviceRequest.address.city}`}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-ruler-combined text-orange-500 text-lg"></i>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Thông số kỹ thuật
                  </h3>
                </div>

                {/* Grid thông số */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-arrows-left-right text-green-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        Chiều rộng
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {serviceRequest.width}
                      <span className="text-sm"> m</span>
                    </p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-arrows-up-down text-blue-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        Chiều dài
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {serviceRequest.length}
                      <span className="text-sm"> m</span>
                    </p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-layer-group text-purple-600"></i>
                      <p className="text-sm text-gray-600 font-medium">
                        Số tầng
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {serviceRequest.floors}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid diện tích và dự toán */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-expand text-indigo-600 text-xl"></i>
                    <p className="text-sm text-gray-600 font-medium">
                      Tổng diện tích
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {serviceRequest.width *
                      serviceRequest.length *
                      serviceRequest.floors}
                    <span className="text-lg"> m²</span>
                  </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-money-bill-wave text-emerald-600 text-xl"></i>
                    <p className="text-sm text-gray-600 font-medium">Dự toán</p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700">
                    {(serviceRequest.estimatePrice / 1000000).toFixed(0)}
                    <span className="text-lg"> triệu</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {serviceRequest.estimatePrice.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-images text-orange-500 text-lg"></i>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Hình ảnh dự án
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-3 pl-7">
                  {serviceRequest.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => openLightbox(idx, 'project')}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity border-2 border-gray-200 hover:border-orange-400 hover:scale-105 transform"
                    >
                      <img
                        src={img}
                        alt={`Project ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/3 bg-white rounded-2xl shadow-lg p-6 overflow-y-auto">
          {!selectedContractor ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Nhà thầu ứng tuyển
                </h3>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {contractors.length} nhà thầu
                </span>
              </div>
              <div className="space-y-4">
                {contractors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedContractor(c)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all hover:border-orange-400 hover:shadow-lg hover:scale-105 group bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl border-2 border-gray-200 group-hover:border-orange-400 flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition truncate">
                          {c.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-yellow-600">
                            <i className="fas fa-star"></i>
                            <span className="font-semibold">{c.rating}</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            <i className="fas fa-comments mr-1"></i>
                            {c.reviewCount} đánh giá
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pl-1">
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {c.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          <i className="fas fa-check-circle text-green-600 mr-1"></i>
                          {c.completedProjects} dự án
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          {(c.bidPrice / 1000000).toFixed(0)} triệu
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectedContractor(null)}
                className="text-sm text-gray-600 hover:text-orange-600 mb-4 flex items-center gap-2 font-medium transition"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Quay lại danh sách</span>
              </button>
              <div className="space-y-6">
                <div className="text-center pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-orange-200 mx-auto mb-4">
                    {selectedContractor.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedContractor.name}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-yellow-600">
                      <i className="fas fa-star"></i>
                      <span className="font-bold">
                        {selectedContractor.rating}
                      </span>
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">
                      <i className="fas fa-comments mr-1"></i>
                      {selectedContractor.reviewCount} đánh giá
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <i className="fas fa-check-double text-green-600 text-xl mb-1"></i>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedContractor.completedProjects}
                    </p>
                    <p className="text-xs text-gray-600">Dự án hoàn thành</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <i className="fas fa-award text-blue-600 text-xl mb-1"></i>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedContractor.rating}
                    </p>
                    <p className="text-xs text-gray-600">Đánh giá TB</p>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-300">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-hand-holding-dollar text-emerald-600 text-xl"></i>
                    <p className="text-sm text-gray-600 font-medium">
                      Giá đề xuất
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700">
                    {(selectedContractor.bidPrice / 1000000).toFixed(0)} triệu
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedContractor.bidPrice.toLocaleString('vi-VN')} VNĐ
                  </p>
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <p className="text-xs text-gray-600">
                      {selectedContractor.bidPrice <
                      serviceRequest.estimatePrice
                        ? `Thấp hơn dự toán ${(
                            (serviceRequest.estimatePrice -
                              selectedContractor.bidPrice) /
                            1000000
                          ).toFixed(0)} triệu`
                        : `Cao hơn dự toán ${(
                            (selectedContractor.bidPrice -
                              serviceRequest.estimatePrice) /
                            1000000
                          ).toFixed(0)} triệu`}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-clipboard-list text-orange-500"></i>
                    <span>Mô tả phương án thi công</span>
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {selectedContractor.proposalDescription}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedContractor.proposalImages.map((img, idx) => (
                      <button
                        key={img.url}
                        onClick={() => openLightbox(idx, 'proposal')}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity border-2 border-gray-200 hover:border-orange-400 hover:scale-105 transform"
                      >
                        <img
                          src={img}
                          alt={`Proposal ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-address-book text-orange-500"></i>
                    <span>Thông tin liên hệ</span>
                  </h4>
                  <div className="space-y-2">
                    <a
                      href={`tel:${selectedContractor.phone}`}
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      <i className="fas fa-phone text-blue-600"></i>
                      <span className="text-sm text-gray-700">
                        {selectedContractor.phone}
                      </span>
                    </a>
                    <a
                      href={`mailto:${selectedContractor.email}`}
                      className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                    >
                      <i className="fas fa-envelope text-purple-600"></i>
                      <span className="text-sm text-gray-700">
                        {selectedContractor.email}
                      </span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold text-sm">
                    <i className="fas fa-handshake mr-2"></i>
                    <span>Chấp nhận</span>
                  </button>
                  <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm">
                    <i className="fas fa-times mr-2"></i>
                    <span>Từ chối</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative border-t bg-white p-4">
        <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
          <i className="fas fa-comments"></i>
          <span>Chat với nhà thầu</span>
        </h4>
        <div className="h-128 overflow-y-auto bg-gray-50 p-3 rounded-lg mb-3">
          {messages.map((m) => (
            <div
              key={m.text}
              className={`mb-2 flex ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-[70%] ${
                  m.sender === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Nhập tin nhắn..."
            disabled={true}
          />
          <button
            onClick={handleSend}
            disabled={true}
            className="px-4 py-2 rounded-lg transition bg-gray-300 text-gray-600 cursor-not-allowed"
          >
            Gửi
          </button>
        </div>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold rounded-lg backdrop-blur-sm">
          <div className="text-center">
            <i className="fas fa-lock text-4xl mb-3"></i>
            <p>Tính năng này chỉ có khi bạn đã chọn được nhà thầu</p>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-3xl hover:text-orange-400 transition z-10"
          >
            <i className="fas fa-times"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 text-white text-4xl hover:text-orange-400 transition z-10"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 text-white text-4xl hover:text-orange-400 transition z-10"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={getCurrentImages()[lightboxIndex]}
              alt={`${lightboxType} ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-white mt-4 text-lg">
              {lightboxIndex + 1} / {getCurrentImages().length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestDetail;
