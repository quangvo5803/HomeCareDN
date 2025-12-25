import { useTranslation } from 'react-i18next';
import MenuList from '../../components/partner/MenuList';
import AvatarMenu from '../../components/AvatarMenu';
import LanguageSwitch from '../../components/LanguageSwitch';
import { Outlet } from 'react-router-dom';
import NotificationPanel from '../../components/NotificationPanel';
import { notificationService } from '../../services/notificationService';
import { toast } from 'react-toastify';
import { handleApiError } from '../../utils/handleApiError';
import { useAuth } from '../../hook/useAuth';
import { useEffect, useState } from 'react';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import useRealtime from '../../realtime/useRealtime';

export default function ContractorLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Real time
  const handleNewNotification = (payload) => {
    setNotifications((prev) => {
      const exists = prev.some(
        (n) => n.notificationID === payload.notificationID
      );
      if (exists) return prev;

      return [{ ...payload, isRead: false }, ...prev];
    });

  };

  useRealtime({
    [RealtimeEvents.NotificationCreated]: handleNewNotification,
    [RealtimeEvents.NotificationApplicationUpdate]: handleNewNotification,
    [RealtimeEvents.NotificationDeleted]: (notificationId) => {
      setNotifications((prev) =>
        prev.filter((n) => n.notificationID !== notificationId)
      );
    },
    [RealtimeEvents.NotificationServiceRequestDelete]: (payload) => {
      setNotifications(prev => {
        if (!payload?.notificationID) {
          return prev;
        }

        if (payload.pendingCount === 0) {
          return prev.filter(
            n => n.notificationID !== payload.notificationID
          );
        }
        return prev;
      });
    }
  });

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const result = await notificationService.getAllForContractor({
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
    <div className="flex min-h-screen bg-gray-50">
      <MenuList
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        brand={{
          logoUrl:
            'https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png',
          title: 'HomeCareDN',
          subtitleKey: 'partnerDashboard.contractor_portal',
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 p-4">
            {/* Menu Mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>

            <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-"></div>

            <NotificationPanel
              notifications={notifications}
              loading={loading}
              user={user}
            />
            <div className="hidden sm:block">
              <LanguageSwitch />
            </div>
            <AvatarMenu />
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 md:p-6 space-y-6 flex-1 overflow-x-hidden">
          {/* Nơi render các trang con của contractor */}
          <Outlet />
        </main>

        <footer className="p-6 text-center text-gray-500 text-xs md:text-sm">
          © {new Date().getFullYear()} HomeCareDN
        </footer>
      </div>
    </div>
  );
}
