import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hook/useAuth';
import ReactCountryFlag from 'react-country-flag';

// Navigation data
const navItems = [
  { label: 'header.home', href: '#', type: 'link' },
  { label: 'header.about', href: '#about', type: 'link' },
  {
    label: 'header.services',
    href: '#',
    type: 'dropdown',
    submenu: [
      { label: 'header.construction', href: '#services' },
      { label: 'header.repair', href: '#services' },
      { label: 'header.material', href: '#services' },
    ],
  },
  { label: 'header.contact', href: '#footer', type: 'link' },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const [openAvatarMenu, setOpenAvatarMenu] = useState(false);

  const toggleServices = () => setIsServicesOpen(!isServicesOpen);
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenLang(false);

    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) navToggle.checked = false;
  };
  const handleProfile = () => {
    setOpenAvatarMenu(false);
  };

  const handleLogout = () => {
    logout();
    setOpenAvatarMenu(false);
  };

  return (
    <header
      id="top"
      className="sticky top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <nav className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <div className="w-32 h-16 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
                alt="HomeCareDN Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </a>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('header.search')}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Navigation Menu (Desktop) */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center gap-8 mr-8">
              {navItems.map((item) => (
                <li key={item.label} className="relative group">
                  {item.type === 'link' ? (
                    <a
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative"
                    >
                      {t(item.label)}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                    </a>
                  ) : (
                    <>
                      <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative focus:outline-none">
                        {t(item.label)}
                        <i className="ml-2 fas fa-chevron-down text-xs transition-transform duration-300 group-hover:rotate-180" />
                      </button>
                      <ul className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white shadow-lg rounded-lg opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 invisible z-50">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.label}>
                            <a
                              href={subItem.href}
                              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors rounded-lg"
                            >
                              {t(subItem.label)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setOpenAvatarMenu(!openAvatarMenu)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-all"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.email}&background=random`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {openAvatarMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
                      <button
                        onClick={handleProfile}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <i class="fa-solid fa-user me-2"></i>
                        {t('header.profile')}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                      >
                        <i class="fa-solid fa-right-from-bracket me-2"></i>
                        {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/Login"
                    className="text-white bg-blue-700 hover:bg-blue-800 px-5 py-2.5 rounded-lg"
                  >
                    {t('BUTTON.Login')}
                  </Link>
                  <Link
                    to="/Register"
                    className="text-blue-700 border border-blue-700 px-5 py-2.5 rounded-lg hover:bg-blue-800 hover:text-white"
                  >
                    {t('BUTTON.Register')}
                  </Link>
                </div>
              )}

              {/* 🌐 Language Switcher (Desktop) */}
              <div className="relative">
                <button
                  onClick={() => setOpenLang(!openLang)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-50 border border-gray-300 hover:border-blue-500 rounded-full transition-all duration-300"
                >
                  <i className="fas fa-globe group-hover:scale-110 transition-transform duration-200" />
                </button>
                {openLang && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border p-2 space-y-1">
                    <button
                      onClick={() => changeLanguage('en')}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <ReactCountryFlag
                        countryCode="US"
                        svg
                        className="text-lg"
                      />
                      <span>English</span>
                    </button>
                    <button
                      onClick={() => changeLanguage('vi')}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <ReactCountryFlag
                        countryCode="VN"
                        svg
                        className="text-lg"
                      />
                      <span>Tiếng Việt</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <input id="nav-toggle" type="checkbox" className="peer hidden" />
          <label
            htmlFor="nav-toggle"
            className="lg:hidden cursor-pointer p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
          >
            <i className="fas fa-bars text-xl text-gray-700" />
          </label>

          {/* Mobile Menu */}
          <div className="peer-checked:block hidden lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-xl">
            <div className="p-4 max-h-screen overflow-y-auto">
              {/* Compact Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder={t('header.search')}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>

              {/* Compact Navigation */}
              <ul className="space-y-1 mb-4">
                {navItems.map((item) => (
                  <li key={item.label}>
                    {item.type === 'link' ? (
                      <a
                        href={item.href}
                        className="flex items-center py-3 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200 group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {t(item.label)}
                        </span>
                      </a>
                    ) : (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <button
                          onClick={toggleServices}
                          className="w-full flex justify-between items-center py-3 px-3 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200"
                        >
                          <span>{t(item.label)}</span>
                          <i
                            className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
                              isServicesOpen ? 'rotate-180 text-blue-600' : ''
                            }`}
                          />
                        </button>
                        {isServicesOpen && (
                          <ul className="bg-white border-t border-gray-100 py-1">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.label}>
                                <a
                                  href={subItem.href}
                                  className="block py-2 px-6 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                >
                                  {t(subItem.label)}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Compact Action Buttons */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                {user ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleProfile}
                      className="flex-1 py-2 px-3 text-sm text-gray-700 bg-gray-50 border border-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <i class="fa-solid fa-user me-2"></i>
                      {t('header.profile')}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-2 px-3 text-sm text-white bg-red-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <i class="fa-solid fa-right-from-bracket me-2"></i>
                      {t('header.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/Login"
                      className="flex-1 py-2 px-3 text-sm text-center text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      {t('BUTTON.Login')}
                    </Link>
                    <Link
                      to="/Register"
                      className="flex-1 py-2 px-3 text-sm text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      {t('BUTTON.Register')}
                    </Link>
                  </div>
                )}

                {/* Compact Language Selector */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => changeLanguage('en')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <ReactCountryFlag
                      countryCode="US"
                      svg
                      className="text-lg"
                    />
                    <span className="text-sm font-medium">EN</span>
                  </button>
                  <button
                    onClick={() => changeLanguage('vi')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <ReactCountryFlag
                      countryCode="VN"
                      svg
                      className="text-lg"
                    />
                    <span className="text-sm font-medium">VI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
