import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hook/useAuth';
import ReactCountryFlag from 'react-country-flag';

// Navigation data
const navItems = [
  { label: 'header.home', href: '/', type: 'link' },
  { label: 'header.about', href: '/About', type: 'link' },
  {
    label: 'header.services',
    href: '#',
    type: 'dropdown',
    submenu: [
      { label: 'header.construction', href: '#services' },
      { label: 'header.repair', href: '#services' },
      { label: 'header.material', href: '/MaterialViewAll', type: 'link' },
      { label: 'header.material', href: '#services' },
      {
        label: 'header.materialCatalog',
        href: '/MaterialCatalog',
        type: 'link',
      },
    ],
  },
  { label: 'header.contact', href: '/contact', type: 'link' },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const [openAvatarMenu, setOpenAvatarMenu] = useState(false);

  const langRef = useRef(null);
  const avatarRef = useRef(null);

  const toggleServices = () => setIsServicesOpen((v) => !v);

  const closeMobileNav = () => {
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) navToggle.checked = false;
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenLang(false);
    closeMobileNav();
  };

  const handleLogout = () => {
    logout();
    setOpenAvatarMenu(false);
    closeMobileNav();
    navigate('/login', { replace: true });
  };

  // Close popovers when clicking outside / pressing Esc
  useEffect(() => {
    const onDown = (e) => {
      if (openLang && langRef.current && !langRef.current.contains(e.target)) {
        setOpenLang(false);
      }
      if (openAvatarMenu && avatarRef.current && !avatarRef.current.contains(e.target)) {
        setOpenAvatarMenu(false);
      }
    };
    const onKey = (e) => e.key === 'Escape' && (setOpenLang(false), setOpenAvatarMenu(false));
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openLang, openAvatarMenu]);

  return (
    <header id="top" className="sticky top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center group" aria-label="Home">
            <div className="w-32 h-16 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
                alt="HomeCareDN Logo"
                className="object-contain w-full h-full"
              />
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="flex-1 hidden lg:flex">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('header.search')}
                className="w-full py-3 pl-12 pr-4 transition-all duration-300 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <i className="absolute text-gray-400 transform -translate-y-1/2 fas fa-search left-4 top-1/2" />
            </div>
          </div>

          {/* Navigation Menu (Desktop) */}
          <div className="items-center hidden lg:flex">
            <ul className="flex items-center gap-8 mr-8">
              {navItems.map((item) => (
                <li key={item.label} className="relative group">
                  {item.type === 'link' ? (
                    <Link
                      to={item.href}
                      className="relative font-medium text-gray-700 transition-colors duration-300 hover:text-blue-600"
                    >
                      {t(item.label)}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative focus:outline-none"
                      >
                        {t(item.label)}
                        <i className="ml-2 text-xs transition-transform duration-300 fas fa-chevron-down group-hover:rotate-180" />
                      </button>
                      <ul className="absolute z-50 invisible w-48 mt-3 transition-all duration-300 -translate-x-1/2 bg-white rounded-lg shadow-lg opacity-0 top-full left-1/2 group-hover:opacity-100 group-hover:visible">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.label}>
                            <a
                              href={subItem.href}
                              className="block px-4 py-2 text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
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
                <div className="relative" ref={avatarRef}>
                  <button
                    type="button"
                    onClick={() => setOpenAvatarMenu((v) => !v)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-all"
                    aria-haspopup="menu"
                    aria-expanded={openAvatarMenu}
                    title={t('partnerDashboard.account')}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=random`}
                      alt="avatar"
                      className="object-cover w-full h-full"
                    />
                  </button>
                  {openAvatarMenu && (
                    <div role="menu" className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50">
                      <Link
                        to="/profile"
                        relative="path"
                        onClick={() => setOpenAvatarMenu(false)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <i className="fa-solid fa-user me-2"></i>
                        {t('header.profile')}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                        role="menuitem"
                      >
                        <i className="fa-solid fa-right-from-bracket me-2"></i>
                        {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/Login" className="text-white bg-blue-700 hover:bg-blue-800 px-5 py-2.5 rounded-lg">
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
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setOpenLang((v) => !v)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-50 border border-gray-300 hover:border-blue-500 rounded-full transition-all duration-300"
                  aria-haspopup="menu"
                  aria-expanded={openLang}
                >
                  <i className="fas fa-globe" />
                </button>
                {openLang && (
                  <div role="menu" className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border p-2 space-y-1 z-50">
                    <button
                      type="button"
                      onClick={() => changeLanguage('en')}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
                      role="menuitem"
                    >
                      <ReactCountryFlag countryCode="US" svg className="text-lg" />
                      <span>English</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => changeLanguage('vi')}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
                      role="menuitem"
                    >
                      <ReactCountryFlag countryCode="VN" svg className="text-lg" />
                      <span>Tiếng Việt</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <input id="nav-toggle" type="checkbox" className="hidden peer" />
          <label
            htmlFor="nav-toggle"
            className="p-3 transition-all duration-200 cursor-pointer lg:hidden hover:bg-gray-100 rounded-xl active:scale-95"
          >
            <i className="text-xl text-gray-700 fas fa-bars" />
            <span className="sr-only">Open navigation menu</span>
          </label>

          {/* Mobile Menu */}
          <div className="absolute left-0 right-0 hidden border-t border-gray-100 shadow-xl peer-checked:block lg:hidden top-full bg-white/95 backdrop-blur-md">
            <div className="max-h-screen p-4 overflow-y-auto">
              {/* Compact Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder={t('header.search')}
                  className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                <i className="absolute text-sm text-gray-400 transform -translate-y-1/2 fas fa-search left-3 top-1/2" />
              </div>

              {/* Compact Navigation */}
              <ul className="mb-4 space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    {item.type === 'link' ? (
                      <Link
                        to={item.href}
                        onClick={closeMobileNav}
                        className="flex items-center py-3 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200 group"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          {t(item.label)}
                        </span>
                      </Link>
                    ) : (
                      <div className="overflow-hidden rounded-lg bg-gray-50">
                        <button
                          type="button"
                          onClick={toggleServices}
                          className="flex items-center justify-between w-full px-3 py-3 font-medium text-gray-700 transition-all duration-200 hover:text-blue-600"
                        >
                          <span>{t(item.label)}</span>
                          <i
                            className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isServicesOpen ? 'rotate-180 text-blue-600' : ''
                              }`}
                          />
                        </button>
                        {isServicesOpen && (
                          <ul className="py-1 bg-white border-t border-gray-100">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.label}>
                                <a
                                  href={subItem.href}
                                  onClick={closeMobileNav}
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
              <div className="pt-4 space-y-2 border-t border-gray-100">
                {user ? (
                  <div className="flex gap-2">
                    <Link
                      to="/profile"
                      onClick={closeMobileNav}
                      className="flex-1 py-2 px-3 text-sm text-gray-700 bg-gray-50 border border-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-center"
                    >
                      <i className="fa-solid fa-user me-2"></i>
                      {t('header.profile')}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 py-2 px-3 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      <i className="fa-solid fa-right-from-bracket me-2"></i>
                      {t('header.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/Login"
                      onClick={closeMobileNav}
                      className="flex-1 py-2 px-3 text-sm text-center text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      {t('BUTTON.Login')}
                    </Link>
                    <Link
                      to="/Register"
                      onClick={closeMobileNav}
                      className="flex-1 py-2 px-3 text-sm text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      {t('BUTTON.Register')}
                    </Link>
                  </div>
                )}

                {/* Compact Language Selector */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-gray-600 transition-all duration-200 border border-gray-200 rounded-lg bg-gray-50 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <ReactCountryFlag countryCode="US" svg className="text-lg" />
                    <span className="text-sm font-medium">EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('vi')}
                    className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-gray-600 transition-all duration-200 border border-gray-200 rounded-lg bg-gray-50 hover:text-red-600 hover:bg-red-50"
                  >
                    <ReactCountryFlag countryCode="VN" svg className="text-lg" />
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
