import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  useCallback,
} from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { aiChatService } from '../services/aiChatService';
import { useAuth } from '../hook/useAuth';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import RealtimeContext from '../realtime/RealtimeContext';
import useRealtime from '../realtime/useRealtime';
import { RealtimeEvents } from '../realtime/realtimeEvents';
import { chatMessageService } from '../services/chatMessageService';
import { conversationService } from '../services/conversationService';

const ROLES = { USER: 'user', BOT: 'assistant' };
const cn = (...xs) => xs.filter(Boolean).join(' ');

// Keys local
const STORAGE_KEY_SESSION = 'homecare_ai_session_id';
const STORAGE_KEY_MESSAGES = 'homecare_ai_messages';

//AdminID
const ADMIN_ID = import.meta.env.VITE_ADMIN_ID;

// UID Generator
const uid = (() => {
  let seq = 0;
  return () => {
    const c = typeof globalThis === 'undefined' ? undefined : globalThis.crypto;
    if (c?.randomUUID) return c.randomUUID();
    if (c?.getRandomValues) {
      const bytes = new Uint8Array(16);
      c.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) =>
        b.toString(16).padStart(2, '0')
      ).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
        12,
        16
      )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    seq += 1;
    return `uid-${Date.now()}-${seq}`;
  };
})();

// Helper for AI UI Message
const toAiUiMessage = (text, role) => ({
  id: uid(),
  role: role,
  text: text,
  time: new Date().toTimeString().slice(0, 5),
});

const toAdminUiMessage = (m, currentUserId) => ({
  id: m.id ?? m.chatMessageID ?? uid(),
  role: m.senderID === currentUserId ? ROLES.USER : ROLES.BOT,
  text: m.content ?? '',
  time: new Date(m.sentAt).toTimeString().slice(0, 5),
});

function useAutoScroll(dep) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [dep]);
  return ref;
}

/*Sub components*/
function BotAvatar() {
  return (
    <div className="h-8 w-8 rounded-full bg-indigo-100 text-orange-600 grid place-items-center border">
      <span className="text-xs">
        <i className="fa-solid fa-headset" />
      </span>
    </div>
  );
}
function UserAvatar() {
  return (
    <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center border">
      <i className="fa-solid fa-user" />
    </div>
  );
}

const MessageShape = PropTypes.exact({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  role: PropTypes.oneOf([ROLES.USER, ROLES.BOT]).isRequired,
  text: PropTypes.string,
  time: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
});

