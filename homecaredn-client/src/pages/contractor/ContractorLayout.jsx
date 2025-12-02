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
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real time
  const handleNewNotification = (payload) => {
    const titleKey = i18n.language === 'vi' ? 'title' : 'titleEN';

    const displayTitle =
      titleKey === 'titleEN' && !payload.titleEN
        ? payload.title
        : payload[titleKey];

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
        {displayTitle}
      </div>,
      {
        position: 'top-right',
        autoClose: 3000,
      }
    );
  };

  useRealtime({
    [RealtimeEvents.NotificationCreated]: handleNewNotification,
    [RealtimeEvents.NotificationApplicationUpdate]: handleNewNotification,
    [RealtimeEvents.NotificationDeleted]: (notificationId) => {
      setNotifications((prev) =>
        prev.filter((n) => n.notificationID !== notificationId)
      );
    },
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
            <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-"></div>
            <NotificationPanel
              notifications={notifications}
              loading={loading}
              user={user}
            />
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
