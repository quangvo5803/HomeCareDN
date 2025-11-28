import Sidebar from '../../components/admin/Sidebar';
import Navbar from '../../components/admin/Navbar';
import Footer from '../../components/admin/Footer';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useContext, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import RealtimeContext from '../../realtime/RealtimeContext';
import useRealtime from '../../realtime/useRealtime';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import { useAuth } from '../../hook/useAuth';
import { handleApiError } from '../../utils/handleApiError';
import { conversationService } from '../../services/conversationService';
import notificationSoundNewConvesation from '../../assets/sounds/notification.mp3';
import notificationSoundNewMessage from '../../assets/sounds/message.mp3';

export default function AdminLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { chatConnection, chatConnectionState } = useContext(RealtimeContext);
  const location = useLocation();

  // State lưu số lượng chưa đọc
  const [unreadCount, setUnreadCount] = useState(0);
  const activeConversationIdRef = useRef(null);
  const setActiveConversationId = useCallback((id) => {
    activeConversationIdRef.current = id;
  }, []);

  const adminGroupJoinedRef = useRef(false);
  const notificationNewConvesation = useRef(
    new Audio(notificationSoundNewConvesation)
  );
  const notificationNewMessage = useRef(new Audio(notificationSoundNewMessage));

  const pendingNewConversations = useRef(0);
  const pendingNewMessages = useRef(0);

  const notificationTimerRef = useRef(null);

  // Unread Conversation Count
  const fetchUnreadCount = async () => {
    if (user?.id) {
      try {
        const count = await conversationService.getUnreadConversationCount(
          user.id
        );
        setUnreadCount(count);
      } catch (error) {
        toast.error(t(handleApiError(error)));
      }
    }
  };

  const increaseUnreadCount = useCallback(() => {
    setUnreadCount((prev) => {
      const newCount = prev + 1;
      return newCount;
    });
  }, []);

  const decreaseUnreadCount = useCallback(() => {
    setUnreadCount((prev) => {
      const newCount = Math.max(0, prev - 1);
      return newCount;
    });
  }, []);

  const showGroupedNotification = useCallback(() => {
    const convCount = pendingNewConversations.current;
    const msgCount = pendingNewMessages.current;

    if (convCount > 0) {
      if (convCount === 1) {
        toast.success(t('adminSupportChatManager.newConversation'), {
          autoClose: 3000,
          position: 'top-right',
        });
      } else {
        toast.success(
          t('adminSupportChatManager.newConversations', { count: convCount }),
          {
            autoClose: 3000,
            position: 'top-right',
          }
        );
      }

      notificationNewConvesation.current.play().catch(() => {});
      pendingNewConversations.current = 0;
    }

    if (msgCount > 0) {
      if (msgCount === 1) {
        toast.info(t('adminSupportChatManager.newMessage'), {
          autoClose: 3000,
          position: 'top-right',
        });
      } else {
        toast.info(
          t('adminSupportChatManager.newMessages', { count: msgCount }),
          {
            autoClose: 3000,
            position: 'top-right',
          }
        );
      }

      notificationNewMessage.current.play().catch(() => {});
      pendingNewMessages.current = 0;
    }
  }, [t]);
  useEffect(() => {
    fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Logic Join Group
  useEffect(() => {
    if (!user?.id || !chatConnection || adminGroupJoinedRef.current) return;

    let retryTimer = null;
    let isComponentMounted = true;

    const JoinConversation = async () => {
      if (!isComponentMounted || adminGroupJoinedRef.current) return;

      if (chatConnection.state === 'Connected') {
        try {
          await chatConnection.invoke('JoinAdminGroup', user.id);
          adminGroupJoinedRef.current = true;
        } catch (error) {
          toast.error(t(handleApiError(error)));
          if (isComponentMounted) {
            retryTimer = setTimeout(JoinConversation, 500);
          }
        }
        return;
      }
      retryTimer = setTimeout(JoinConversation, 300);
    };

    retryTimer = setTimeout(JoinConversation, 100);

    const handleReconnected = () => {
      adminGroupJoinedRef.current = false;
      if (isComponentMounted) {
        retryTimer = setTimeout(JoinConversation, 100);
      }
    };

    if (chatConnection.onreconnected) {
      chatConnection.onreconnected(handleReconnected);
    }

    return () => {
      isComponentMounted = false;
      if (retryTimer) clearTimeout(retryTimer);

      if (
        adminGroupJoinedRef.current &&
        chatConnection?.state === 'Connected'
      ) {
        chatConnection
          .invoke('LeaveAdminGroup', user.id)
          .then(() => {
            adminGroupJoinedRef.current = false;
          })
          .catch(() => {});
      }
      if (chatConnectionState !== 'Connected' && adminGroupJoinedRef.current) {
        adminGroupJoinedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, chatConnection, chatConnectionState]);

  useRealtime(
    {
      [RealtimeEvents.NewConversationForAdmin]: (payload) => {
        increaseUnreadCount();

        const isOnChatPage = location.pathname.includes(
          '/Admin/SupportChatManager'
        );

        if (!isOnChatPage) {
          if (!user?.id || payload.senderID === user.id) {
            return;
          }

          pendingNewConversations.current += 1;
          if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
          }

          notificationTimerRef.current = setTimeout(() => {
            showGroupedNotification();
          }, 2000);
        }
      },

      [RealtimeEvents.NewAdminMessage]: (payload) => {
        const isViewing =
          activeConversationIdRef.current === payload.conversationID;

        if (!isViewing && !payload.isAdminRead) {
          fetchUnreadCount();
        }

        const isOnChatPage = location.pathname.includes(
          '/Admin/SupportChatManager'
        );

        if (!isOnChatPage) {
          const msg = payload.message;

          if (!user?.id || msg?.senderID === user.id) {
            return;
          }

          pendingNewMessages.current += 1;

          if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
          }

          notificationTimerRef.current = setTimeout(() => {
            showGroupedNotification();
          }, 2000);
        }
      },
    },
    'chat'
  );
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
        notificationTimerRef.current = null;
      }

      if (
        pendingNewConversations.current > 0 ||
        pendingNewMessages.current > 0
      ) {
        showGroupedNotification();
      }
    };
  }, [showGroupedNotification]);
  return (
    <div className="flex flex-col min-h-screen font-sans text-base antialiased font-normal leading-default bg-gray-50 text-slate-500">
      <div className="absolute w-full bg-blue-500 min-h-75"></div>
      <Sidebar unreadCount={unreadCount} />
      <div className="relative flex-1 transition-all duration-200 ease-in-out xl:ml-68 rounded-xl flex flex-col">
        <Navbar />
        <div className="w-full px-6 py-6 mx-auto flex-1">
          {/* Nơi render các trang con của admin */}
          <Outlet
            context={{
              fetchUnreadCount,
              decreaseUnreadCount,
              setActiveConversationId,
            }}
          />
        </div>
        <Footer />
      </div>
    </div>
  );
}
