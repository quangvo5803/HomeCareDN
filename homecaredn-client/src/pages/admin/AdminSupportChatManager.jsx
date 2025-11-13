import {
  useEffect,
  useState,
  useContext,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useAuth } from '../../hook/useAuth';
import { handleApiError } from '../../utils/handleApiError';
import { conversationService } from '../../services/conversationService';
import { chatMessageService } from '../../services/chatMessageService';
import useRealtime from '../../realtime/useRealtime';
import RealtimeContext from '../../realtime/RealtimeContext';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import notificationSoundFile from '../../assets/sounds/notification.mp3';

const MESSAGE_SIZE = 10;

export default function AdminSupportChatManager() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { chatConnection } = useContext(RealtimeContext);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [filter, setFilter] = useState('');

  const [moreMessage, setMoreMessage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessage, setLoadingMoreMessage] = useState(false);
  const messagesContainerRef = useRef(null);
  const adminGroupJoinedRef = useRef(false);
  const notificationSound = useRef(new Audio(notificationSoundFile));
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  useEffect(() => {
    if (!user?.id || !chatConnection || adminGroupJoinedRef.current) return;

    let retryTimer = null;
    let isComponentMounted = true; // Track component

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
    };
  }, [user?.id, chatConnection, t]);

  // Realtime messages
  useRealtime(
    {
      [RealtimeEvents.ChatMessageCreated]: (message) => {
        if (message.conversationID === selectedConversation?.conversationID) {
          setMessages((prev) => {
            if (prev.some((m) => m.chatMessageID === message.chatMessageID))
              return prev;
            return [...prev, message];
          });
        }
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
              messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      },
      [RealtimeEvents.NewConversationForAdmin]: (payload) => {
        if (!payload.conversation?.conversationID) {
          return;
        }

        const newConversation = payload.conversation;

        setConversations((prev) => {
          if (
            prev.some(
              (c) => c.conversationID === newConversation.conversationID
            )
          ) {
            return prev;
          }
          return [newConversation, ...prev];
        });

        toast.success(t('adminSupportChatManager.newConversation'), {
          onClick: () => setSelectedConversation(newConversation),
        });
        notificationSound.current.play().catch(() => {});
      },

      [RealtimeEvents.NewAdminMessage]: (payload) => {
        if (!user?.id) return;

        conversationService
          .getAllConversationsByAdminID(user.id)
          .then((items) => {
            setConversations([...items]);
          });

        if (payload.ConversationID === selectedConversation?.conversationID) {
          setMessages((prev) => {
            if (
              prev.some(
                (m) => m.chatMessageID === payload.Message.chatMessageID
              )
            )
              return prev;
            return [...prev, payload.Message];
          });
        }
      },
    },
    'chat'
  );

  // Load conversation list
  useEffect(() => {
    if (!user?.id || !chatConnection) return;
    setLoadingConversation(true);
    conversationService
      .getAllConversationsByAdminID(user.id)
      .then((items) => setConversations(items || []))
      .catch((error) => toast.error(t(handleApiError(error))))
      .finally(() => setLoadingConversation(false));
  }, [user?.id, chatConnection, t]);

  // Load message
  const loadMessages = useCallback(
    async (messageToLoad, append = false) => {
      if (!selectedConversation) return;

      try {
        if (append) setLoadingMoreMessage(true);
        else setLoadingMessage(true);

        const conversation =
          await chatMessageService.getMessagesByConversationID({
            conversationID: selectedConversation.conversationID,
            messageNumber: messageToLoad,
            messageSize: MESSAGE_SIZE,
          });

        const items = conversation.items || [];

        setHasMoreMessages(
          items.length === MESSAGE_SIZE &&
            messages.length + items.length < (conversation.totalCount || 0)
        );

        if (append) {
          setMessages((prev) => [...items, ...prev]);
        } else {
          setMessages(items || []);
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setLoadingMessage(false);
        setLoadingMoreMessage(false);
      }
    },
    [selectedConversation, t, messages.length]
  );

  // Load messages when select conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setMoreMessage(1);
      setHasMoreMessages(true);
      return;
    }
    if (chatConnection) {
      chatConnection.invoke(
        'JoinConversation',
        selectedConversation.conversationID
      );
    }
    setLoadingMessage(true);
    loadMessages(1, false);
    return () => {
      if (chatConnection && selectedConversation) {
        chatConnection
          .invoke('LeaveConversation', selectedConversation.conversationID)
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, chatConnection]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || loadingMoreMessage || !hasMoreMessages) return;

    if (container.scrollTop === 0) {
      const nextMessage = moreMessage + 1;
      setMoreMessage(nextMessage);

      const scrollHeightBefore = container.scrollHeight;

      loadMessages(nextMessage, true).then(() => {
        requestAnimationFrame(() => {
          const scrollHeightAfter = container.scrollHeight;
          container.scrollTop = scrollHeightAfter - scrollHeightBefore;
        });
      });
    }
  }, [loadingMoreMessage, hasMoreMessages, moreMessage, loadMessages]);

  // Send message
  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversation || !user?.id) return;
    try {
      await chatMessageService.sendMessage({
        content: messageInput,
        senderID: user.id,
        receiverID: selectedConversation.userID,
        conversationID: selectedConversation.conversationID,
      });
      setMessageInput('');
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!filter) return conversations;
    return conversations.filter((conversation) =>
      conversation.userID.toLowerCase().includes(filter.toLowerCase())
    );
  }, [conversations, filter]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-md p-5 mb-5 text-white">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <i className="fa-solid fa-headset"></i>
          {t('adminSupportChatManager.title')}
        </h2>
        <p className="text-sm opacity-90 mt-1">
          {t('adminSupportChatManager.subtitle')}
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-5 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white rounded-2xl shadow-md border flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-list text-indigo-500"></i>
              {t('adminSupportChatManager.conversationList')}
            </h4>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('adminSupportChatManager.searchUser')}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100">
            {loadingConversation ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
              </div>
            ) : filteredConversations.length > 0 ? (
              <ul className="divide-y">
                {filteredConversations.map((conversation) => (
                  <li
                    key={conversation.conversationID}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer transition-all hover:bg-indigo-50 ${
                      conversation.conversationID ===
                      selectedConversation?.conversationID
                        ? 'bg-indigo-100 border-l-4 border-indigo-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {conversation.userID.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-800">
                          {conversation.userID.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <i className="fa-regular fa-inbox text-4xl mb-2"></i>
                <p className="text-sm">
                  {t('adminSupportChatManager.noConversations')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-md border flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center gap-3 bg-gray-50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedConversation.userID.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">
                    {selectedConversation.userID.slice(0, 8)}
                  </h3>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 bg-gray-50"
              >
                {loadingMessage ? (
                  <div className="flex items-center justify-center h-full">
                    <i className="fa-solid fa-spinner fa-spin text-3xl text-gray-400"></i>
                  </div>
                ) : (
                  <>
                    {/* Loading more messages */}
                    {loadingMoreMessage && (
                      <div className="flex justify-center py-2 mb-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-600">
                          <i className="fas fa-spinner fa-spin text-indigo-500"></i>
                          {t('adminSupportChatManager.loadingMore')}
                        </span>
                      </div>
                    )}

                    {/* No more messages */}
                    {!hasMoreMessages && messages.length > 0 && (
                      <div className="text-center py-2 mb-3">
                        <span className="inline-block text-xs text-gray-400 px-3 py-1 rounded-full border border-gray-200 bg-white">
                          {t('adminSupportChatManager.noMoreMessages')}
                        </span>
                      </div>
                    )}

                    {/* Messages List */}
                    {messages.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {messages.map((msg) => {
                          const isAdmin = msg.senderID === user.id;
                          return (
                            <div
                              key={msg.chatMessageID}
                              className={`flex ${
                                isAdmin ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div className="flex flex-col max-w-[70%]">
                                <div
                                  className={`px-4 py-2 rounded-2xl ${
                                    isAdmin
                                      ? 'bg-indigo-600 text-white rounded-br-sm'
                                      : 'bg-white border text-gray-800 rounded-bl-sm'
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed">
                                    {msg.content}
                                  </p>
                                </div>
                                <p
                                  className={`text-[10px] text-gray-400 mt-1 ${
                                    isAdmin ? 'text-right' : 'text-left'
                                  }`}
                                >
                                  {new Date(msg.sentAt).toLocaleTimeString(
                                    'vi-VN',
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <i className="fa-regular fa-comments text-4xl"></i>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-4 border-t bg-white flex gap-3"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t('adminSupportChatManager.inputPlaceholder')}
                  className="flex-1 border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  {t('adminSupportChatManager.send')}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
              <i className="fa-solid fa-comments text-6xl mb-4"></i>
              <p className="text-lg">
                {t('adminSupportChatManager.selectConversation')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
