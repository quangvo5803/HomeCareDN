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
import { useSearch } from '../hook/useSearch';
import LoadingComponent from './LoadingComponent';

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
      {
        label: 'header.material',
        href: '/ItemViewAll?type=Material',
        type: 'link',
      },
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

  const {
    fetchSearchMaterial,
    fetchSearchService,
    loading: searchLoading,
    getCombinedSuggestions,
    saveSearchTerm,
  } = useSearch();

  const [type, setType] = useState('Material');
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [results, setResults] = useState([]);
  const wrapperRef = useRef(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isDropdown, setIsDropdown] = useState(false);
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

    setNotifications((prev) =>
      prev.filter((n) => n.notificationID !== payload.notificationID)
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
    [RealtimeEvents.NotificationDistributorApplicationDelete]:
      handleDeleteNotification,
    [RealtimeEvents.NotificationContractorApplicationDelete]:
      handleDeleteNotification,
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowHistory(false);
        setSearchText('');
        setAiSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocusSearch = async () => {
    try {
      // Get combined suggestions (history + AI)
      const { history, aiSuggestions } = await getCombinedSuggestions(
        user?.id,
        type,
        i18n.language
      );

      setHistory(history);
      setAiSuggestions(aiSuggestions);
      setResults([]);
      setShowHistory(true);
    } catch (err) {
      console.error('[handleFocusSearch]', err);
      setShowHistory(true);
    }
  };

  // Realtime search
  const handleInputChange = async (e) => {
    const text = e.target.value;
    setSearchText(text);

    if (!text.trim()) {
      // Show suggestions again khi clear input
      const { history, aiSuggestions } = await getCombinedSuggestions(
        user?.id,
        type,
        i18n.language
      );
      setHistory(history);
      setAiSuggestions(aiSuggestions);
      setResults([]);
      return;
    }

    // Search for real results
    const params = {
      search: text,
      FinalSearch: true,
      SearchType: type,
      ...(user && { FilterID: user.id }),
    };

    try {
      const res =
        type === 'Material'
          ? await fetchSearchMaterial(params)
          : await fetchSearchService(params);

      setResults((res || []).slice(0, 5));
      setShowHistory(true);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSearch = async () => {
    const query = searchText.trim();
    if (!query) return;

    // Save search term
    await saveSearchTerm(user?.id, query, type);

    const params = {
      search: query,
      FinalSearch: false,
      SearchType: type,
      ...(user && { FilterID: user.id }),
    };

    try {
      if (type === 'Material') {
        await fetchSearchMaterial(params);
      } else {
        await fetchSearchService(params);
      }
      setShowHistory(false);
      navigate(`/ItemViewAll?type=${type}&search=${query}`);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSelectItem = async (item) => {
    const name = item.searchTerm || item.name || item.nameEN || item;
    if (!name) return;

    // Save search term
    await saveSearchTerm(user?.id, name, type);

    setSearchText(name);

    const params = {
      search: name,
      FinalSearch: false,
      SearchType: type,
      ...(user && { FilterID: user.id }),
    };

    try {
      if (type === 'Material') {
        await fetchSearchMaterial(params);
      } else {
        await fetchSearchService(params);
      }
      setShowHistory(false);
      navigate(`/ItemViewAll?type=${type}&search=${name}`);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const hasResults =
    results.length === 0 &&
    !history.some((item) =>
      (item.searchTerm || item.name || item.nameEN || item)
        .toLowerCase()
        .includes(searchText.toLowerCase())
    ) &&
    aiSuggestions.length === 0 &&
    searchText.trim().length > 0;

  let content;

  if (searchLoading) {
    content = (
      <div className="flex justify-center items-center py-12">
        <LoadingComponent />
      </div>
    );
  } else if (hasResults) {
    content = (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-gray-400">
        <i className="fas fa-search text-6xl" />
        <span className="text-sm font-medium">{t('header.noResult')}</span>
      </div>
    );
  } else {
    content = (
      <>
        {/* SEARCH RESULTS */}
        {results.length > 0 && (
          <div className="border-b border-gray-100">
            {results.map((item) => (
              <button
                key={item.materialID || item.serviceID}
                onMouseDown={() => handleSelectItem(item)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors duration-150 group w-full text-left"
              >
                {item.imageUrls?.[0] && (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
                  />
                )}
                <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">
                  {i18n.language === 'vi'
                    ? item.name
                    : item.nameEN || item.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* AI SUGGESTIONS */}
        {aiSuggestions.length > 0 && (
          <div className="border-b border-gray-100">
            {aiSuggestions.map((item) => (
              <button
                key={item}
                onMouseDown={() => handleSelectItem(item)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer 
                  hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
                transition-all duration-150 group bg-transparent border-0"
              >
                {item.imageUrls?.[0] ? (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-fire text-red-500 text-lg" />
                  </div>
                )}
                <span className="text-orange-600 font-medium group-hover:text-orange-700">
                  {i18n.language === 'vi'
                    ? item.name
                    : item.nameEN || item.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* SEARCH HISTORY */}
        {history.length > 0 && (
          <div>
            {history.map((item) => (
              <button
                key={item}
                onMouseDown={() => handleSelectItem(item)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left
                  hover:bg-gray-50 transition-colors duration-150 group 
                  bg-transparent border-0 cursor-pointer"
              >
                <i className="fas fa-history text-gray-400 group-hover:text-gray-600 transition-colors text-lg" />
                <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                  {item.searchTerm || item}
                </span>
              </button>
            ))}
          </div>
        )}
      </>
    );
  }

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
          <div
            ref={wrapperRef}
            className="relative w-full max-w-[500px] mx-auto"
          >
            {/* INPUT WRAPPER */}
            <div className="flex items-stretch bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
              {/* SELECT TYPE */}
              <div className="relative flex items-center bg-gradient-to-br from-blue-50 to-indigo-50 border-r border-gray-200">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  onClick={() => setIsDropdown(!isDropdown)}
                  onBlur={() => setIsDropdown(false)}
                  className="appearance-none py-4 pl-5 pr-12 bg-transparent text-gray-700 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset rounded-l-2xl transition-all"
                >
                  <option value="Material">{t('header.material')}</option>
                  <option value="Repair">{t('header.repair')}</option>
                  <option value="Construction">
                    {t('header.construction')}
                  </option>
                </select>
                <i
                  className={`
                    absolute right-3 top-1/2 -translate-y-1/2 
                    text-gray-600 pointer-events-none transition duration-200
                    ${isDropdown ? 'fa fa-chevron-up' : 'fa fa-chevron-down'}
                  `}
                ></i>
              </div>

              {/* INPUT */}
              <div className="relative flex-1 flex items-center">
                <i className="fas fa-search absolute left-5 text-gray-400 text-lg" />
                <input
                  type="text"
                  value={searchText}
                  onChange={handleInputChange}
                  onFocus={handleFocusSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('header.placeholder')}
                  className="w-full py-4 pl-14 pr-5 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* SEARCH BUTTON */}
              <button
                onClick={handleSearch}
                className="px-6 bg-orange-600 hover:bg-orange-700 cursor-pointer text-white font-semibold transition-colors duration-200 flex items-center justify-center"
              >
                <i className="fas fa-arrow-right text-lg" />
              </button>
            </div>

            {/* DROPDOWN HISTORY / RESULTS */}
            {showHistory && (
              <div className="absolute w-full bg-white shadow-2xl rounded-2xl z-50 mt-3 max-h-96 overflow-hidden border border-gray-100">
                <div className="max-h-96 overflow-y-auto">{content}</div>
              </div>
            )}
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
                {(() => {
                  const current = (i18n.language || 'en').startsWith('vi')
                    ? 'vi'
                    : 'en';
                  const flagCode = current === 'vi' ? 'VN' : 'US';
                  const label = current.toUpperCase();
                  return (
                    <button
                      type="button"
                      onClick={() => setOpenLang((v) => !v)}
                      className="flex items-center gap-2 h-9 px-3 rounded-full border border-gray-300 hover:border-blue-500 hover:bg-gray-50 transition-all"
                      aria-haspopup="menu"
                      aria-expanded={openLang}
                      title={t('partnerDashboard.change_language')}
                    >
                      <ReactCountryFlag
                        countryCode={flagCode}
                        svg
                        className="text-lg"
                      />
                      <span className="text-sm font-medium">{label}</span>
                      <i
                        className={`fas fa-chevron-down text-xs transition-transform ${
                          openLang ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  );
                })()}
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
                            className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
                              isServicesOpen ? 'rotate-180 text-blue-600' : ''
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
