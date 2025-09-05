import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

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

const FACT_ITEMS = [
  {
    no: '01',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749286666/fact-1_gdm2t1.jpg',
    titleKey: 'home.fact_step1_title',
    descKey: 'home.fact_step1_desc',
    ctaKey: 'home.fact_read_more',
    href: '#',
  },
  {
    no: '02',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749286666/fact-4_jhvrtl.jpg',
    titleKey: 'home.fact_step2_title',
    descKey: 'home.fact_step2_desc',
    ctaKey: 'home.fact_read_more',
    href: '#',
  },
  {
    no: '03',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749286667/fact-3_ag7tin.jpg',
    titleKey: 'home.fact_step3_title',
    descKey: 'home.fact_step3_desc',
    ctaKey: 'home.fact_read_more',
    href: '#',
  },
  {
    no: '04',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749286666/fact-2_fxjryy.jpg',
    titleKey: 'home.fact_step4_title',
    descKey: 'home.fact_step4_desc',
    ctaKey: 'home.fact_read_more',
    href: '#',
  },
];

const ITEMS = [
  { title: 'home.features_item1_title', desc: 'home.features_item_desc' },
  { title: 'home.features_item2_title', desc: 'home.features_item_desc' },
  { title: 'home.features_item3_title', desc: 'home.features_item_desc' },
  { title: 'home.features_item4_title', desc: 'home.features_item_desc' },
];

