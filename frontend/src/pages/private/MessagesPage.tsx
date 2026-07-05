import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import { axiosClient } from "../../lib/axiosClient";
import { useAuthContext } from "../../contexts/AuthContext";
import type { ChatMessage, Conversation } from "../../types/marketplace";
import TrustBadge from "../../components/TrustBadge";

type RichConversation = Conversation & {
  profileImage?: string;
  online?: boolean;
  displayTime?: string;
};

const getConversationName = (conversation: RichConversation, currentUserId?: string) =>
  conversation.participantName || (conversation.sellerId === currentUserId ? conversation.buyerName : conversation.sellerName) || "SMAJ user";

const getConversationInitial = (conversation: RichConversation, currentUserId?: string) =>
  getConversationName(conversation, currentUserId).slice(0, 1).toUpperCase();

const formatLastSeen = (conversation: RichConversation) => {
  if (conversation.online) return "Online";
  const value = conversation.lastSeenAt || conversation.updatedAt;
  if (!value) return "Offline";
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return "Offline";
  const diffMinutes = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  return `Last seen ${new Date(value).toLocaleDateString()}`;
};

const MessagesPage = () => {
  const { user } = useAuthContext();
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState<RichConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const typingTimeoutRef = useRef<number | null>(null);
  const selectedId = params.get("conversation");
  const activeId = selectedId || conversations[0]?._id;
  const active = useMemo(() => conversations.find((item) => item._id === activeId), [activeId, conversations]);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await axiosClient.get<{ conversations: RichConversation[] }>("/messages");
      setConversations(data.conversations || []);
    } catch {
      setConversations([]);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    try {
      const { data } = await axiosClient.get<{ conversation?: RichConversation; messages: ChatMessage[] }>(`/messages/${activeId}`);
      setMessages(data.messages || []);
      if (data.conversation) {
        setConversations((current) => current.map((item) => item._id === data.conversation?._id ? { ...item, ...data.conversation } : item));
      }
    } catch {
      setMessages([]);
    }
  }, [activeId]);

  useEffect(() => {
    const initial = window.setTimeout(() => void loadConversations(), 0);
    const timer = window.setInterval(() => void loadConversations(), 5000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadConversations]);

  useEffect(() => {
    const initial = window.setTimeout(() => void loadMessages(), 0);
    const timer = window.setInterval(() => void loadMessages(), 2500);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadMessages]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
  }, []);

  const setTyping = useCallback((typing: boolean) => {
    if (!activeId) return;
    axiosClient.post(`/messages/${activeId}/typing`, { typing }).catch(() => undefined);
  }, [activeId]);

  const handleTextChange = (value: string) => {
    setText(value);
    if (!value.trim()) {
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      setTyping(false);
      return;
    }
    setTyping(true);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => setTyping(false), 1800);
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = chatMessagesRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
    nearBottomRef.current = true;
    setShowScrollBottom(false);
  }, []);

  const handleChatScroll = () => {
    const container = chatMessagesRef.current;
    if (!container) return;
    const awayFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight > 90;
    nearBottomRef.current = !awayFromBottom;
    setShowScrollBottom(awayFromBottom);
  };

  useEffect(() => {
    nearBottomRef.current = true;
    const timer = window.setTimeout(() => setShowScrollBottom(false), 0);
    window.requestAnimationFrame(() => scrollToBottom("auto"));
    return () => window.clearTimeout(timer);
  }, [activeId, scrollToBottom]);

  useEffect(() => {
    if (nearBottomRef.current) window.requestAnimationFrame(() => scrollToBottom("auto"));
  }, [messages, scrollToBottom]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeId || !text.trim()) return;
    const message = text.trim();
    setText("");
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    setTyping(false);
    nearBottomRef.current = true;
    await axiosClient.post(`/messages/${activeId}`, { message });
    await Promise.all([loadMessages(), loadConversations()]);
  };

  return (
    <main className={`private-page messages-page ${selectedId ? "conversation-selected" : ""}`}>
      <header className="mobile-messages-heading">
        <h1>Messages</h1>
      </header>
      <section className="private-page-head messages-desktop-intro">
        <div>
          <p className="private-kicker">COMMUNICATION CENTER</p>
          <h1>Messages</h1>
          <p>Buyer and seller conversations across SMAJ PI HUB.</p>
        </div>
      </section>
      <section className="messages-layout rich">
        <aside className="conversation-list">
          {conversations.length ? (
            conversations.map((item) => (
              <button className={item._id === activeId ? "active" : ""} key={item._id} onClick={() => setParams({ conversation: item._id })}>
                <span className="conversation-avatar">
                  {item.profileImage ? <img src={item.profileImage} alt="" /> : getConversationInitial(item, user?.uid)}
                  <i className={item.online ? "online" : "offline"} />
                </span>
                <div>
                  <strong className="conversation-name">{getConversationName(item, user?.uid)}<TrustBadge level={item.verificationLevel} /></strong>
                  <p>{item.lastMessage || "No messages yet."}</p>
                  <small>{item.productTitle} - {formatLastSeen(item)}</small>
                </div>
                {item.unreadBy?.length ? <b>{item.unreadBy.length}</b> : null}
              </button>
            ))
          ) : (
            <div className="private-state compact">
              <h3>No conversations yet</h3>
              <p>Buyer and seller chats will appear after a user starts a product conversation.</p>
            </div>
          )}
        </aside>
        <div className="chat-panel">
          {active ? (
            <>
              <header>
                <button className="chat-mobile-back" onClick={() => setParams({})} aria-label="Back to messages">
                  <ArrowBackOutlinedIcon />
                </button>
                <div className="chat-person">
                  <span className="conversation-avatar">
                    {active.profileImage ? <img src={active.profileImage} alt="" /> : getConversationInitial(active, user?.uid)}
                    <i className={active.online ? "online" : "offline"} />
                  </span>
                  <div>
                    <strong className="conversation-name">{getConversationName(active, user?.uid)}<TrustBadge level={active.verificationLevel} /></strong>
                    <small>{active.typing ? "Typing..." : formatLastSeen(active)}</small>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <Link to="/report-abuse" aria-label="Report conversation" title="Report conversation">
                    <FlagOutlinedIcon />
                  </Link>
                  <button aria-label="More options">
                    <MoreVertOutlinedIcon />
                  </button>
                </div>
                <div className="chat-product-preview">
                  {active.productImage ? <img src={active.productImage} alt="" /> : null}
                  <span>
                    <strong>{active.productTitle}</strong>
                    <small>Marketplace conversation</small>
                  </span>
                </div>
              </header>
              <div className="chat-messages" ref={chatMessagesRef} onScroll={handleChatScroll}>
                <div className="chat-product-mobile">
                  {active.productImage ? <img src={active.productImage} alt="" /> : null}
                  <div>
                    <strong>{active.productTitle}</strong>
                    <span>Marketplace product</span>
                  </div>
                </div>
                {messages.map((item) => (
                  <article className={item.senderId === user?.uid ? "mine" : ""} key={item._id}>
                    <p>{item.message}</p>
                    <small className="chat-message-meta">
                      <time>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                      {item.senderId === user?.uid ? <span className={`message-checks ${item.readAt ? "read" : "sent"}`} aria-label={item.readAt ? "Read" : "Sent"}>{item.readAt ? "✓✓" : "✓"}</span> : null}
                    </small>
                  </article>
                ))}
                {active.typing ? <div className="typing-indicator"><span />Typing...</div> : null}
              </div>
              {showScrollBottom ? (
                <button type="button" className="chat-scroll-bottom" onClick={() => scrollToBottom()} aria-label="Scroll to newest message">
                  <KeyboardArrowDownOutlinedIcon />
                </button>
              ) : null}
              <form onSubmit={send}>
                <button type="button" aria-label="Emoji">
                  <SentimentSatisfiedAltOutlinedIcon />
                </button>
                <input value={text} onChange={(event) => handleTextChange(event.target.value)} maxLength={1000} placeholder="Message..." />
                <button type="button" aria-label="Attach file">
                  <AttachFileOutlinedIcon />
                </button>
                <button className="chat-send-button" aria-label={text.trim() ? "Send" : "Voice message"}>
                  {text.trim() ? <SendOutlinedIcon /> : <MicNoneOutlinedIcon />}
                </button>
              </form>
            </>
          ) : (
            <div className="private-state">Select a conversation.</div>
          )}
        </div>
      </section>
    </main>
  );
};

export default MessagesPage;
