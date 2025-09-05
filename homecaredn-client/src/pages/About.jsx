import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function useInView(options) {
  const ref = useRef(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
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
Reveal.propTypes = { children: PropTypes.node.isRequired };

// ---- Chỉ phần VIDEO CENTER cần thay ----
function AutoPlayVideoModal({ src, className }) {
  const [open, setOpen] = useState(false);
  const modalVideoRef = useRef(null);
  const modalContainerRef = useRef(null);

  // Tự play khi mở modal
  useEffect(() => {
    if (open && modalVideoRef.current) {
      const id = requestAnimationFrame(() => {
        modalVideoRef.current?.play?.().catch(() => {});
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // ESC để đóng
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [open]);

  // Toggle fullscreen cho modal container
  const enterFullscreen = () => {
    const el = modalContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  };

  return (
    <>
      {/* Card: video tự chạy (click để mở) */}
      <div
        className={`relative overflow-hidden shadow-xl h-80 md:h-96 scale-105 rounded-2xl ${
          className ?? ''
        }`}
      >
        <video
          src={src}
          className="w-full h-full object-cover rounded-2xl"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open video"
          className="absolute inset-0"
        />
      </div>

      {/* Modal phóng to */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
          <div
            ref={modalContainerRef}
            className="relative w-full max-w-7xl" /* to hơn */
          >
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute -top-10 right-14 md:-top-12 md:right-12 text-white/90 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                <path d="M18.3 5.71 12 12.01l-6.29-6.3-1.42 1.42 6.3 6.29-6.3 6.29 1.42 1.42 6.29-6.3 6.29 6.3 1.42-1.42-6.3-6.29 6.3-6.29z" />
              </svg>
            </button>

            {/* Nút fullscreen */}
            <button
              type="button"
              onClick={enterFullscreen}
              aria-label="Toggle fullscreen"
              className="absolute -top-10 right-0 md:-top-12 md:right-0 text-white/90 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm0-4h3V7h2v5H5V9h2zm12 9h-5v-2h3v-3h2v5zM14 7h5v5h-2V9h-3V7z" />
              </svg>
            </button>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video
                ref={modalVideoRef}
                src={src}
                className="w-full h-auto object-contain max-h-[88vh]"
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function StepCard({ n, title, desc }) {
  return (
    <div className="step-card rounded-[24px] bg-white border border-gray-100 shadow-sm p-6 md:p-8 overflow-hidden transition-transform hover:-translate-y-1">
      {/* Số lớn góc phải */}
      <div className="absolute top-4 right-5 text-5xl md:text-6xl font-extrabold text-gray-200 select-none">
        {n}
      </div>

      {/* Nội dung */}
      <div className="mt-16">
        <h4 className="text-xl md:text-2xl font-extrabold text-gray-900">
          {title}
        </h4>
        <p className="text-sm text-gray-600 mt-2">{desc}</p>
      </div>
    </div>
  );
}

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Page Header */}
      <Reveal>
        <div className="relative bg-[url('https://res.cloudinary.com/dl4idg6ey/image/upload/v1749285221/about_upkv2j.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="relative container mx-auto text-center py-20 px-6">
            <nav className="flex justify-center text-sm text-gray-300 space-x-2 mt-6">
              <a href="/" className="hover:text-orange-400">
                {t('common.home')}
              </a>
              <span>/</span>
              <span className="text-orange-500 font-semibold">
                {t('common.about')}
              </span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('about.hero_title1')}{' '}
              <span className="text-gray-300">{t('about.hero_title2')}</span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              {t('about.hero_description')}
            </p>
            <a
              href="/services"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition"
            >
              {t('about.hero_button')}
            </a>
          </div>
        </div>
      </Reveal>

      {/* About Images */}
      <Reveal>
        <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-6 items-center">
          {/* Image 1 */}
          <div className="relative group overflow-hidden shadow-lg clip-slant h-64 md:h-72">
            <img
              src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749277173/carousel-2_ilxsvw.jpg"
              alt="Team working"
              className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
              loading="lazy"
            />
          </div>

          {/* Center: Click-to-play Video (highlighted) */}
          <AutoPlayVideoModal
            className="md:col-span-1"
            src="https://res.cloudinary.com/dl4idg6ey/video/upload/v1757032934/xaydung_1_psj2i6.mp4"
          />

          {/* Image 3 */}
          <div className="relative group overflow-hidden shadow-lg clip-slant h-64 md:h-72">
            <img
              src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749286666/fact-2_fxjryy.jpg"
              alt="Construction"
              className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
              loading="lazy"
            />
          </div>
        </section>
      </Reveal>
      {/* Company Info */}
      <Reveal>
        <section className="bg-gray-50 py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Subtitle + Title */}
            <p className="text-sm text-orange-500 font-semibold uppercase tracking-wide mb-2">
              {t('about.section_subtitle')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('about.section_title')}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              {t('about.section_description')}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-12 gap-8">
              {/* Stat 1 – chiếm 5/12 */}
              <div className="col-span-12 md:col-span-5">
                <div className="stat-card bg-gray-100 p-8 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2 h-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <img
                      src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
                      alt="HomeCareDN Logo"
                      className="w-auto h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-lg">
                    {t('about.stat1_title')}
                  </h3>
                  <p className="text-3xl font-extrabold text-orange-500 my-2">
                    1600k+
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t('about.stat1_text')}
                  </p>
                </div>
              </div>

              {/* Cột 2 – Stat 2 + Stat 4 (chiếm 3/12) */}
              <div className="col-span-12 md:col-span-3 flex flex-col gap-8">
                <div className="stat-card bg-gray-100 p-8 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2 flex-1">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3L2 9l10 6 10-6-10-6zm0 15l-10-6v9h20v-9l-10 6z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">
                    {t('about.stat2_title')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('about.stat2_text')}
                  </p>
                </div>

                <div className="stat-card bg-gray-100 p-8 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2 flex-1">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-4xl">25M+</h3>
                  <p className="text-gray-600 text-sm">
                    {t('about.stat4_text')}
                  </p>
                </div>
              </div>

              {/* Cột 3 – Stat 3 + Last row (chiếm 4/12) */}
              <div className="col-span-12 md:col-span-4 flex flex-col gap-8 h-full">
                {/* Stat 3 */}
                <div className="stat-card bg-gray-100 p-8 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2 flex-1">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                    <i className="fa-solid fa-check text-orange-600"></i>
                  </div>
                  <h3 className="font-bold text-4xl">98%</h3>
                  <p className="text-gray-600 text-sm">
                    {t('about.stat3_text')}
                  </p>
                </div>

                {/* Last Row */}
                <div className="stat-card bg-gray-100 p-8 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2 flex-1">
                  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-layer-group text-orange-600"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {t('about.stat5_title')}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {t('about.stat5_text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Why Choose Us */}
      <Reveal>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto flex flex-col gap-12">
            {/* Row 1: heading */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left: tiny badge + title */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-orange-400" />
                  <span className="font-semibold">{t('why.badge')}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900">
                  {t('why.title')}{' '}
                  <span className="block md:inline">{t('why.brand')}</span>
                </h2>
              </div>

              {/* Right: intro */}
              <div className="flex items-center">
                <p className="text-gray-600 max-w-prose">{t('why.intro')}</p>
              </div>
            </div>

            {/* Row 2: image + cards */}
            <div className="grid md:grid-cols-2 gap-12 items-stretch">
              {/* Left: image */}
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1755740416/feature_x63wto.jpg"
                  alt={t('why.image_alt')}
                  className="w-full h-[420px] md:h-[520px] object-cover rounded-[28px] shadow-xl"
                  loading="lazy"
                />
              </div>

              {/* Right: cards */}
              <div className="flex flex-col gap-6 h-full">
                <div className="flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900">
                    {t('why.f1.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('why.f1.desc')}
                  </p>
                </div>

                <div className="flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900">
                    {t('why.f2.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('why.f2.desc')}
                  </p>
                </div>

                <div className="flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900">
                    {t('why.f3.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('why.f3.desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Our Process */}
      <Reveal>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            {/* Left: heading */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-orange-400" />
                <span className="font-semibold">{t('process.badge')}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900">
                {t('process.title')}
              </h2>
            </div>
            <div className="flex items-center">
              <p className="text-gray-600 max-w-prose">{t('process.intro')}</p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:col-span-2">
              {['s1', 's2', 's3', 's4'].map((key, i) => (
                <div
                  key={i}
                  className="relative rounded-[28px] border border-gray-100 bg-gray-50 p-6 md:p-7 shadow-sm"
                >
                  {/* big number */}
                  <div className="absolute top-4 left-5 text-4xl md:text-5xl font-extrabold text-orange-400 select-none">
                    {`0${i + 1}`}
                  </div>
                  <div className="mt-16">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {t(`process.${key}.title`)}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {t(`process.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
