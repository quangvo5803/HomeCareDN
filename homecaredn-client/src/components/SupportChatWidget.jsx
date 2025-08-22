// src/components/SupportChatWidget.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/* ====== Helpers ====== */
const ROLES = { USER: "user", BOT: "assistant" };
const cn = (...xs) => xs.filter(Boolean).join(" ");
const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function useAutoScroll(dep) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [dep]);
  return ref;
}

/* ====== Sub components ====== */
function BotAvatar() {
  return (
    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 grid place-items-center border">
      <span className="text-xs">
        <i className="fa-solid fa-robot" />
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

function MessageBubble({ message }) {
  const isUser = message.role === ROLES.USER;
  return (
    <div className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && <BotAvatar />}
      <div className={cn("max-w-[75%] md:max-w-[65%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm border",
            isUser
              ? "bg-indigo-600 text-white border-indigo-500/30"
              : "bg-white text-gray-900 border-gray-200"
          )}
        >
          {message.text}
        </div>
        <div
          className={cn(
            "mt-1 text-[10px] opacity-60",
            isUser ? "text-right text-white/80" : "text-left text-gray-500"
          )}
        >
          {message.time}
        </div>
      </div>
      {isUser && <UserAvatar />}
    </div>
  );
}

function MessageList({ messages, filter }) {
  const filtered = useMemo(() => {
    if (!filter) return messages;
    return messages.filter((m) => m.text.toLowerCase().includes(filter.toLowerCase()));
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

function TypingIndicator({ visible }) {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
      {t("supportChat.typing")}
    </div>
  );
}

function Suggestions({ onPick }) {
  const { t } = useTranslation();
  const items = t("supportChat.suggestions", { returnObjects: true });
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((text) => (
        <button
          key={text}
          onClick={() => onPick(text)}
          className="rounded-full border px-3 py-1.5 text-xs md:text-sm bg-gray-100 hover:bg-gray-200"
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function ChatHeader({ onClose, onMinimize, isMinimized, brand = "HomeCareDN" }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 grid place-items-center border">
            <i className="fa-solid fa-robot" />
          </div>
          <span className="absolute -right-0 -bottom-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div>
          <div className="text-sm font-semibold">
            {t("supportChat.headerTitle", { brand })}
          </div>
          <div className="text-xs text-green-500">{t("supportChat.headerStatusReady")}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onMinimize}
          className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100"
          title={isMinimized ? t("supportChat.action.expand") : t("supportChat.action.minimize")}
          aria-label={isMinimized ? t("supportChat.action.expand") : t("supportChat.action.minimize")}
        >
          {isMinimized ? <i className="fa-regular fa-square" /> : <i className="fa-solid fa-minus" />}
        </button>
        <button
          onClick={onClose}
          className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100"
          title={t("supportChat.action.close")}
          aria-label={t("supportChat.action.close")}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
}

function ChatInput({ onSend, disabled }) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue("");
  };
  return (
    <form onSubmit={submit} className="flex w-full items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("supportChat.inputPlaceholder")}
        className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-md bg-indigo-600 px-3 py-2 text-white disabled:opacity-50"
      >
        {t("supportChat.send")}
      </button>
    </form>
  );
}

function ChatWindow({ open, onClose, brand }) {
  const { t } = useTranslation();

  // seed theo ngôn ngữ hiện tại (tại thời điểm mount)
  const seed = useMemo(
    () => [
      { id: "m1", role: ROLES.USER, text: t("supportChat.seed.user1"), time: "09:05" },
      { id: "m2", role: ROLES.BOT, text: t("supportChat.seed.bot1"), time: "09:06" },
      { id: "m3", role: ROLES.USER, text: t("supportChat.seed.user2"), time: "09:07" },
      { id: "m4", role: ROLES.BOT, text: t("supportChat.seed.bot2"), time: "09:08" },
    ],
    // đổi ngôn ngữ -> seed mới khi component được remount; nếu muốn auto cập nhật,
    // có thể thêm i18n.language vào deps và reset state nếu chưa chat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  const [messages, setMessages] = useState(seed);
  const [filter, setFilter] = useState("");
  const [typing, setTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const send = (text) => {
    const time = new Date().toTimeString().slice(0, 5);
    const mUser = { id: uid(), role: ROLES.USER, text, time };
    setMessages((prev) => [...prev, mUser]);

    // reply giả
    setTyping(true);
    setTimeout(() => {
      const reply = {
        id: uid(),
        role: ROLES.BOT,
        text: t("supportChat.fakeReply", { text }),
        time: new Date().toTimeString().slice(0, 5),
      };
      setMessages((prev) => [...prev, reply]);
      setTyping(false);
    }, 900);
  };

  if (!open) return null;

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

        {!minimized && (
          <div className="p-4 space-y-3">
            {/* search/filter */}
            <div className="flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-2">
              <span className="text-gray-500 text-sm">🔎</span>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={t("supportChat.searchPlaceholder")}
                className="bg-transparent text-sm outline-none w-full"
              />
            </div>

            <MessageList messages={messages} filter={filter} />

            <div className="flex items-center justify-between">
              <TypingIndicator visible={typing} />
              <span className="text-[10px] rounded-full border px-2 py-0.5 text-gray-500">
                {t("supportChat.demoBadge")}
              </span>
            </div>

            <Suggestions onPick={(txt) => send(txt)} />
            <ChatInput onSend={send} disabled={typing} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChatLauncherButton({ open, setOpen }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl border",
        "bg-indigo-600 text-white grid place-items-center hover:scale-105 transition"
      )}
      title={t("supportChat.launcherTitle")}
      aria-label={t("supportChat.launcherTitle")}
    >
      {open ? <i className="fa-solid fa-xmark" /> : <i className="fa-solid fa-comment" />}
    </button>
  );
}

/* ====== Default export ====== */
export default function SupportChatWidget({ brand = "HomeCareDN" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ChatLauncherButton open={open} setOpen={setOpen} />
      <ChatWindow open={open} onClose={() => setOpen(false)} brand={brand} />
    </>
  );
}
