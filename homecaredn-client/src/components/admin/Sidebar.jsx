import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hook/useAuth';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };
  const menuList = [
    {
      icon: 'text-indigo-600 fa-solid fa-tv',
      title: 'dashboard',
      link: '/Admin',
    },
    {
      icon: 'text-orange-600 fa-solid fa-star',
      title: 'brand',
      link: '/Admin/BrandManager',
    },
    {
      icon: 'text-blue-600 fa-solid fa-tags',
      title: 'category',
      link: '/Admin/CategoryManager',
    },
    {
      icon: 'text-rose-600 fa-solid fa-gear',
      title: 'service',
      link: '/Admin/ServiceManager',
    },
    {
      icon: 'text-amber-600 fa-solid fa-truck',
      title: 'serviceRequest',
      link: '/Admin/ServiceRequest',
    },
    {
      icon: 'text-orange-600 fa-solid fa-suitcase',
      title: 'material',
      link: '/Admin/Material',
    },
    {
      icon: 'text-purple-600 fa-solid fa-handshake', // Icon handshake màu tím
      title: 'partner',                              // Key cho i18n translation
      link: '/Admin/PartnerManager',                 // Link tới trang Partner Manager
  },
    {
      icon: 'text-emerald-600 fa-solid fa-headset',
      title: 'support',
      link: '/Admin/SupportManager',
    },
  ];

  return (
    <aside className="fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200 -translate-x-full bg-white border-0 shadow-xl max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0">
      <div className="h-20 flex items-center justify-center">
        <a
          className="block m-0 text-sm whitespace-nowrap text-slate-700"
          href="/Admin"
        >
          <img
            src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
            className="h-12 transition-all duration-200 ease-nav-brand"
            alt="main_logo"
          />
        </a>
      </div>

      <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent " />

      <div className="items-center block w-auto max-h-screen overflow-auto h-sidenav grow basis-full">
        <ul className="flex flex-col pl-0 mb-0 mt-5">
          {menuList.map((menuItem) => {
            return (
              <li key={menuItem.title} className="mt-0.5 w-full">
                <NavLink
                  to={menuItem.link}
                  end={menuItem.link === '/Admin'} // chỉ active root dashboard
                  className={({ isActive }) =>
                    `py-3 my-0 mx-2 flex items-center whitespace-nowrap rounded-lg px-4 font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-700 hover:bg-blue-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
                        <i
                          className={`${menuItem.icon} ${
                            isActive ? 'text-white' : ''
                          } relative top-0 leading-normal`}
                        ></i>
                      </div>
                      <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">
                        {t(`adminSidebar.menu.${menuItem.title}`)}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
          <li className="mt-0.5 w-full">
            <button
              className="py-3 my-0 mx-2 flex items-center whitespace-nowrap rounded-lg px-4 font-semibold text-slate-700 hover:bg-blue-100 transition-colors"
              onClick={handleLogout}
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
                <i
                  className={`relative top-0 leading-normal text-red-500 fa-solid fa-arrow-right-from-bracket`}
                ></i>
              </div>
              <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">
                {t('adminNavbar.logout')}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
