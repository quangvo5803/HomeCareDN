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

  //Real time
  const handleNewNotification = (payload, titleKey) => {
    console.log("payload", payload);
    setNotifications(prev => {
      const exists = prev.some(n => n.notificationID === payload.notificationID);
      if (exists) return prev;
      return [{ ...payload, isRead: false }, ...prev];
    });
    toast.info(
      <div
        dangerouslySetInnerHTML={{
          __html: `<i class="fa-solid fa-bell text-orange-500 mr-1"></i> ${payload[titleKey]}`
        }}
      />,
      { position: 'top-right', autoClose: 3000 }
    );
  };

  useRealtime({
    [RealtimeEvents.NotificationCreated]: (payload) => handleNewNotification(payload, 'title'),
    [RealtimeEvents.NotificationApplicationUpdate]: (payload) => handleNewNotification(payload, 'title'),
    [RealtimeEvents.NotificationDeleted]: (notificationId) => {
      setNotifications(prev => prev.filter(n => n.notificationID !== notificationId));
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
          PageSize: 10
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
            <div className="flex-1 flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                placeholder={t('partnerDashboard.search_placeholder')}
              />
            </div>
            <NotificationPanel notifications={notifications} loading={loading} user={user} />
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
