import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#111827] text-gray-400 font-sans">
      <div className="container mx-auto max-w-screen-xl px-4 py-16 lg:px-6 lg:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1: Logo và Mô tả */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
                alt="HomeCareDN Logo"
                className="w-auto h-12 object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Cột 2: Địa chỉ */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">
              {t('footer.address.title')}
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-orange-500" />
                <span>{t('footer.address.location')}</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-3 text-orange-500" />
                <span>{t('footer.address.phone')}</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope-open mt-1 mr-3 text-orange-500" />
                <span>{t('footer.address.email')}</span>
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên kết nhanh */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">
              {t('footer.quickLinks.title')}
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <Link
                  to="/about"
                  className="hover:text-white transition-colors duration-300"
                >
                  {t('footer.quickLinks.about')}
                </Link>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors duration-300"
                >
                  {t('footer.quickLinks.contact')}
                </Link>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <a
                  href="https://github.com/"
                  className="hover:text-white transition-colors duration-300"
                >
                  {t('footer.quickLinks.services')}
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <a
                  href="https://github.com/"
                  className="hover:text-white transition-colors duration-300"
                >
                  {t('footer.quickLinks.terms')}
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <a
                  href="https://github.com/"
                  className="hover:text-white transition-colors duration-300"
                >
                  {t('footer.quickLinks.support')}
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Newsletter */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">
              {t('footer.newsletter.title')}
            </h2>
            <p className="text-sm mb-4">{t('footer.newsletter.description')}</p>
            <div className="flex">
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="w-full bg-[#1e293b] text-gray-200 border border-[#1e293b] 
                        focus:outline-none focus:border-orange-500 px-3 py-2 text-sm rounded-l-md"
              />
              <button
                className="bg-orange-500 text-white font-medium px-5 py-2 
                        hover:bg-orange-600 transition-colors duration-300 rounded-r-md whitespace-nowrap"
              >
                {t('footer.newsletter.signup')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
