import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hook/useAuth';
import ReactCountryFlag from 'react-country-flag';
import Avatar from 'react-avatar';
import NotificationPanel from './NotificationPanel';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import { RealtimeEvents } from '../realtime/realtimeEvents';
import useRealtime from '../realtime/useRealtime';

// Navigation data
const navItems = [
  { label: 'header.home', href: '/', type: 'link' },
  { label: 'header.about', href: '/About', type: 'link' },
  {
    label: 'header.services',
    href: '#',
    type: 'dropdown',
    submenu: [
      { label: 'header.construction', href: '/ItemViewAll?type=Construction' },
      { label: 'header.repair', href: '/ItemViewAll?type=Repair' },
      { label: 'header.material', href: '/ItemViewAll?type=Material', type: 'link' },
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

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Use realtime
  const handleNotification = (payload) => {
    const displayMessage =
      i18n.language === 'vi'
        ? payload.message
        : payload.messageEN || payload.message;
    setNotifications((prev) => {
      const exists = prev.some(
        (n) => n.notificationID === payload.notificationID
      );
      if (exists) return prev;
      return [{ ...payload, isRead: false }, ...prev];
    });

    toast.info(
      <div>
        <i className="fa-solid fa-bell text-orange-500 mr-1"></i>
        {displayMessage}
      </div>,
      {
        position: 'top-right',
        autoClose: 3000,
      }
    );
  };

  const handleDeleteNotification = (payload) => {
    if (!payload?.notificationID || payload.pendingCount !== 0) return;

    setNotifications(prev =>
      prev.filter(n => n.notificationID !== payload.notificationID)
    );
  };

  useRealtime({
    [RealtimeEvents.NotificationCreated]: handleNotification,
    [RealtimeEvents.NotificationApplicationCreate]: handleNotification,
    [RealtimeEvents.NotificationApplicationPaid]: handleNotification,
    [RealtimeEvents.NotificationDeleted]: (notificationId) => {
      setNotifications((prev) =>
        prev.filter((n) => n.notificationID !== notificationId)
      );
    },
    [RealtimeEvents.NotificationDistributorApplicationDelete]: handleDeleteNotification,
    [RealtimeEvents.NotificationContractorApplicationDelete]: handleDeleteNotification
  });

  // Close popovers when clicking outside / pressing Esc
  useEffect(() => {
    const onDown = (e) => {
      if (openLang && langRef.current && !langRef.current.contains(e.target)) {
        setOpenLang(false);
      }
      if (
        openAvatarMenu &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setOpenAvatarMenu(false);
      }
    };
    const onKey = (e) =>
      e.key === 'Escape' && (setOpenLang(false), setOpenAvatarMenu(false));
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openLang, openAvatarMenu]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const result = await notificationService.getAllForCustomer({
          FilterID: user.id,
          PageNumber: 1,
          PageSize: 10,
        });
        setNotifications(result.items);
      } catch (err) {
        toast.error(t(handleApiError(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [t, user]);

  return (
    <header
      id="top"
      className="sticky top-0 left-0 z-50 w-full border-b border-gray-100 shadow-sm bg-white/95 backdrop-blur-md"
    >
      <nav className="px-6 py-4 mx-auto max-w-screen-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center group" aria-label="Home">
            <div className="w-32 h-16 overflow-hidden transition-transform duration-300 rounded-xl group-hover:scale-110">
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
                alt="HomeCareDN Logo"
                className="object-contain w-full h-full"
              />
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="relative lg:w-[48%] flex items-center border-2 border-orange-200 rounded-full  transition-all">
            <div className="relative flex items-center border-r-2 border-orange-200 bg-white rounded-l-full">
              <select className="appearance-none py-3 pl-4 pr-10 bg-transparent text-gray-700 text-sm font-bold cursor-pointer focus:outline-none">
                <option>Material</option>
                <option>Repair</option>
                <option>Construction</option>
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none"></i>
            </div>
            <div className="relative flex-1 bg-white rounded-r-full">
              <input
                type="text"
                placeholder={t('header.search')}
                className="w-full py-3 pl-12 pr-4 bg-transparent focus:outline-none text-gray-700"
              />
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
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
                        className="relative font-medium text-gray-700 transition-colors duration-300 hover:text-blue-600 focus:outline-none"
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
            <div className="flex items-center gap-6">
              {user ? (
                <>
                  <NotificationPanel
                    notifications={notifications}
                    loading={loading}
                    user={user}
                  />
                  {/* Avatar menu */}
                  <div className="relative" ref={avatarRef}>
                    <button
                      type="button"
                      onClick={() => setOpenAvatarMenu((v) => !v)}
                      className="w-10 h-10 overflow-hidden transition-all border-2 border-gray-300 rounded-full hover:border-blue-500"
                      aria-haspopup="menu"
                      aria-expanded={openAvatarMenu}
                      title={t('partnerDashboard.account')}
                    >
                      <Avatar
                        name={user?.email || 'User'}
                        round={true}
                        size="100%"
                        className="object-cover w-full h-full"
                        color="orange"
                      />
                    </button>
                    {openAvatarMenu && (
                      <div
                        role="menu"
                        className="absolute right-0 z-50 mt-2 bg-white border rounded-lg shadow-lg w-44"
                      >
                        <Link
                          to="/Customer"
                          relative="path"
                          onClick={() => setOpenAvatarMenu(false)}
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <i className="fa-solid fa-user me-2"></i>
                          {t('header.profile')}
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                          role="menuitem"
                        >
                          <i className="fa-solid fa-right-from-bracket me-2"></i>
                          {t('header.logout')}
                        </button>
                      </div>
                    )}
                  </div>
                </>
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
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setOpenLang((v) => !v)}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 transition-all duration-300 border border-gray-300 rounded-full hover:text-blue-600 hover:bg-gray-50 hover:border-blue-500"
                  aria-haspopup="menu"
                  aria-expanded={openLang}
                >
                  <i className="fas fa-globe" />
                </button>
                {openLang && (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 w-40 p-2 mt-2 space-y-1 bg-white border rounded-lg shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() => changeLanguage('en')}
                      className="flex items-center w-full gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                      role="menuitem"
                    >
                      <ReactCountryFlag
                        countryCode="US"
                        svg
                        className="text-lg"
                      />
                      <span>English</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => changeLanguage('vi')}
                      className="flex items-center w-full gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                      role="menuitem"
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
                        className="flex items-center px-3 py-3 font-medium text-gray-700 transition-all duration-200 rounded-lg hover:text-blue-600 hover:bg-blue-50 group"
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
                                  className="block px-6 py-2 text-gray-600 transition-all duration-200 hover:text-blue-600 hover:bg-blue-50"
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
                      to="Customer"
                      onClick={closeMobileNav}
                      className="flex-1 px-3 py-2 text-sm text-center text-gray-700 transition-colors duration-200 border border-gray-600 rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                      <i className="fa-solid fa-user me-2"></i>
                      {t('header.profile')}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 px-3 py-2 text-sm text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700"
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
                      className="flex-1 px-3 py-2 text-sm text-center text-gray-700 transition-colors duration-200 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                      {t('BUTTON.Login')}
                    </Link>
                    <Link
                      to="/Register"
                      onClick={closeMobileNav}
                      className="flex-1 px-3 py-2 text-sm text-center text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
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
                    <ReactCountryFlag
                      countryCode="US"
                      svg
                      className="text-lg"
                    />
                    <span className="text-sm font-medium">EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('vi')}
                    className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-gray-600 transition-all duration-200 border border-gray-200 rounded-lg bg-gray-50 hover:text-red-600 hover:bg-red-50"
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
