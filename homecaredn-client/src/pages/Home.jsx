import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SupportChatWidget from "../components/SupportChatWidget";
const slides = [
  {
    id: 1,
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749277173/carousel-1_cusbvg.jpg',
    subtitle: 'home.slider_subtitle',
    title: 'home.slider1_title',
    categories: [
      'home.slider_category1',
      'home.slider_category2',
      'home.slider_category3',
    ],
  },
  {
    id: 2,
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749277173/carousel-2_ilxsvw.jpg',
    subtitle: 'home.slider_subtitle',
    title: 'home.slider2_title',
    categories: [
      'home.slider_category1',
      'home.slider_category2',
      'home.slider_category3',
    ],
  },
  {
    id: 3,
    image:
      'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749277424/vat-lieu-xay-dung_fcixhr.jpg',
    subtitle: 'home.slider_subtitle',
    title: 'home.slider3_title',
    categories: [
      'home.slider_category1',
      'home.slider_category2',
      'home.slider_category3',
    ],
  },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const { t } = useTranslation();

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    
    <div>
      {/* Carousel */}
      <div className="relative w-full h-[90vh] overflow-hidden">
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="w-full flex-shrink-0 relative">
              <img
                src={slide.image}
                alt="Slide"
                className="w-full h-[90vh] object-cover"
              />
              {/* Caption Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center">
                <div className="container mx-auto text-left px-6 md:px-20">
                  <h5 className="text-white uppercase mb-3 text-sm md:text-base tracking-wider">
                    {t(slide.subtitle)}
                  </h5>
                  <h1 className="text-white text-3xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl">
                    {t(slide.title)}
                  </h1>
                  <ol className="flex flex-wrap gap-6 mb-6">
                    {slide.categories.map((cat, i) => (
                      <li
                        key={i}
                        className="text-white text-base md:text-lg flex items-center gap-2"
                      >
                        <span className="w-3 h-3 bg-orange-500 rounded-full inline-block"></span>
                        {t(cat)}
                      </li>
                    ))}
                  </ol>
                  <a
                    href="#"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-3 rounded-md shadow-lg transition"
                  >
                    {t('home.slider_button')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-6 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full"
        >
          ❮
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-6 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full"
        >
          ❯
        </button>
      </div>
      {/* About us*/}
      <section className="max-w-7xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* Left side - Image with overlay box */}
        <div className="relative">
          {/* Orange box overlay */}
          <div className="absolute -top-6 -left-6 bg-orange-500 text-white text-center shadow-lg w-32 aspect-square flex flex-col items-center justify-center">
            <h2 className="text-4xl font-bold">25</h2>
            <p className="text-lg font-semibold">
              {t('home.about_experience')}
            </p>
            <p className="text-sm">{t('home.about_experience1')}</p>
          </div>

          {/* Image */}
          <img
            src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749285221/about_upkv2j.jpg"
            alt="Engineer"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Right side - Content */}
        <div>
          {/* About Us Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-orange-500"></div>
            <span className="uppercase text-gray-600 font-semibold">
              {t('home.about_subtitle')}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('home.about_title1')}
            <br /> {t('home.about_title2')}
          </h2>

          <p className="text-gray-600 mb-4">{t('home.about_description')}</p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
            <div className="flex items-center justify-center gap-3">
              <i className="fa fa-check text-orange-500 text-5xl"></i>
              <p className="font-semibold text-l text-gray-800">
                {t('home.about_feature1')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <i className="fa fa-check text-orange-500 text-5xl"></i>
              <p className="font-semibold text-l text-gray-800">
                {t('home.about_feature2')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <i className="fa fa-check text-orange-500 text-5xl"></i>
              <p className="font-semibold text-l text-gray-800">
                {t('home.about_feature3')}
              </p>
            </div>
          </div>
        </div>
      </section>
      <SupportChatWidget /> 
    </div>
  );
}
