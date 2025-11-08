import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { chatMessageService } from '../services/chatMessageService';
import { conversationService } from '../services/conversationService';
import { handleApiError } from '../utils/handleApiError';
import { useAuth } from '../hook/useAuth';
import useRealtime from '../realtime/useRealtime';
import { RealtimeEvents } from '../realtime/realtimeEvents';
import RealtimeContext from '../realtime/RealtimeContext';

export default function ChatSection({
  conversationID,
  contractorApplicationStatus,
  className = '',
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { connection } = useContext(RealtimeContext);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const chatIsLocked = useMemo(
    () => contractorApplicationStatus === 'PendingCommission',
    [contractorApplicationStatus]
  );

  // JOIN CONVERSATION GROUP
  useEffect(() => {
    if (connection && conversationID) {
      connection.invoke('JoinConversation', conversationID);
      return () => {
        connection.invoke('LeaveConversation', conversationID).catch(() => {});
      };
    }
  }, [connection, conversationID]);

  // Load messages
  const loadMessages = useCallback(
    async (pageNum = 1, append = false) => {
      if (!conversationID) return;

      try {
        if (append) setLoadingMore(true);

        const data = await chatMessageService.getMessagesByconversationID(
          conversationID,
          pageNum,
          20
        );

        setHasMore(
          data.items.length === 20 &&
            messages.length + data.items.length < data.totalCount
        );

        if (append) {
          setMessages((prev) => [...data.items, ...prev]);
        } else {
          setMessages(data.items || []);
          setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setLoadingMore(false);
      }
    },
    [conversationID, t, messages.length]
  );

  // Load conversation details
  useEffect(() => {
    if (!conversationID) {
      setLoading(false);
      return;
    }

    const loadConversation = async () => {
      try {
        const conversation = await conversationService.getConversationById(
          conversationID
        );
        setConversation(conversation);

        if (!chatIsLocked) {
          await loadMessages(1, false);
        }
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationID, t, chatIsLocked]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !conversation || chatIsLocked) return;

    try {
      const receiverId =
        user.id === conversation.customerID.toString()
          ? conversation.contractorID.toString()
          : conversation.customerID.toString();

      await chatMessageService.sendMessage({
        conversationID: conversation.conversationID,
        senderID: user.id,
        receiverID: receiverId,
        content: input.trim(),
      });

      setInput('');
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || loadingMore || !hasMore) return;

    if (container.scrollTop === 0) {
      const nextPage = page + 1;
      setPage(nextPage);

      const scrollHeightBefore = container.scrollHeight;

      loadMessages(nextPage, true).then(() => {
        requestAnimationFrame(() => {
          const scrollHeightAfter = container.scrollHeight;
          container.scrollTop = scrollHeightAfter - scrollHeightBefore;
        });
      });
    }
  }, [loadingMore, hasMore, page, loadMessages]);

  // Handle real-time events
  useRealtime({
    [RealtimeEvents.ChatMessageCreated]: (message) => {
      if (
        conversation &&
        message.conversationID === conversation.conversationID
      ) {
        setMessages((prev) => [...prev, message]);
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
  });

  // Loading state
  if (loading) {
    return (
      <div
        className={`bg-white rounded-2xl shadow-md border border-gray-100 p-6 ${className}`}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-2"></i>
            <p className="text-sm">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // No conversation
  if (!conversationID || !conversation) {
    return (
      <div
        className={`bg-white rounded-2xl shadow-md border border-gray-100 p-6 ${className}`}
      >
        <h4 className="font-semibold text-orange-600 mb-4 flex items-center gap-2">
          <i className="fas fa-comments"></i>
          <span>{t('chat.title')}</span>
        </h4>
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <i className="fas fa-comment-slash text-4xl mb-2"></i>
            <p className="text-sm">{t('chat.noConversation')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-100 p-6 relative ${className}`}
    >
      <h4 className="font-semibold text-orange-600 mb-4 flex items-center gap-2">
        <i className="fas fa-comments"></i>
        <span>{t('chat.title')}</span>
      </h4>

      {/* Lock overlay */}
      {chatIsLocked && (
        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center text-white px-6">
            <i className="fas fa-lock text-4xl mb-4"></i>
            <p className="text-lg font-semibold mb-1">
              {t('chat.locked_des.title')}
            </p>
            <p className="text-sm opacity-90">
              {t('chat.locked_des.description')}
            </p>
          </div>
        </div>
      )}

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-2xl mb-4 space-y-3 border border-gray-100"
      >
        {loadingMore && (
          <div className="flex justify-center py-1">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-600">
              <i className="fas fa-spinner fa-spin text-orange-500"></i>
              {t('chat.loadingMore')}
            </span>
          </div>
        )}

        {!hasMore && messages.length > 0 && (
          <div className="text-center py-1">
            <span className="inline-block text-xs text-gray-400 px-3 py-1 rounded-full border border-gray-200 bg-white">
              {t('chat.noMoreMessages')}
            </span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <i className="fas fa-comment-dots text-4xl mb-2"></i>
              <p className="text-sm">
                {chatIsLocked
                  ? t('chat.locked_des.noMessages')
                  : t('chat.noMessages')}
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isMyMessage = m.senderID === user.id;
            return (
              <div
                key={m.chatMessageID}
                className={`flex ${
                  isMyMessage ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex flex-col max-w-[72%]">
                  <div
                    className={[
                      'px-4 py-2 shadow-sm',
                      'rounded-2xl',
                      isMyMessage
                        ? 'rounded-br-sm bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                        : 'rounded-bl-sm bg-white border border-gray-200 text-gray-800',
                    ].join(' ')}
                  >
                    <p className="text-[13px] leading-5 break-words whitespace-pre-wrap">
                      {m.content}
                    </p>
                  </div>
                  <p
                    className={`text-[11px] text-gray-400 mt-1 ${
                      isMyMessage ? 'text-right' : 'text-left'
                    }`}
                  >
                    {new Date(m.sentAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={chatIsLocked}
          placeholder={
            chatIsLocked
              ? t('chat.locked_des.placeholder')
              : t('chat.placeholder')
          }
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-300 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition"
        />
        <button
          onClick={handleSend}
          disabled={chatIsLocked || input.trim() === ''}
          className="px-5 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <i className="fas fa-paper-plane mr-2"></i>
          {t('BUTTON.Send')}
        </button>
      </div>
    </div>
  );
}

ChatSection.propTypes = {
  conversationID: PropTypes.string,
  contractorApplicationStatus: PropTypes.string,
  className: PropTypes.string,
};
