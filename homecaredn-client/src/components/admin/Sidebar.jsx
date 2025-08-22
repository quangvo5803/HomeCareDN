import { useEffect, useRef } from "react";
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { useTranslation } from "react-i18next";
import { Title } from "chart.js";
import { useAuth } from "../../hook/useAuth";

export default function Sidebar() {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      const ps = new PerfectScrollbar(scrollRef.current, {
        wheelPropagation: true,
        suppressScrollX: true,
      });
      return () => ps.destroy();
    }
  }, []);
  const handleLogout = () => {
    logout();
  };
  var menuList = [
    {
      icon: "text-blue-500 fa-solid fa-tv",
      title: "dashboard",
      link: "#",
    },
    {
      icon: "text-red-500 fa-solid fa-code-pull-request",
      title: "service",
      link: "#",
    },
    {
      icon: "text-yellow-500 fa-solid fa-truck",
      title: "serviceRequest",
      link: "#",
    },
    {
      icon: "text-yellow-500 fa-solid fa-suitcase",
      title: "material",
      link: "#",
    },
  ];

  return (
    <aside
      className="fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200 -translate-x-full bg-white border-0 shadow-xl dark:shadow-none dark:bg-slate-850 max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0"
      aria-expanded="false"
    >
      <div className="h-19">
        <a
          className="block px-8 py-6 m-0 text-sm whitespace-nowrap dark:text-white text-slate-700"
          href="/pages/dashboard.html"
          target="_blank"
        >
          <img
            src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
            className="inline h-full max-w-full transition-all duration-200 dark:hidden ease-nav-brand max-h-8"
            alt="main_logo"
          />
          <span className="ml-1 font-semibold transition-all duration-200 ease-nav-brand">
            HomeCareDN
          </span>
        </a>
      </div>

      <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-white dark:to-transparent" />

      <div className="items-center block w-auto max-h-screen overflow-auto h-sidenav grow basis-full">
        <ul className="flex flex-col pl-0 mb-0">
          {menuList.map((menuItem) => {
            return (
              <li className="mt-0.5 w-full">
                <a
                  className="py-2.7 bg-blue-500/13 dark:text-white dark:opacity-80 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap rounded-lg px-4 font-semibold text-slate-700 transition-colors"
                  href={menuItem.link}
                >
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
                    <i
                      className={`relative top-0 text-xs leading-normal ${menuItem.icon}`}
                    ></i>
                  </div>
                  <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">
                    {t(`adminSidebar.menu.${menuItem.title}`)}
                  </span>
                </a>
              </li>
            );
          })}
          <li className="mt-0.5 w-full">
            <a
              className="py-2.7 bg-blue-500/13 dark:text-white dark:opacity-80 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap rounded-lg px-4 font-semibold text-slate-700 transition-colors"
              href=""
              onClick={handleLogout}
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
                <i
                  className={`relative top-0 text-xs leading-normal text-red-500 fa-solid fa-arrow-right-from-bracket`}
                ></i>
              </div>
              <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">
                {t("adminNavbar.logout")}
              </span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
