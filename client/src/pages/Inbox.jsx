import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import {
  Send, MessageSquare, ArrowLeft, Home, MoreVertical, Phone, Video,
  Check, CheckCheck, Search, X
} from "lucide-react";
import { timeAgo } from "../lib/utils";
import toast from "react-hot-toast";

/* ─── helpers ────────────────────────────────────────────────────── */
function Avatar({ src, name, size = 10 }) {
  const seed = encodeURIComponent(name || "user");
  const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  return (
    <img
      src={src || fallback}
      alt={name}
      className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`}
      onError={(e) => { e.target.src = fallback; }}
    />
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

/* ─── main component ─────────────────────────────────────────────── */
export default function Inbox() {
  const { currentUser } = useSelector((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("list"); // "list" | "chat"
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  /* fetch all conversations */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversation", { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch { /* silent */ }
    setLoadingConvs(false);
  }, []);

  /* fetch single conversation messages */
  const fetchConversation = useCallback(async (id, silent = false) => {
    if (!id) return;
    if (!silent) setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/conversation/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data && data._id) {
        setMessages(data.messages || []);
        setActiveConv(data);
        // update unread in list
        setConversations((prev) =>
          prev.map((c) =>
            c._id === id
              ? { ...c, messages: data.messages }
              : c
          )
        );
      }
    } catch { /* silent */ }
    setLoadingMsgs(false);
  }, []);

  /* initial load */
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /* open conversation from URL ?conv=ID */
  useEffect(() => {
    const convId = searchParams.get("conv");
    if (convId) {
      fetchConversation(convId);
      setMobileView("chat");
    }
  }, [searchParams, fetchConversation]);

  /* polling every 5s when a conversation is open */
  useEffect(() => {
    clearInterval(pollRef.current);
    if (activeConv?._id) {
      pollRef.current = setInterval(() => {
        fetchConversation(activeConv._id, true);
        fetchConversations();
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeConv?._id, fetchConversation, fetchConversations]);

  /* scroll to bottom on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* open a conversation */
  const openConv = (conv) => {
    setSearchParams({ conv: conv._id });
    fetchConversation(conv._id);
    setMobileView("chat");
    inputRef.current?.focus();
  };

  /* send message */
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !activeConv?._id) return;
    setSending(true);
    const optimistic = {
      _id: `tmp-${Date.now()}`,
      sender: { _id: currentUser._id, username: currentUser.username, avatar: currentUser.avatar },
      content: text.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    try {
      const res = await fetch(`/api/conversation/${activeConv._id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: optimistic.content }),
      });
      const data = await res.json();
      if (data && data.messages) {
        setMessages(data.messages);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConv._id
              ? { ...c, lastMessage: optimistic.content, lastUpdated: new Date().toISOString() }
              : c
          )
        );
      }
    } catch {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    }
    setSending(false);
  };

  /* helpers */
  const getOtherParticipant = (conv) =>
    conv.participants?.find((p) => p._id !== currentUser._id) || conv.participants?.[0];

  const unreadCount = (conv) =>
    (conv.messages || []).filter(
      (m) => m.sender?._id !== currentUser._id && m.sender !== currentUser._id && !m.read
    ).length;

  const totalUnread = conversations.reduce((acc, c) => acc + unreadCount(c), 0);

  const filtered = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    return (
      !search ||
      other?.username?.toLowerCase().includes(search.toLowerCase()) ||
      c.listing?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  /* ── Sidebar: conversation list ───────────────────────────────── */
  const Sidebar = (
    <aside className={`${mobileView === "list" ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 h-full`}>
      {/* header */}
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-slate-900">Messages</h1>
          {totalUnread > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        {/* search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-9 py-2 bg-slate-100 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto">
        {loadingConvs ? (
          <div className="space-y-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <MessageSquare size={40} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-600 text-sm">No conversations yet</p>
            <p className="text-slate-400 text-xs mt-1">Contact a property owner to start chatting</p>
            <Link to="/search" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
              Browse Listings
            </Link>
          </div>
        ) : (
          filtered.map((conv) => {
            const other = getOtherParticipant(conv);
            const unread = unreadCount(conv);
            const isActive = activeConv?._id === conv._id;
            return (
              <button
                key={conv._id}
                onClick={() => openConv(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-50 ${
                  isActive ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={other?.avatar} name={other?.username} size={12} />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm truncate ${unread > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                      {other?.username || "Unknown"}
                    </span>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">{formatTime(conv.lastUpdated)}</span>
                  </div>
                  {conv.listing && (
                    <p className="text-[11px] text-blue-500 truncate">{conv.listing.name}</p>
                  )}
                  <p className={`text-xs truncate mt-0.5 ${unread > 0 ? "text-slate-800 font-medium" : "text-slate-500"}`}>
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );

  /* ── Chat window ──────────────────────────────────────────────── */
  const other = activeConv ? getOtherParticipant(activeConv) : null;

  const ChatWindow = (
    <main className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-col flex-1 h-full bg-slate-50`}>
      {!activeConv ? (
        /* empty state */
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={40} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Your Messages</h2>
          <p className="text-slate-500 text-sm max-w-xs">
            Select a conversation to start chatting, or contact a property owner from any listing.
          </p>
        </div>
      ) : (
        <>
          {/* chat header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
            <button
              onClick={() => { setMobileView("list"); setSearchParams({}); }}
              className="md:hidden text-slate-500 hover:text-slate-700 mr-1"
            >
              <ArrowLeft size={20} />
            </button>
            <Avatar src={other?.avatar} name={other?.username} size={10} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">{other?.username}</p>
              {activeConv.listing && (
                <Link
                  to={`/listing/${activeConv.listing._id}`}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate"
                >
                  <Home size={10} /> {activeConv.listing.name}
                </Link>
              )}
            </div>
            {activeConv.listing?.imageUrls?.[0] && (
              <img
                src={activeConv.listing.imageUrls[0]}
                alt={activeConv.listing.name}
                className="w-10 h-10 rounded-lg object-cover border border-slate-200"
              />
            )}
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {loadingMsgs ? (
              <div className="flex flex-col gap-3 pt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <div className={`h-10 rounded-2xl animate-pulse bg-slate-200 ${i % 2 === 0 ? "w-48" : "w-56"}`} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-slate-400 text-sm">No messages yet. Say hello!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const isMe = senderId === currentUser._id;
                  const senderAvatar = msg.sender?.avatar;
                  const senderName = msg.sender?.username;
                  const showAvatar =
                    !isMe &&
                    (idx === 0 ||
                      (messages[idx - 1]?.sender?._id || messages[idx - 1]?.sender) !== senderId);
                  const isLast = idx === messages.length - 1;
                  const isRead = isMe && msg.read;

                  return (
                    <div key={msg._id || idx} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {/* avatar placeholder to align */}
                      {!isMe && (
                        <div className="w-7 flex-shrink-0">
                          {showAvatar && <Avatar src={senderAvatar} name={senderName} size={7} />}
                        </div>
                      )}

                      <div className={`max-w-[70%] group`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                            isMe
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100"
                          } ${msg._id?.startsWith("tmp-") ? "opacity-70" : ""}`}
                        >
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] text-slate-400">{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            isRead
                              ? <CheckCheck size={12} className="text-blue-500" />
                              : <Check size={12} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* input bar */}
          <form
            onSubmit={sendMessage}
            className="flex items-center gap-3 px-4 py-3 bg-white border-t border-slate-200"
          >
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </>
      )}
    </main>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      {Sidebar}
      {ChatWindow}
    </div>
  );
}