function MessageBubble({ message }) {
  const isUser = message.role === ROLES.USER;
  const renderers = {
    a: ({ href, children }) => {
      const isInternal = href && href.startsWith('/');
      const linkClass = cn(
        'font-bold underline transition-colors duration-200',
        isUser
          ? 'text-blue-100 hover:text-white'
          : 'text-blue-600 hover:text-blue-800'
      );

      if (isInternal) {
        return (
          <Link to={href} className={linkClass}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {children}
        </a>
      );
    },
    p: ({ children }) => (
      <p className="mb-1 last:mb-0 inline-block">{children}</p>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-2 border rounded">
        <table className="min-w-full divide-y divide-gray-300 text-xs">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="px-2 py-1 bg-gray-100 font-bold text-left">{children}</th>
    ),
    td: ({ children }) => <td className="px-2 py-1 border-t">{children}</td>,
  };

  return (
    <div
      className={cn(
        'flex w-full gap-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && <BotAvatar />}
      <div
        className={cn(
          'max-w-[85%] md:max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm border overflow-hidden',
            isUser
              ? 'bg-orange-600 text-white border-indigo-500/30'
              : 'bg-white text-gray-900 border-gray-200'
          )}
        >
          {/* Sử dụng ReactMarkdown để render nội dung */}
          <ReactMarkdown components={renderers}>{message.text}</ReactMarkdown>
        </div>
        <div
          className={cn(
            'mt-1 text-[10px] opacity-60',
            isUser ? 'text-right text-white/80' : 'text-left text-gray-500'
          )}
        >
          {message.time}
        </div>
      </div>
      {isUser && <UserAvatar />}
    </div>
  );
}
MessageBubble.propTypes = {
  message: MessageShape.isRequired,
};

function MessageList({ messages, filter }) {
  const filtered = useMemo(() => {
    if (!filter) return messages;
    return messages.filter((m) =>
      (m.text || '').toLowerCase().includes(filter.toLowerCase())
    );
  }, [messages, filter]);
  const ref = useAutoScroll(filtered.length);

  return (
    <div className="h-[48vh] md:h-[50vh] overflow-y-auto pr-2" ref={ref}>
      <div className="flex flex-col gap-3 py-2">
        {filtered.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>
    </div>
  );
}
MessageList.propTypes = {
  messages: PropTypes.arrayOf(MessageShape).isRequired,
  filter: PropTypes.string,
};

function ChatHeader({
  onClose,
  onMinimize,
  isMinimized,
  brand = 'HomeCareDN',
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-indigo-100 text-orange-600 grid place-items-center border">
            <i className="fa-solid fa-headset" />
          </div>
          <span className="absolute -right-0 -bottom-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div>
          <div className="text-sm font-semibold">
            {t('supportChat.headerTitle', { brand })}
          </div>
          <div className="text-xs text-green-500">
            {t('supportChat.headerStatusReady')}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onMinimize}
          className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100"
          title={
            isMinimized
              ? t('supportChat.action.expand')
              : t('supportChat.action.minimize')
          }
        >
          {isMinimized ? (
            <i className="fa-regular fa-square" />
          ) : (
            <i className="fa-solid fa-minus" />
          )}
        </button>
        <button
          onClick={onClose}
          className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100"
          title={t('supportChat.action.close')}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
}
ChatHeader.propTypes = {
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func.isRequired,
  isMinimized: PropTypes.bool,
  brand: PropTypes.string,
};

// Component Tab
function TabButton({ label, icon, isActive, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2',
        isActive
          ? 'text-orange-600 orange-indigo-600'
          : 'text-gray-500 border-transparent hover:text-gray-700',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <i className={icon} />
      <span>{label}</span>
    </button>
  );
}
TabButton.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

function ChatInput({ onSend, disabled, isLoading, countdown }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const submit = (e) => {
    if (e) e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const buttonText = useMemo(() => {
    if (isLoading) {
      return <i className="fa-solid fa-spinner animate-spin w-4" />;
    }
    if (countdown > 0) {
      return <span className="w-4 font-bold">{countdown}s</span>;
    }
    return <i className="fa-solid fa-paper-plane" />;
  }, [isLoading, countdown]);

  return (
    <form onSubmit={submit} className="flex w-full items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('supportChat.inputPlaceholder')}
        className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-10 leading-snug overflow-y-auto"
        disabled={disabled}
        rows={1}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="h-10 rounded-md bg-orange-600 px-3 py-2 text-white disabled:opacity-50 w-12 text-center transition-all duration-150 grid place-items-center font-medium"
      >
        {buttonText}
      </button>
    </form>
  );
}

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  countdown: PropTypes.number,
};

function ChatWindow({ open, onClose, brand }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { chatConnection } = useContext(RealtimeContext);

  // State
  const [currentTab, setCurrentTab] = useState('AI');
  const [filter, setFilter] = useState('');
  const [minimized, setMinimized] = useState(false);

  // State for AI
  const [aiMessages, setAiMessages] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // State for Chat Admin
  const [adminMessages, setAdminMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [adminChatState, setAdminChatState] = useState('idle');
  const [adminSending, setAdminSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (open) {
      let sid = localStorage.getItem(STORAGE_KEY_SESSION);
      if (!sid) {
        sid = uid();
        localStorage.setItem(STORAGE_KEY_SESSION, sid);
      }
      setSessionId(sid);

      try {
        const savedMessags = localStorage.getItem(STORAGE_KEY_MESSAGES);
        if (savedMessags) {
          setAiMessages(JSON.parse(savedMessags));
        } else {
          setAiMessages([toAiUiMessage(t('supportChat.aiWelcome'), ROLES.BOT)]);
        }
      } catch {
        setAiMessages([]);
      }
    }
  }, [open, t]);

  useEffect(() => {
    if (aiMessages.length > 0) {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(aiMessages));
    }
  }, [aiMessages]);

  const sendAiMessage = async (text) => {
    try {
      setAiTyping(true);

      const userMsg = toAiUiMessage(text, ROLES.USER);
      setAiMessages((prev) => [...prev, userMsg]);

      const dto = {
        sessionId: sessionId,
        prompt: text,
      };

      const data = await aiChatService.chat(dto);

      if (data && data.reply) {
        const botMsg = toAiUiMessage(data.reply, ROLES.BOT);
        setAiMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      const errorMessage = toAiUiMessage(
        `${t('supportChat.error')}`,
        ROLES.BOT
      );
      setAiMessages((prev) => [...prev, errorMessage]);
      console.error(err);
    } finally {
      setAiTyping(false);
    }
  };

  const loadAdminChatHistory = async (id) => {
    try {
      const params = { conversationID: id };
      const history = await chatMessageService.getMessagesByConversationID(
        params
      );
      const list = (history.items || []).map((m) =>
        toAdminUiMessage(m, user.id)
      );
      setAdminMessages(list);
      if (chatConnection) {
        await chatConnection.invoke('JoinConversation', id);
      }
      setAdminChatState('loaded');
    } catch (error) {
      toast.error(t(handleApiError(error)));
      setAdminChatState('error');
    }
  };

  const loadSupportChat = async () => {
    if (!user) return;
    setAdminChatState('loading');
    try {
      const conversation = await conversationService.getConversationByUserID(
        user.id
      );
      if (conversation) {
        setConversation(conversation);
        await loadAdminChatHistory(conversation.conversationID);
      } else {
        setConversation(null);
        setAdminMessages([]);
        setAdminChatState('loaded');
      }
    } catch (error) {
      toast.error(t(handleApiError(error)));
      setAdminChatState('error');
    }
  };

  const sendAdminMessage = async (text) => {
    if (!user || adminSending || countdown > 0) return;
    setAdminSending(true);

    const tempId = uid();
    const tempMessage = toAdminUiMessage(
      {
        id: tempId,
        senderID: user.id,
        content: text,
        sentAt: new Date().toISOString(),
      },
      user.id
    );
    setAdminMessages((prev) => [...prev, tempMessage]);

    const dto = {
      content: text,
      senderID: user.id,
      receiverID: ADMIN_ID,
      conversationID: conversation ? conversation.conversationID : null,
    };

    try {
      const createdMessageDto = await chatMessageService.sendMessageToAdmin(
        dto
      );
      setAdminMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? toAdminUiMessage(createdMessageDto, user.id) : m
        )
      );

      if (!conversation) {
        const newConversation = {
          conversationID: createdMessageDto.conversationID,
          userID: createdMessageDto.senderID,
          adminID: ADMIN_ID,
        };
        setConversation(newConversation);
        if (chatConnection) {
          chatConnection.invoke(
            'JoinConversation',
            newConversation.conversationID
          );
        }
      }
    } catch (error) {
      toast.error(t(handleApiError(error)));
      setAdminMessages((prev) => prev.filter((m) => m.id !== tempId));
      setAdminSending(false);
      return;
    }

    setAdminSending(false);
    setCountdown(3);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNewAdminMessage = useCallback(
    (dto) => {
      if (dto.senderID === user.id) {
        return;
      }

      if (dto?.conversationID === conversation?.conversationID) {
        setAdminMessages((prev) => {
          if (
            prev.some((message) => message.chatMessageID === dto.chatMessageID)
          )
            return prev;
          return [...prev, toAdminUiMessage(dto, user.id)];
        });
      }
    },
    [conversation, user]
  );

  useRealtime(
    { [RealtimeEvents.ChatMessageCreated]: handleNewAdminMessage },
    'chat'
  );

  useEffect(() => {
    if (!open) {
      setConversation(null);
      setAdminMessages([]);
      setAdminChatState('idle');
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
  }, [open]);

  useEffect(() => {
    if (open && currentTab === 'ADMIN' && adminChatState === 'idle') {
      loadSupportChat();
    }
    return () => {
      if (conversation && chatConnection) {
        chatConnection
          .invoke('LeaveConversation', conversation.conversationID)
          .catch(() => {});
      }
    };
  }, [open, currentTab, adminChatState]); // eslint-disable-line

  const send = async (text) => {
    if (currentTab === 'AI') {
      await sendAiMessage(text);
    } else {
      await sendAdminMessage(text);
    }
  };

  if (!open) return null;

  const currentMessages = currentTab === 'AI' ? aiMessages : adminMessages;
  const isInputDisabled =
    aiTyping ||
    adminSending ||
    countdown > 0 ||
    (currentTab === 'ADMIN' && (adminChatState === 'loading' || !user));

  return (
    <div className="fixed bottom-24 right-4 z-50 w-[92vw] max-w-md">
      <div className="rounded-2xl border bg-white shadow-xl">
        <div className="p-4 border-b">
          <ChatHeader
            onClose={onClose}
            onMinimize={() => setMinimized((v) => !v)}
            isMinimized={minimized}
            brand={brand}
          />
        </div>

        {/* ==== UI TABS ==== */}
        {!minimized && (
          <div className="flex px-4 pt-3 border-b border-gray-200">
            <TabButton
              label={t('supportChat.tabAI')}
              icon="fa-solid fa-robot"
              isActive={currentTab === 'AI'}
              onClick={() => setCurrentTab('AI')}
            />
            <TabButton
              label={t('supportChat.tabAdmin')}
              icon="fa-solid fa-user-tie"
              isActive={currentTab === 'ADMIN'}
              onClick={() => setCurrentTab('ADMIN')}
              disabled={!user}
            />
          </div>
        )}

        {!minimized && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-2">
              <span className="text-gray-500 text-sm">🔎</span>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={t('supportChat.searchPlaceholder')}
                className="bg-transparent text-sm outline-none w-full"
              />
            </div>

            {/* ==== HIỂN THỊ DANH SÁCH TIN NHẮN THEO TAB ==== */}
            {currentTab === 'AI' && (
              <MessageList messages={currentMessages} filter={filter} />
            )}

            {currentTab === 'ADMIN' && (
              <>
                {!user && (
                  <div className="h-[48vh] md:h-[50vh] flex flex-col items-center justify-center text-center text-sm text-gray-500 px-4">
                    <i className="fa-solid fa-right-to-bracket text-2xl mb-3"></i>
                    <p>{t('supportChat.mustLogin')}</p>
                  </div>
                )}
                {/* Đang tải (Khi check lần đầu) */}
                {user &&
                  (adminChatState === 'loading' ||
                    adminChatState === 'loadingHistory') && (
                    <div className="h-[48vh] md:h-[50vh] flex flex-col items-center justify-center text-sm text-gray-500">
                      <i className="fa-solid fa-spinner animate-spin text-2xl mb-3" />
                      <p>{t('supportChat.loadingAdminChat')}</p>
                    </div>
                  )}

                {/* Đã tải, có hội thoại */}
                {user && adminChatState === 'loaded' && conversation && (
                  <MessageList messages={currentMessages} filter={filter} />
                )}

                {/* Đã tải, nhưng không có hội thoại */}
                {user && adminChatState === 'loaded' && !conversation && (
                  <div className="h-[48vh] md:h-[50vh] flex flex-col items-center justify-center text-center text-sm text-gray-500 px-4">
                    <i className="fa-solid fa-paper-plane text-2xl mb-3 text-indigo-400"></i>
                    <p>{t('supportChat.startAdminChat')}</p>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-between">
              {aiTyping && currentTab === 'AI' ? (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
                  {t('supportChat.typing')}
                </div>
              ) : (
                <span />
              )}

              <span className="text-[10px] rounded-full border px-2 py-0.5 text-gray-500">
                {currentTab === 'AI' ? 'Cookie-backed' : 'Live Support'}
              </span>
            </div>

            <ChatInput
              onSend={send}
              disabled={isInputDisabled}
              isLoading={aiTyping || adminSending}
              countdown={currentTab === 'ADMIN' ? countdown : 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}

ChatWindow.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  brand: PropTypes.string,
};

function ChatLauncherButton({ open, setOpen }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className={cn(
        'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl border',
        'bg-orange-600 text-white grid place-items-center hover:scale-110 transition'
      )}
      title={t('supportChat.launcherTitle')}
      aria-label={t('supportChat.launcherTitle')}
    >
      {open ? (
        <i className="fa-solid fa-xmark" />
      ) : (
        <i className="fa-solid fa-comment" />
      )}
    </button>
  );
}
ChatLauncherButton.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

/* ===== Default export ===== */
export default function SupportChatWidget({ brand = 'HomeCareDN' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ChatLauncherButton open={open} setOpen={setOpen} />
      <ChatWindow open={open} onClose={() => setOpen(false)} brand={brand} />
    </>
  );
}
SupportChatWidget.propTypes = {
  brand: PropTypes.string,
};
