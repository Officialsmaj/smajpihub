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

type RichConversation = Conversation & {
  profileImage?: string;
  online?: boolean;
  displayTime?: string;
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
      const { data } = await axiosClient.get<{ messages: ChatMessage[] }>(`/messages/${activeId}`);
      setMessages(data.messages || []);
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
    const timer = window.setInterval(() => void loadMessages(), 4000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadMessages]);

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
                  {item.profileImage ? <img src={item.profileImage} alt="" /> : (item.sellerName || item.buyerName || "U").slice(0, 1)}
                  <i className={item.online ? "online" : "offline"} />
                </span>
                <div>
                  <strong>{item.sellerId === user?.uid ? item.buyerName : item.sellerName}</strong>
                  <p>{item.lastMessage || "No messages yet."}</p>
                  <small>{item.productTitle} - {item.displayTime || new Date(item.updatedAt).toLocaleString()}</small>
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
                    {active.profileImage ? <img src={active.profileImage} alt="" /> : active.sellerName?.slice(0, 1)}
                    <i className={active.online ? "online" : "offline"} />
                  </span>
                  <div>
                    <strong>{active.sellerId === user?.uid ? active.buyerName : active.sellerName}</strong>
                    <small>{active.online ? "Online" : "Marketplace conversation"}</small>
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
                    <small>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                  </article>
                ))}
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
                <input value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} placeholder="Message..." />
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
