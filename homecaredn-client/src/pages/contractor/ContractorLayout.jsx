import { useTranslation } from 'react-i18next';
import MenuList from '../../components/partner/MenuList';
import AvatarMenu from '../../components/AvatarMenu';
import LanguageSwitch from '../../components/LanguageSwitch';
import NotificationBell from '../../components/NotificationBell';
import { Outlet } from 'react-router-dom';

export default function ContractorLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] bg-gray-50">
      <MenuList
        brand={{
          logoUrl:
            'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png',
          title: 'HomeCareDN',
          subtitleKey: 'partnerDashboard.contractor_portal',
        }}
      />

      <div className="flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                placeholder={t('partnerDashboard.search_placeholder')}
              />
            </div>
            <NotificationBell total={3} />
            <LanguageSwitch />
            <AvatarMenu />
          </div>
        </header>

        {/* Main content */}
        <main className="p-6 space-y-6">
          {/* Nơi render các trang con của contractor */}
          <Outlet />
        </main>

        <footer className="p-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} HomeCareDN
        </footer>
      </div>
    </div>
  );
}
