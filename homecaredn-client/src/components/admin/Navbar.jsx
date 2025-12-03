import { useAuth } from '../../hook/useAuth';
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from 'react-country-flag';
import React, { useState } from 'react';
import Avatar from 'react-avatar';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const [openLang, setOpenLang] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenLang(false);
  };
  const handleLogout = () => {
    logout();
  };
  return (
    <nav
      className="relative flex flex-wrap items-center justify-between px-0 py-2 mx-6 transition-all ease-in shadow-none duration-250 rounded-2xl lg:flex-nowrap lg:justify-start"
      data-navbar-main="true"
      data-navbar-scroll="false"
    >
      <div className="flex items-center justify-between w-full px-4 py-1 mx-auto flex-wrap-inherit">
        <div className="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto justify-end gap-4">
          {/* 🌐 Language Switcher */}
          <div className="relative z-500">
            <button
              onClick={() => setOpenLang(!openLang)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 bg-white border border-gray-300 hover:border-blue-500 rounded-full shadow-sm hover:text-blue-600 transition-all duration-300"
            >
              <i className="fas fa-globe"></i>
            </button>
            {openLang && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border p-2 space-y-1">
                <button
                  onClick={() => changeLanguage('en')}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
                >
                  <ReactCountryFlag countryCode="US" svg className="text-lg" />
                  <span>English</span>
                </button>
                <button
                  onClick={() => changeLanguage('vi')}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md"
                >
                  <ReactCountryFlag countryCode="VN" svg className="text-lg" />
                  <span>Tiếng Việt</span>
                </button>
              </div>
            )}
          </div>

          {/* 👤 Avatar */}
          {/* 👤 Avatar + Logout */}
          <div className="relative z-500">
            <button
              onClick={() => setOpenAvatar(!openAvatar)}
              className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 hover:border-blue-500 transition-all duration-300"
            >
              <Avatar
                name="admin"
                round={true}
                size="100%"
                color="orange"
                className="w-full h-full object-cover"
              />
            </button>

            {/* Dropdown Logout */}
            {openAvatar && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border min-w-[150px]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md whitespace-nowrap"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>{t('adminNavbar.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
