import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { chatMessageService } from '../services/chatMessageService';
import { conversationService } from '../services/conversationService';
import { handleApiError } from '../utils/handleApiError';
import { useAuth } from '../hook/useAuth';
import useRealtime from '../realtime/useRealtime';
import { RealtimeEvents } from '../realtime/realtimeEvents';

export default function ChatSection({
  conversationId,
  isLocked,
  className = '',
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const chatEndRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  // Load messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      const data = await chatMessageService.getMessagesByConversation(
        conversationId
      );
      setMessages(data.items || []);

      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      toast.error(t(handleApiError(error)));
    }
  }, [conversationId, t]);
  // Load conversation details
  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    const loadConversation = async () => {
      try {
        const conv = await conversationService.getConversationById(
          conversationId
        );
        setConversation(conv);

        if (!conv.isLocked) {
          await loadMessages();
        }
      } catch (error) {
        toast.error(t(handleApiError(error)));
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, t, loadMessages]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !conversation || conversation.isLocked) return;

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

    [RealtimeEvents.ChatConversationUnlocked]: (payload) => {
      if (
        conversation &&
        payload.conversationID === conversation.conversationID
      ) {
        setConversation((prev) => ({ ...prev, isLocked: false }));
        toast.success(t('chat.unlocked') || 'Chat đã được mở khóa!');
        loadMessages();
      }
    },
  });

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-2"></i>
            <p className="text-sm">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  // No conversation
  if (!conversationId || !conversation) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <h4 className="font-semibold text-orange-600 mb-4 flex items-center gap-2">
          <i className="fas fa-comments"></i>
          <span>{t('chat.title') || 'Trò chuyện'}</span>
        </h4>
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <i className="fas fa-comment-slash text-4xl mb-2"></i>
            <p className="text-sm">Chưa có cuộc trò chuyện</p>
          </div>
        </div>
      </div>
    );
  }

  const chatIsLocked = conversation.isLocked || isLocked;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-6 relative ${className}`}
    >
      <h4 className="font-semibold text-orange-600 mb-4 flex items-center gap-2">
        <i className="fas fa-comments"></i>
        <span>{t('chat.title') || 'Trò chuyện'}</span>
        {chatIsLocked && (
          <span className="ml-2 px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full">
            <i className="fas fa-lock mr-1"></i>
            {t('chat.locked') || 'Đang khóa'}
          </span>
        )}
        {!chatIsLocked && (
          <span className="ml-2 px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full">
            <i className="fas fa-unlock mr-1"></i>
            {t('chat.active') || 'Đang hoạt động'}
          </span>
        )}
      </h4>

      {/* Lock overlay */}
      {chatIsLocked && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center text-white px-6">
            <i className="fas fa-lock text-4xl mb-4"></i>
            <p className="text-lg font-semibold mb-2">
              {t('chat.locked.title') || 'Chat đang bị khóa'}
            </p>
            <p className="text-sm opacity-80">
              {t('chat.locked.description') ||
                'Chat sẽ được mở sau khi nhà thầu thanh toán phí hợp tác'}
            </p>
          </div>
        </div>
      )}

      {/* Messages container */}
      <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <i className="fas fa-comment-dots text-4xl mb-2"></i>
              <p className="text-sm">
                {chatIsLocked
                  ? t('chat.locked.noMessages') || 'Chat đang bị khóa'
                  : t('chat.noMessages') || 'Chưa có tin nhắn'}
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
                <div className="flex flex-col max-w-[70%]">
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isMyMessage
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm break-words">{m.content}</p>
                  </div>
                  <p
                    className={`text-xs opacity-70 mt-1 ${
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
          onKeyPress={handleKeyPress}
          disabled={chatIsLocked}
          placeholder={
            chatIsLocked
              ? t('chat.locked.placeholder') || 'Chat đang bị khóa...'
              : t('chat.placeholder') || 'Nhập tin nhắn...'
          }
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={chatIsLocked || input.trim() === ''}
          className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <i className="fas fa-paper-plane mr-2"></i>
          {t('BUTTON.Send') || 'Gửi'}
        </button>
      </div>
    </div>
  );
}

ChatSection.propTypes = {
  conversationId: PropTypes.string,
  isLocked: PropTypes.bool,
  className: PropTypes.string,
};
