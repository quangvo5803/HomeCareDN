import { useEffect, useState, useContext, useMemo } from 'react';
import { useAuth } from '../../hook/useAuth';
import { handleApiError } from '../../utils/handleApiError';
import { conversationService } from '../../services/conversationService';
import { chatMessageService } from '../../services/chatMessageService';
import useRealtime from '../../realtime/useRealtime';
import RealtimeContext from '../../realtime/RealtimeContext';
import { RealtimeEvents } from '../../realtime/realtimeEvents';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

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

  // Load conversation list
  useEffect(() => {
    if (!user) return;
    setLoadingConversation(true);
    conversationService
      .getAllConversationsByAdminID(user.id)
      .then((items) => setConversations(items || []))
      .catch((error) => toast.error(t(handleApiError(error))))
      .finally(() => setLoadingConversation(false));
  }, [user, t]);

  // Load messages when select conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    setLoadingMessage(true);
    chatMessageService
      .getMessagesByConversationID({
        conversationID: selectedConversation.conversationID,
      })
      .then((res) => {
        setMessages(res.items || []);
        if (chatConnection)
          chatConnection.invoke(
            'JoinConversation',
            selectedConversation.conversationID
          );
      })
      .catch((error) => toast.error(t(handleApiError(error))))
      .finally(() => setLoadingMessage(false));
  }, [selectedConversation, chatConnection, t]);

  // Realtime messages
  useRealtime(
    {
      [RealtimeEvents.ChatMessageCreated]: (msg) => {
        if (msg.conversationID === selectedConversation?.conversationID) {
          setMessages((prev) => {
            if (prev.some((m) => m.chatMessageID === msg.chatMessageID))
              return prev;
            return [...prev, msg];
          });
        }
      },
    },
    'chat'
  );

  // Send message
  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
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
    return conversations.filter((conv) =>
      (conv.userEmail || conv.userID || '')
        .toLowerCase()
        .includes(filter.toLowerCase())
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
                {filteredConversations.map((convesation) => (
                  <li
                    key={convesation.conversationID}
                    onClick={() => setSelectedConversation(convesation)}
                    className={`p-4 cursor-pointer transition-all hover:bg-indigo-50 ${
                      convesation.conversationID ===
                      selectedConversation?.conversationID
                        ? 'bg-indigo-100 border-l-4 border-indigo-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {convesation.userID.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-800">
                          {convesation.userID.slice(0, 8)}
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
              <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-gray-50 to-gray-100 scrollbar-thin scrollbar-thumb-indigo-200">
                {loadingMessage ? (
                  <div className="flex items-center justify-center h-full">
                    <i className="fa-solid fa-spinner fa-spin text-3xl text-gray-400"></i>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {messages.map((message) => {
                      const isAdmin = message.senderID === user.id;
                      return (
                        <div
                          key={message.chatMessageID}
                          className={`flex ${
                            isAdmin ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className="flex flex-col max-w-[75%]">
                            <div
                              className={`px-4 py-2 rounded-2xl shadow-sm ${
                                isAdmin
                                  ? 'bg-indigo-600 text-white rounded-br-sm'
                                  : 'bg-white border text-gray-800 rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>
                            </div>
                            <p
                              className={`text-[10px] text-gray-400 mt-1 ${
                                isAdmin ? 'text-right' : 'text-left'
                              }`}
                            >
                              {new Date(message.sentAt).toLocaleTimeString(
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
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <i className="fa-regular fa-comments text-4xl mb-2"></i>
                    <p>{t('adminSupportChatManager.noMessagesYet')}</p>
                  </div>
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
