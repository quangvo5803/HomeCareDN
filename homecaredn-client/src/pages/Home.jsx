import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Dữ liệu mock cho các phần của trang chủ
const heroData = {
  title: 'A Construction & Renovation Company',
  subtitle: 'Welcome to APEX',
  buttonText: 'Read More',
  image:
    'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749277173/carousel-1_cusbvg.jpg',
};

const aboutUsData = {
  title: 'Unique Solutions For Residentials & Industries!',
  subtitle: '25 Years Experience',
  description:
    'Tempor erat elitr at rebum at at clita. Diam dolor diam ipsum tempor sit. Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo magna dolore erat amet',
  features: [
    'Skilled & Professional',
    '24/7 House Services',
    'Verified Professionals',
  ],
  image:
    'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749285221/about_upkv2j.jpg',
};
const processItems = [
  {
    number: '01',
    title: 'Construction',
    description:
      'Aliqu diam diam et eos erat ipsum lorem stet clita duo justo erat amet',
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749286666/fact-1_gdm2t1.jpg',
  },
  {
    number: '02',
    title: 'Mechanical',
    description:
      'Aliqu diam diam et eos erat ipsum lorem stet clita duo justo erat amet',
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749286666/fact-2_fxjryy.jpg',
  },
  {
    number: '03',
    title: 'Architecture',
    description:
      'Aliqu diam diam et eos erat ipsum lorem stet clita duo justo erat amet',
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749286667/fact-3_ag7tin.jpg',
  },
  {
    number: '04',
    title: 'Interior Design',
    description:
      'Aliqu diam diam et eos erat ipsum lorem stet clita duo justo erat amet',
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749286666/fact-4_jhvrtl.jpg',
  },
];

const serviceItems = [
  {
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-1_dswhst.jpg',
    title: 'Building Construction',
  },
  {
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-2_tmscpu.jpg',
    title: 'Home Maintenance',
  },
  {
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-3_sqc14e.jpg',
    title: 'Renovation and Painting',
  },
  {
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-4_swwy8b.jpg',
    title: 'Wiring and Installation',
  },
  {
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-5_hxqszr.jpg',
    title: 'Filling and Painting',
  },
  {
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-6_lyqrs4.jpg',
    title: 'Interior Design',
  },
];

const companyFeaturesData = {
  title: 'Our Specialization And Company Features',
  features: [
    { text: 'A large number of satisfied customers' },
    { text: '25 years of professional experience' },
    { text: 'A large number of certified companies' },
    { text: 'Always on time and ready to serve' },
  ],
  image:
    'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749285221/about_upkv2j.jpg',
  yearsOfExperience: '25 Years',
};

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="bg-white text-gray-800">
        {/* 1. Hero Section */}
        <div
          className="relative bg-cover bg-center h-[600px] lg:h-[800px] flex items-center justify-center"
          style={{ backgroundImage: `url(${heroData.image})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative text-center text-white p-6 z-10">
            <p className="text-xl font-medium mb-2">{heroData.subtitle}</p>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-4">
              {heroData.title}
            </h1>
            <button className="bg-orange-500 text-white font-medium px-8 py-3 rounded-md hover:bg-orange-600 transition-colors">
              {heroData.buttonText}
            </button>
          </div>
        </div>

        {/* 2. About Us Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto max-w-screen-xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Cột trái: Hình ảnh */}
            <div className="flex-1 relative">
              <div className="relative">
                <img
                  src={aboutUsData.image}
                  alt="About Us"
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
                {/* Khung '25 Years Experience' */}
                <div className="absolute top-[-32px] left-[-32px] bg-orange-500 text-white font-bold text-center p-6 w-48 h-48 flex flex-col items-center justify-center shadow-xl">
                  <p className="text-6xl mb-2 leading-none">25</p>
                  <p className="text-xl mb-1">Years</p>
                  <p className="text-xl">Experience</p>
                </div>
              </div>
            </div>
            {/* Cột phải: Nội dung */}
            <div className="flex-1 space-y-6">
              <p className="text-orange-500 font-semibold uppercase">
                ABOUT US
              </p>
              <div className="border-l-4 border-orange-500 pl-4">
                <h2 className="text-4xl font-bold leading-tight">
                  {aboutUsData.title}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {aboutUsData.description}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {aboutUsData.description2}
              </p>
              <div className="flex flex-wrap gap-x-8">
                {aboutUsData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-4">
                    <i className="fas fa-check text-orange-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <button className="bg-blue-600 text-white font-medium px-8 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Read More
              </button>
            </div>
          </div>
        </section>

        {/* 2.5. Process/Steps Section */}
        <section className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {processItems.map((item, index) => (
              <div
                key={index}
                className="relative h-96 bg-cover bg-center group"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                {/* Lớp phủ tối */}
                {/* Lớp phủ tối */}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-300" />

                {/* Nội dung */}
                <div className="absolute inset-0 flex flex-col items-start justify-end p-8 text-white">
                  <p className="text-7xl font-bold text-orange-500 mb-4">
                    {item.number}
                  </p>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm mb-4 leading-relaxed max-w-xs">
                    {item.description}
                  </p>
                  <a
                    href="#"
                    className="flex items-center text-sm font-medium text-white hover:text-orange-500 transition-colors duration-300"
                  >
                    READ MORE <i className="fas fa-arrow-right ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Our Services Section */}
        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="container mx-auto max-w-screen-xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Construction & Renovation Solutions
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Eirmod sed ipsum dolor sit rebum labore magna erat. Tempor ut
                dolore lorem kasd vero ipsum sit eirmod sit.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceItems.map((service, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <a href="#" className="text-orange-500 hover:underline">
                      Read More <i className="fas fa-arrow-right ml-2" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Company Features Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto max-w-screen-xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="relative inline-block px-4 py-2 bg-orange-500 text-white font-bold rounded-lg transform -rotate-1">
                <span className="relative z-10">
                  {companyFeaturesData.yearsOfExperience}
                </span>
              </div>
              <h2 className="text-4xl font-bold leading-tight">
                {companyFeaturesData.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyFeaturesData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <i className="fas fa-check text-orange-500" />
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
              <button className="bg-blue-600 text-white font-medium px-8 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Explore Now
              </button>
            </div>
            <div className="flex-1 relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={companyFeaturesData.image}
                alt="Company Features"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
