import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';
import { handleApiError } from '../../utils/handleApiError';
import PropTypes from 'prop-types';
import { conversationService } from '../../services/conversationService';
import { chatMessageService } from '../../services/chatMessageService';
import useRealtime from '../../realtime/useRealtime';
import RealtimeContext from '../../realtime/RealtimeContext';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useDebounce } from 'use-debounce';
import notificationSoundNewConvesation from '../../assets/sounds/notification.mp3';
import notificationSoundNewMessage from '../../assets/sounds/message.mp3';

function RoleBadgeColors({ role }) {
  const { t } = useTranslation();
  const roleColors = {
    Customer: 'bg-blue-100 text-blue-700',
    Contractor: 'bg-emerald-100 text-emerald-700',
    Distributor: 'bg-purple-100 text-purple-700',
  };
  const translatedRole = t(`adminSupportChatManager.roles.${role}`);
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${roleColors[role]}`}
    >
      {translatedRole}
    </span>
  );
}
RoleBadgeColors.propTypes = {
  role: PropTypes.string,
};

const MESSAGE_SIZE = 10;
const CONVERSATION_SIZE = 7;

export default function AdminSupportChatManager() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { chatConnection } = useContext(RealtimeContext);
  const { state } = useLocation();
  const { fetchUnreadCount, decreaseUnreadCount, setActiveConversationId } =
    useOutletContext();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 1000);

  const [moreMessage, setMoreMessage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessage, setLoadingMoreMessage] = useState(false);

  const [conversationPage, setConversationPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [loadingMoreConversations, setLoadingMoreConversations] =
    useState(false);
  const [preselectedUserID, setPreselectedUserID] = useState(
    state?.preselectedUserID
  );

  const messagesContainerRef = useRef(null);
  const conversationListRef = useRef(null);

  const notificationNewConvesation = useRef(
    new Audio(notificationSoundNewConvesation)
  );
  const notificationNewMessage = useRef(new Audio(notificationSoundNewMessage));

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
        if (!user?.id || payload.senderID === user.id) {
          return;
        }
        const newConversation = payload.conversation;

        newConversation.isAdminRead = false;
        newConversation.adminUnreadMessageCount = 1;

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
        toast.success(t('adminSupportChatManager.newConversation'));
        notificationNewConvesation.current.play().catch(() => {});
      },

      [RealtimeEvents.NewAdminMessage]: (payload) => {
        if (!user?.id) return;

        const isViewing =
          payload.conversationID === selectedConversation?.conversationID;

        if (isViewing) {
          conversationService
            .markAsRead(payload.conversationID)
            .then(() => {
              if (decreaseUnreadCount && !payload.isAdminRead) {
                decreaseUnreadCount();
              }
            })
            .catch(() => {});
        } else {
          const msg = payload.message;
          if (msg?.senderID === user.id) {
            return;
          }
          toast.info(t('adminSupportChatManager.newMessage'));
          notificationNewMessage.current.play().catch(() => {});
        }
        setConversations((prev) => {
          const index = prev.findIndex(
            (c) => c.conversationID === payload.conversationID
          );

          if (index === -1) return prev;

          const currentConversation = prev[index];

          let newAdminUnreadCount;
          let newIsAdminRead;

          if (isViewing) {
            newAdminUnreadCount = 0;
            newIsAdminRead = true;
          } else {
            newAdminUnreadCount =
              (currentConversation.adminUnreadMessageCount || 0) + 1;
            newIsAdminRead = false;
          }

          const updatedConversation = {
            ...currentConversation,
            adminUnreadMessageCount: newAdminUnreadCount,
            isAdminRead: newIsAdminRead,
          };

          const filtered = prev.filter(
            (c) => c.conversationID !== payload.conversationID
          );
          return [updatedConversation, ...filtered];
        });
      },
    },
    'chat'
  );

  // Handle preselected user chat
  useEffect(() => {
    if (!preselectedUserID || !user?.id || !chatConnection) return;

    const addConversationIfNotExists = (conversation) => {
      setConversations((prev) => {
        const exists = prev.some(
          (c) => c.conversationID === conversation.conversationID
        );
        return exists ? prev : [conversation, ...prev];
      });
    };

    const createVirtualConversation = () => ({
      conversationID: null,
      userID: preselectedUserID,
      adminID: user.id,
      userEmail: state?.userEmail,
      userName: state?.userName,
      userRole: state?.userRole,
      isAdminRead: true,
      adminUnreadMessageCount: 0,
      createdAt: new Date().toISOString(),
      isVirtual: true,
    });

    const initializePreselectedChat = async () => {
      try {
        const existingConv = await conversationService.getConversationByUserID(
          preselectedUserID
        );

        if (existingConv) {
          addConversationIfNotExists(existingConv);
          await handleSelectConversation(existingConv);
        } else {
          const virtualConv = createVirtualConversation();

          setConversations((prev) => [virtualConv, ...prev]);
          setSelectedConversation(virtualConv);
          setMessages([]);
        }
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setPreselectedUserID(null);
      }
    };

    initializePreselectedChat();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedUserID, user?.id, chatConnection, state, t]);

  useEffect(() => {
    if (setActiveConversationId) {
      setActiveConversationId(selectedConversation?.conversationID);
    }
    return () => {
      if (setActiveConversationId) setActiveConversationId(null);
    };
  }, [selectedConversation, setActiveConversationId]);

  //Load conversations
  const loadConversations = useCallback(
    async (conversationToLoad, append = false) => {
      if (!user?.id) return;

      try {
        if (append) setLoadingMoreConversations(true);
        else setLoadingConversation(true);

        const conversationData =
          await conversationService.getAllConversationsByAdminID({
            adminID: user.id,
            conversationNumber: conversationToLoad,
            conversationSize: CONVERSATION_SIZE,
            search: debouncedSearch,
          });

        const isLastPage = conversationData.items.length < CONVERSATION_SIZE;
        const totalFetched = conversationToLoad * CONVERSATION_SIZE;
        const hasMore =
          !isLastPage && totalFetched < conversationData.totalCount;

        setHasMoreConversations(hasMore);

        if (append) {
          setConversations((prev) => [...prev, ...conversationData.items]);
        } else {
          setConversations(conversationData.items || []);
        }
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setLoadingConversation(false);
        setLoadingMoreConversations(false);
      }
    },
    [user?.id, t, debouncedSearch]
  );

  //Load conversation list
  useEffect(() => {
    if (!user?.id || !chatConnection) return;
    setConversationPage(1);
    loadConversations(1, false);
  }, [user?.id, chatConnection, debouncedSearch, loadConversations]);

  // Sync selected conversation with real conversation from list
  useEffect(() => {
    if (!selectedConversation || conversations.length === 0) return;
    const realConversation = conversations.find((c) => {
      if (
        selectedConversation.conversationID &&
        c.conversationID === selectedConversation.conversationID
      ) {
        return true;
      }
      if (
        selectedConversation.isVirtual &&
        c.userID === selectedConversation.userID
      ) {
        return true;
      }
      return false;
    });

    if (realConversation && realConversation !== selectedConversation) {
      setSelectedConversation(realConversation);
    }
  }, [conversations, selectedConversation]);

  // Infinite scroll for conversations
  const handleScrollConversations = useCallback(() => {
    const container = conversationListRef.current;
    if (!container || loadingMoreConversations || !hasMoreConversations) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1) {
      const nextPage = conversationPage + 1;
      setConversationPage(nextPage);
      loadConversations(nextPage, true);
    }
  }, [
    loadingMoreConversations,
    hasMoreConversations,
    conversationPage,
    loadConversations,
  ]);

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

        const isLastPage = items.length < MESSAGE_SIZE;
        const totalFetched = messageToLoad * MESSAGE_SIZE;
        const hasMore = !isLastPage && totalFetched < conversation.totalCount;

        setHasMoreMessages(hasMore);

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
    [selectedConversation, t]
  );

  // Load messages when select conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setMoreMessage(1);
      setHasMoreMessages(true);
      return;
    }

    if (selectedConversation.isVirtual) {
      setMessages([]);
      setLoadingMessage(false);
      setHasMoreMessages(false);
    } else {
      if (chatConnection) {
        chatConnection.invoke(
          'JoinConversation',
          selectedConversation.conversationID
        );
      }

      setLoadingMessage(true);
      loadMessages(1, false);
    }

    return () => {
      if (
        chatConnection &&
        selectedConversation &&
        !selectedConversation.isVirtual
      ) {
        chatConnection
          .invoke('LeaveConversation', selectedConversation.conversationID)
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, chatConnection]);

  // Infinite scroll message handler
  const handleScrollMessage = useCallback(() => {
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

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);

    if (conversation.adminUnreadMessageCount > 0 || !conversation.isAdminRead) {
      try {
        await conversationService.markAsRead(conversation.conversationID);

        if (decreaseUnreadCount) {
          decreaseUnreadCount();
        }
      } catch (error) {
        if (fetchUnreadCount) {
          fetchUnreadCount();
        }
        toast.error(t(handleApiError(error)));
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationID === conversation.conversationID
            ? { ...c, adminUnreadMessageCount: 0, isAdminRead: true }
            : c
        )
      );
    }
  };

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

  // Send message for virtual conversations
  const handleSendVirtual = async () => {
    if (!messageInput.trim() || !selectedConversation || !user?.id) return;

    try {
      const result = await chatMessageService.sendMessageToUser({
        conversationID: null,
        content: messageInput,
        senderID: user.id,
        receiverID: selectedConversation.userID,
      });

      if (result.conversationID) {
        const updatedConv = {
          ...selectedConversation,
          conversationID: result.conversationID,
          isVirtual: false,
        };

        setSelectedConversation(updatedConv);

        setConversations((prev) =>
          prev.map((c) =>
            c.userID === selectedConversation.userID && c.isVirtual
              ? updatedConv
              : c
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 300));

        if (chatConnection) {
          try {
            await chatConnection.invoke(
              'JoinConversation',
              result.conversationID
            );
          } catch (error) {
            toast.error(t(handleApiError(error)));
          }
        }
      }

      setMessageInput('');
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  // Wrapper function send message
  const handleSendMessage = () => {
    if (selectedConversation?.isVirtual) {
      handleSendVirtual();
    } else {
      handleSend();
    }
  };

  const renderConversationList = () => {
    if (loadingConversation) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
        </div>
      );
    }

    if (conversations.length > 0) {
      return (
        <>
          <ul className="divide-y">
            {conversations.map((conversation) => (
              <li key={conversation.conversationID}>
                <button
                  type="button"
                  onClick={() => handleSelectConversation(conversation)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectConversation(conversation);
                    }
                  }}
                  className={`w-full text-left p-4 cursor-pointer transition-all hover:bg-indigo-50 ${
                    conversation.conversationID ===
                    selectedConversation?.conversationID
                      ? 'bg-indigo-100 border-l-4 border-orange-500'
                      : ''
                  }`}
                  aria-label={`${t(
                    'adminSupportChatManager.selectConversation'
                  )}: ${conversation.userEmail}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold">
                          {conversation.userEmail?.charAt(0).toUpperCase()}
                        </div>

                        {conversation.isAdminRead === false && (
                          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-800">
                          {conversation?.userEmail}
                        </p>
                        {conversation?.userName && (
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.userName}
                          </p>
                        )}
                        {conversation?.userRole && (
                          <RoleBadgeColors role={conversation.userRole} />
                        )}
                      </div>
                    </div>

                    {/* Display Badge based on correct property */}
                    {conversation.adminUnreadMessageCount > 0 && (
                      <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conversation.adminUnreadMessageCount > 9
                          ? '9+'
                          : conversation.adminUnreadMessageCount}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {loadingMoreConversations && (
            <div className="flex flex-col items-center justify-center py-3">
              <i className="fa-solid fa-spinner fa-spin text-orange-500 text-lg mb-1"></i>
              <span className="text-xs text-gray-600">
                {t('adminSupportChatManager.loadingMoreConversation')}
              </span>
            </div>
          )}

          {!hasMoreConversations && conversations.length > 0 && (
            <div className="text-center py-3 text-xs text-gray-400">
              {t('adminSupportChatManager.noMoreConversations')}
            </div>
          )}
        </>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <i className="fa-regular fa-inbox text-4xl mb-2"></i>
        <p className="text-sm">
          {/* Message when searching */}
          {search
            ? t('adminSupportChatManager.noSearchResults')
            : t('adminSupportChatManager.noConversations')}
        </p>
      </div>
    );
  };
  const formatTimestamp = (sentAt) => {
    if (!sentAt) return '';

    const date = new Date(sentAt.endsWith('Z') ? sentAt : sentAt + 'Z');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md p-5 mb-5 text-white">
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
        <div className="w-80 bg-white rounded-xl shadow-md border flex flex-col overflow-hidden">
          <div className="p-3 border-b bg-gray-50">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-list text-orange-500"></i>
              {t('adminSupportChatManager.conversationList')}
            </h4>
            {/* Search input */}
            <div className="relative group">
              <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-hover:text-orange-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('adminSupportChatManager.searchUser')}
                className="w-full border rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none hover:border-orange-300 transition-all"
              />
            </div>
          </div>
          <div
            ref={conversationListRef}
            onScroll={handleScrollConversations}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100"
          >
            {renderConversationList()}
          </div>
        </div>

        {/* Right */}
        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-xl shadow-md border flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center gap-3 bg-gray-50 ">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedConversation?.userEmail?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">
                    {selectedConversation?.userEmail}
                  </h3>
                  {selectedConversation?.userName && (
                    <p className="text-xs text-gray-500">
                      {selectedConversation?.userName}
                    </p>
                  )}
                  {selectedConversation?.userRole && (
                    <RoleBadgeColors role={selectedConversation.userRole} />
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScrollMessage}
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
                          <i className="fas fa-spinner fa-spin text-orange-500"></i>
                          {t('adminSupportChatManager.loadingMoreMessage')}
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
                                      ? 'bg-orange-600 text-white rounded-br-sm'
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
                                  {formatTimestamp(msg.sentAt)}
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
                  handleSendMessage();
                }}
                className="p-4 border-t bg-white flex gap-3"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t('adminSupportChatManager.inputPlaceholder')}
                  className="flex-1 border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-5 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 disabled:opacity-50 transition flex items-center gap-2"
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