const SERVICE_ITEMS = [
  {
    id: 'build',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-1_dswhst.jpg',
    titleKey: 'Building Construction',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'maintain',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-2_tmscpu.jpg',
    titleKey: 'Home Maintainance',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'reno-paint',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-3_sqc14e.jpg',
    titleKey: 'Renovation and Painting',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'wiring',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-4_swwy8b.jpg',
    titleKey: 'Wiring and installation',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'tiling-paint',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-5_hxqszr.jpg',
    titleKey: 'Tiling and Painting',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'interior',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749355179/service-6_lyqrs4.jpg',
    titleKey: 'Interior Design',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
];

const MATERIALS = [
  {
    id: 'Cement',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1755830746/28b970d7-6ada-4c01-a83e-17e4e068537a.png',
    titleKey: 'Cement',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'Wood',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1755830852/ac2be91c-2038-41ac-8878-0759bd25a803.png',
    titleKey: 'Wood',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'Iron',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1755830632/978e5e3d-3d50-4949-b2d2-fbb93a3ae22a.png',
    titleKey: 'Iron',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'ceramic tiles',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1755830684/81028f90-f24c-480f-a510-6c4c45d8c708.png',
    titleKey: 'Ceramic tiles',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'Tools',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1755830818/0722b748-038c-45de-8132-d65d36433d9b.png',
    titleKey: 'Tools',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
  {
    id: 'water pipe',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1755830902/6e964ad1-e1d8-43c7-bed2-aff7be26fdd7.png',
    titleKey: 'Water pipe',
    descKey:
      'Tempor erat elitr rebum at clita dolor diam ipsum sit diam amet diam et eos',
    href: '#',
  },
];

const TESTIMONIALS = [
  {
    id: '1',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1755741028/testimonial-1_umvege.jpg',
    textKey: 'home.testimonial1_text',
    nameKey: 'home.testimonial1_name',
    roleKey: 'home.testimonial1_role',
  },
  {
    id: '2',
    img: 'https://res.cloudinary.com/dl4idg6ey/image/upload/v1755741031/testimonial-2_o96wyf.jpg',
    textKey: 'home.testimonial2_text',
    nameKey: 'home.testimonial2_name',
    roleKey: 'home.testimonial2_role',
  },
];
function useInView(options) {
  const ref = useRef(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // chỉ trigger khi phần tử đi từ dưới lên (boundingClientRect.top > 0)
      if (entry.isIntersecting) {
        setVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
}

export default function Home() {
  const { t } = useTranslation();

  // Carousel state
  const [current, setCurrent] = useState(0);
  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    const timer = setInterval(() => nextSlide(), 5000);
    return () => clearInterval(timer);
  }, [current]);

  // Back to top
  const [showBackTop, setShowBackTop] = useState(false);
  const handleBackTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ===== Testimonial Slider ===== */
  const baseSlides = TESTIMONIALS;
  const hasMany = baseSlides.length > 1;

  // 👉 tạo extSlides với id mới để tránh trùng key
  const extSlides = hasMany
    ? [
        { ...baseSlides[baseSlides.length - 1], cloneId: 'head' },
        ...baseSlides.map((s, i) => ({ ...s, cloneId: `orig-${i}` })),
        { ...baseSlides[0], cloneId: 'tail' },
      ]
    : baseSlides.map((s, i) => ({ ...s, cloneId: `orig-${i}` }));

  const [idx, setIdx] = useState(hasMany ? 1 : 0);
  const [anim, setAnim] = useState(true);
  const pausedRef = useRef(false);

  const tNext = useCallback(() => {
    if (hasMany) setIdx((i) => i + 1);
  }, [hasMany]);

  const tPrev = useCallback(() => {
    if (hasMany) setIdx((i) => i - 1);
  }, [hasMany]);

  const handleTransitionEnd = useCallback(() => {
    if (!hasMany) return;
    if (idx === extSlides.length - 1) {
      setAnim(false);
      setIdx(1);
    } else if (idx === 0) {
      setAnim(false);
      setIdx(baseSlides.length);
    }
  }, [idx, hasMany, extSlides.length, baseSlides.length]);

  useEffect(() => {
    if (!anim) {
      const id = requestAnimationFrame(() => setAnim(true));
      return () => cancelAnimationFrame(id);
    }
  }, [anim]);

  useEffect(() => {
    if (pausedRef.current || !hasMany) return;
    const id = setTimeout(tNext, 5000);
    return () => clearTimeout(id);
  }, [idx, tNext, hasMany]);

  return (
    <div>
      {/* Carousel */}
      <div className="relative w-full h-[90vh] overflow-hidden">
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0 relative overflow-hidden hero-vignette"
            >
              <img
                src={slide.image}
                alt="Slide"
                className="w-full h-[90vh] object-cover animate-kenburns"
              />
              {/* Caption Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 flex items-center">
                <div className="container mx-auto text-left px-6 md:px-20">
                  <h5
                    className={`text-white uppercase mb-3 text-sm md:text-base tracking-wider animated ${
                      current === i ? 'slideInDown' : ''
                    }`}
                  >
                    {t(slide.subtitle)}
                  </h5>
                  <h1
                    className={`text-white text-3xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl animated ${
                      current === i ? 'slideInDown' : ''
                    }`}
                  >
                    {t(slide.title)}
                  </h1>
                  <ol className="flex flex-wrap gap-6 mb-6  ">
                    {slide.categories.map((cat) => (
                      <li
                        key={cat}
                        className="text-white text-base md:text-lg flex items-center gap-2"
                      >
                        <span className="w-3 h-3 bg-orange-500 rounded-full inline-block"></span>
                        {t(cat)}
                      </li>
                    ))}
                  </ol>
                  <a
                    href="https://github.com/"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-3 rounded-md shadow-lg transition  "
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
          className="absolute top-1/2 left-6 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full  "
        >
          ❮
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-6 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full  "
        >
          ❯
        </button>
      </div>
      {/* About us*/}
      <Reveal>
        <section className="max-w-7xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-10 items-center">
          {/* Left side - Image with overlay box */}
          <div className="relative  ">
            {/* Orange box overlay */}
            <div className="absolute -top-6 -left-6 bg-orange-500 text-white text-center shadow-lg w-32 aspect-square flex flex-col items-center justify-center  ">
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
          <div className=" ">
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
              <div className="flex items-center justify-center gap-3  ">
                <i className="fa fa-check text-orange-500 text-5xl"></i>
                <p className="font-semibold text-l text-gray-800">
                  {t('home.about_feature1')}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3  ">
                <i className="fa fa-check text-orange-500 text-5xl"></i>
                <p className="font-semibold text-l text-gray-800">
                  {t('home.about_feature2')}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3  ">
                <i className="fa fa-check text-orange-500 text-5xl"></i>
                <p className="font-semibold text-l text-gray-800">
                  {t('home.about_feature3')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
      {/* Fact */}
      <Reveal>
        <section aria-label={t('home.facts_aria') || 'Facts'} className="my-12">
          <div className="mx-auto max-w-none px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-0">
              {FACT_ITEMS.map((it) => (
                <article
                  key={it.no}
                  className="relative group isolate h-[360px] md:h-[420px] xl:h-[480px]  "
                >
                  {/* Imgage */}
                  <img
                    src={it.img}
                    alt={t(it.titleKey)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 "
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-[rgba(0,0,0,0.65)] transition-colors duration-500 " />

                  {/* Content overlay */}
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                    <h1 className="facts-stroke font-extrabold leading-none text-[88px] md:text-[104px] xl:text-[120px]">
                      {it.no}
                    </h1>

                    <h4 className="text-white text-2xl font-extrabold mt-2 mb-3">
                      {t(it.titleKey)}
                    </h4>

                    <p className="text-white/95 text-sm md:text-base max-w-[46ch] leading-relaxed">
                      {t(it.descKey)}
                    </p>

                    <a
                      href={it.href}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.reload();
                      }}
                      className="mt-6 inline-flex items-center gap-2 text-white text-sm font-semibold tracking-wide hover:text-primary transition-colors  "
                      aria-label={`${t('home.fact_read_more')} ${t(
                        it.titleKey
                      )}`}
                    >
                      {t(it.ctaKey)}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M13.172 12 9.88 8.707l1.415-1.414L16 12l-4.707 4.707-1.414-1.414z" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
      {/* Features */}
      <Reveal>
        {' '}
        <section className="py-12">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              {/* Left: Text */}
              <div className=" ">
                <div className="border-l-4 border-orange-500 pl-4 mb-6">
                  <h6 className="text-gray-600 uppercase mb-2 tracking-wide">
                    {t('home.features_subtitle')}
                  </h6>
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                    {t('home.features_title')}
                  </h2>
                </div>

                <p className="text-gray-600 mb-8">{t('home.features_intro')}</p>

                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
                  {ITEMS.map((it) => (
                    <div key={it.title} className=" ">
                      <div className="flex items-center mb-3">
                        {/* check icon */}
                        <svg
                          className="h-7 w-7 text-orange-500 flex-shrink-0 mr-3"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M9 16.17 4.83 12 3.41 13.41 9 19 21 7l-1.41-1.41z" />
                        </svg>
                        <h6 className="font-semibold text-gray-900 m-0">
                          {t(it.title)}
                        </h6>
                      </div>
                      <span className="text-gray-600">{t(it.desc)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Image with overlay box */}
              <div className="relative min-h-[400px]">
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
                  src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1755740416/feature_x63wto.jpg"
                  alt={t('home.features_img_alt')}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Service */}
      <Reveal>
        <section className="py-12">
          <div className="container mx-auto max-w-7xl px-6">
            {/* header row */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-10 ">
              <div className="w-full lg:w-auto">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h6 className="text-gray-600 uppercase mb-2 tracking-wide">
                    {t('home.services_subtitle')}
                  </h6>
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight m-0">
                    {t('home.services_title')}
                  </h2>
                </div>
              </div>
              <div className="w-full lg:w-auto text-left lg:text-right">
                <a
                  href="https://github.com/"
                  className="inline-flex items-center justify-center bg-primary text-white font-medium px-6 py-3 rounded-lg shadow bg-orange-400 hover:bg-orange-500 transition  "
                >
                  {t('home.services_more')}
                </a>
              </div>
            </div>

            {/* grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_ITEMS.map((it) => (
                <article
                  key={it.id}
                  className="group bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition h-full  "
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={it.img}
                      alt={t(it.titleKey)}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="p-5 text-center transition-colors duration-300 group-hover:bg-orange-400 group-hover:text-white">
                    <h5 className="text-lg font-semibold mb-2">
                      {t(it.titleKey)}
                    </h5>
                    <p className="text-gray-600 mb-4 group-hover:text-white">
                      {t(it.descKey)}
                    </p>

                    <a
                      href={it.href}
                      className="inline-flex items-center gap-2 text-orange-500 text-sm font-medium underline-offset-4 decoration-orange-400 hover:decoration-white group-hover:text-white"
                      aria-label={`${t('home.fact_read_more')} ${t(
                        it.titleKey
                      )}`}
                    >
                      {t('home.fact_read_more')}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M13.172 12 9.88 8.707l1.415-1.414L16 12l-4.707 4.707-1.414-1.414z" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/*Material  */}
      <Reveal>
        <section className="py-12">
          <div className="container mx-auto max-w-7xl px-6">
            {/* header row */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-10 ">
              <div className="w-full lg:w-auto">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h6 className="text-gray-600 uppercase mb-2 tracking-wide">
                    {t('home.material_subtitle')}
                  </h6>
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight m-0">
                    {t('home.material_title')}
                  </h2>
                </div>
              </div>
              <div className="w-full lg:w-auto text-left lg:text-right">
                <a
                  href="https://github.com/"
                  className="inline-flex items-center justify-center bg-primary text-white font-medium px-6 py-3 rounded-lg shadow bg-orange-400 hover:bg-orange-500 transition  "
                >
                  {t('home.material_more')}
                </a>
              </div>
            </div>

            {/* grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {MATERIALS.map((it) => (
                <article
                  key={it.id}
                  className="group bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition h-full  "
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={it.img}
                      alt={t(it.titleKey)}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="p-5 text-center transition-colors duration-300 group-hover:bg-orange-400 group-hover:text-white">
                    <h5 className="text-lg font-semibold mb-2">
                      {t(it.titleKey)}
                    </h5>
                    <p className="text-gray-600 mb-4 group-hover:text-white">
                      {t(it.descKey)}
                    </p>

                    <a
                      href={it.href}
                      className="inline-flex items-center gap-2 text-orange-500 text-sm font-medium underline-offset-4 decoration-orange-400 hover:decoration-white group-hover:text-white"
                      aria-label={`${t('home.fact_read_more')} ${t(
                        it.titleKey
                      )}`}
                    >
                      {t('home.fact_read_more')}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M13.172 12 9.88 8.707l1.415-1.414L16 12l-4.707 4.707-1.414-1.414z" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Testimonial */}
      <Reveal>
        <section className="py-12">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left column */}
              <div className="lg:col-span-5">
                <div className="border-l-4 border-orange-500 pl-4 mb-6">
                  <h6 className="text-gray-500 uppercase tracking-wider text-sm">
                    {t('home.testimonial_subtitle')}
                  </h6>
                  <h2 className="text-3xl md:text-4xl font-extrabold leading-tight h-heading">
                    {t('home.testimonial_title')}
                  </h2>
                </div>

                <p className="text-gray-500 mb-8 max-w-prose">
                  {t('home.testimonial_intro')}
                </p>

                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <div className="flex items-center mb-1">
                      {/* Users icon */}
                      <svg
                        className="h-7 w-7 text-orange-500 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 
                           1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 
                           2.99-1.34 2.99-3S9.66 5 8 5 
                           5 6.34 5 8s1.34 3 3 3zm0 
                           2c-2.33 0-7 1.17-7 3.5V19h14v-2.5
                           C15 14.17 10.33 13 8 13zm8 
                           0c-.29 0-.62.02-.97.05 
                           1.16.84 1.97 1.97 1.97 3.45V19h6
                           v-2.5c0-2.33-4.67-3.5-7-3.5z"
                        />
                      </svg>
                      <span className="ml-3 text-3xl font-extrabold">123+</span>
                    </div>
                    <h5 className="font-semibold">
                      {t('home.testimonial_happy_clients')}
                    </h5>
                  </div>

                  <div>
                    <div className="flex items-center mb-1">
                      {/* Check icon */}
                      <svg
                        className="h-7 w-7 text-orange-500 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          d="M9 16.17 4.83 12 3.41 13.41 
                           9 19 21 7l-1.41-1.41z"
                        />
                      </svg>
                      <span className="ml-3 text-3xl font-extrabold">123+</span>
                    </div>
                    <h5 className="font-semibold">
                      {t('home.testimonial_projects_done')}
                    </h5>
                  </div>
                </div>
              </div>

              {/* Right column: slider */}
              <section
                className="lg:col-span-7"
                onMouseEnter={() => (pausedRef.current = true)}
                onMouseLeave={() => (pausedRef.current = false)}
                onFocusCapture={() => (pausedRef.current = true)}
                onBlurCapture={() => (pausedRef.current = false)}
                aria-roledescription="carousel"
                aria-label={
                  t('home.testimonial_carousel_aria') || 'Testimonials'
                }
              >
                <div className="relative overflow-hidden">
                  <div
                    className={`flex ${
                      anim ? 'transition-transform duration-700 ease-out' : ''
                    }`}
                    style={{ transform: `translateX(-${idx * 100}%)` }}
                    onTransitionEnd={handleTransitionEnd}
                  >
                    {extSlides.map((it, i) => (
                      <article
                        key={`${it.id}-${it.cloneId}`}
                        className="min-w-full shrink-0 flex items-center justify-center"
                      >
                        <div className="max-w-2xl text-left bg-white rounded-lg p-6 shadow">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <img
                              src={it.img}
                              alt={t(it.nameKey)}
                              className="h-16 w-16 rounded-md object-cover mt-1 flex-shrink-0"
                              loading={i === 1 ? 'eager' : 'lazy'}
                              decoding="async"
                            />

                            {/* Content */}
                            <div className="flex-1">
                              <p className="text-gray-600 leading-relaxed mb-3 whitespace-pre-line">
                                {t(it.textKey).split('\\n').join('\n')}
                              </p>

                              <div className="w-16 h-[5px] bg-orange-500 mb-3 rounded-full" />

                              <h5 className="font-semibold text-gray-900">
                                {t(it.nameKey)}
                              </h5>
                              <span className="text-gray-500 text-sm">
                                {t(it.roleKey)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* controls */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={tPrev}
                      aria-label={t('home.prev') || 'Previous'}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-full 
                           border-2 border-orange-500 text-orange-500 
                           hover:bg-orange-500 hover:text-white transition"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          d="M10.828 12 15.12 7.707 
                           13.707 6.293 8 12l5.707 
                           5.707 1.414-1.414z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={tNext}
                      aria-label={t('home.next') || 'Next'}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-full 
                           border-2 border-orange-500 text-orange-500 
                           hover:bg-orange-500 hover:text-white transition"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          d="M13.172 12 8.88 7.707
                           l1.414-1.414L16 12l-5.707 
                           5.707-1.414-1.414z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Back to Top */}
      <button
        onClick={handleBackTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-orange-500 text-white shadow-lg 
                    flex items-center justify-center transition-all duration-300 hover:bg-orange-600  
                    ${
                      showBackTop
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-3 pointer-events-none'
                    }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 4l-7 7h5v9h4v-9h5z" />
        </svg>
      </button>
    </div>
  );
}
function Reveal({ children }) {
  const [ref, visible] = useInView({
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  });
  return (
    <div ref={ref} className={`reveal-up ${visible ? 'is-visible' : ''}`}>
      {children}
    </div>
  );
}
Reveal.propTypes = {
  children: PropTypes.node.isRequired,
};
