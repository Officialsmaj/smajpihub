import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { axiosClient } from "../../lib/axiosClient";
import { useAuthContext } from "../../contexts/AuthContext";
import type { ChatMessage, Conversation } from "../../types/marketplace";
import TrustBadge from "../../components/TrustBadge";
import PrivateSkeleton from "../../components/PrivateSkeleton";
import PullToRefresh from "../../components/PullToRefresh";
import { uploadImage } from "../../lib/uploadImage";

type RichConversation = Conversation & {
  profileImage?: string;
  online?: boolean;
  displayTime?: string;
};

type VoicePreview = {
  blob: Blob;
  url: string;
  mimeType: string;
  durationSeconds: number;
};

const getConversationName = (conversation: RichConversation, currentUserId?: string) =>
  conversation.participantName || (conversation.sellerId === currentUserId ? conversation.buyerName : conversation.sellerName) || "SMAJ user";

const getConversationInitial = (conversation: RichConversation, currentUserId?: string) =>
  getConversationName(conversation, currentUserId).slice(0, 1).toUpperCase();

const getConversationRoleLabel = (conversation: RichConversation, currentUserId?: string) =>
  conversation.sellerId === currentUserId ? "Buyer" : "Seller";

const getConversationMeta = (conversation: RichConversation, currentUserId?: string) =>
  [
    getConversationRoleLabel(conversation, currentUserId),
    conversation.lastMessage || "No messages yet",
    conversation.productTitle,
  ].filter(Boolean).join(" · ");

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

const formatVoiceTime = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, "0")}`;
};

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ""));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

const MAX_CHAT_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_CHAT_DOCUMENT_BYTES = 3 * 1024 * 1024;

const MessagesPage = () => {
  const { user } = useAuthContext();
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState<RichConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [text, setText] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voicePreview, setVoicePreview] = useState<VoicePreview | null>(null);
  const [voiceError, setVoiceError] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam or scam");
  const [inboxFilter, setInboxFilter] = useState<"inbox" | "archived">("inbox");
  const [archivedIds, setArchivedIds] = useState<string[]>(() => {
    try { return JSON.parse(window.localStorage.getItem("smaj_archived_conversations") || "[]"); } catch { return []; }
  });
  const [sendingVoice, setSendingVoice] = useState(false);
  const [sendingAttachment, setSendingAttachment] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const nearBottomRef = useRef(true);
  const typingTimeoutRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const keepRecordingRef = useRef(true);
  const selectedId = params.get("conversation");
  const filteredConversations = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((item) => [
      getConversationName(item, user?.uid),
      getConversationRoleLabel(item, user?.uid),
      item.productTitle,
      item.lastMessage,
      item.buyerName,
      item.sellerName,
    ].join(" ").toLowerCase().includes(query)).filter((item) => inboxFilter === "archived" ? archivedIds.includes(item._id) : !archivedIds.includes(item._id));
  }, [archivedIds, conversationSearch, conversations, inboxFilter, user?.uid]);
  const activeId = selectedId || filteredConversations[0]?._id || (!conversationSearch.trim() ? conversations[0]?._id : undefined);
  const active = useMemo(() => conversations.find((item) => item._id === activeId), [activeId, conversations]);

  const archiveConversation = (conversationId: string, archive: boolean) => {
    setArchivedIds((current) => {
      const next = archive ? Array.from(new Set([...current, conversationId])) : current.filter((id) => id !== conversationId);
      window.localStorage.setItem("smaj_archived_conversations", JSON.stringify(next));
      return next;
    });
    setMoreOpen(false);
    if (archive) setParams({});
  };

  const submitConversationReport = async () => {
    if (!active) return;
    try {
      await axiosClient.post("/support", { source: "conversation-report", topic: "Safety report", message: `${reportReason}\nConversation: ${active._id}\nProduct: ${active.productTitle || "Not specified"}` });
      setReportOpen(false);
      setVoiceError("Report sent for review.");
    } catch {
      setVoiceError("Could not send the report. Try again.");
    }
  };

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await axiosClient.get<{ conversations: RichConversation[] }>("/messages");
      setConversations(data.conversations || []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConversations(false);
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
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
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
    try {
      const { data } = await axiosClient.post<{ message: ChatMessage }>(`/messages/${activeId}`, { message });
      if (data.message) setMessages((current) => [...current, data.message]);
      await Promise.all([loadMessages(), loadConversations()]);
    } catch {
      setText(message);
    }
  };

  const clearVoicePreview = useCallback(() => {
    setVoicePreview((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
  };

  const stopRecordingTracks = () => {
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;
  };

  const startVoiceRecording = async () => {
    if (!activeId || recording) return;
    clearVoicePreview();
    setVoiceError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceError("Voice recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recordingStreamRef.current = stream;
      recorderRef.current = recorder;
      recordingChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();
      keepRecordingRef.current = true;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stopRecordingTimer();
        stopRecordingTracks();
        setRecording(false);
        const durationSeconds = Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000));
        const chunks = recordingChunksRef.current;
        recordingChunksRef.current = [];
        if (!keepRecordingRef.current) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (!blob.size) {
          setVoiceError("Could not capture audio. Please try again.");
          return;
        }
        setVoicePreview({
          blob,
          url: URL.createObjectURL(blob),
          mimeType: blob.type || "audio/webm",
          durationSeconds,
        });
      };

      recorder.start();
      setRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(Math.max(0, Math.round((Date.now() - recordingStartedAtRef.current) / 1000)));
      }, 500);
    } catch {
      stopRecordingTimer();
      stopRecordingTracks();
      setRecording(false);
      setVoiceError("Microphone permission is needed to record a voice note.");
    }
  };

  const stopVoiceRecording = () => {
    keepRecordingRef.current = true;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const cancelVoiceRecording = () => {
    keepRecordingRef.current = false;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    stopRecordingTimer();
    stopRecordingTracks();
    setRecording(false);
    setRecordingSeconds(0);
    clearVoicePreview();
    setVoiceError("");
  };

  const sendVoiceNote = async () => {
    if (!activeId || !voicePreview || sendingVoice) return;
    setSendingVoice(true);
    setVoiceError("");
    try {
      const audioDataUrl = await blobToDataUrl(voicePreview.blob);
      await axiosClient.post(`/messages/${activeId}`, {
        messageType: "voice",
        audioDataUrl,
        audioMimeType: voicePreview.mimeType,
        audioDurationSeconds: voicePreview.durationSeconds,
      });
      clearVoicePreview();
      nearBottomRef.current = true;
      await Promise.all([loadMessages(), loadConversations()]);
    } catch {
      setVoiceError("Voice note could not be sent. Try a shorter recording.");
    } finally {
      setSendingVoice(false);
    }
  };

  const sendAttachment = async (file: File | undefined, messageType: "image" | "document") => {
    if (!activeId || !file || sendingAttachment) return;
    setAttachOpen(false);
    setVoiceError("");
    setSendingAttachment(true);
    nearBottomRef.current = true;
    try {
      if (messageType === "image") {
        if (!file.type.startsWith("image/") || file.size > MAX_CHAT_IMAGE_BYTES) {
          setVoiceError("Choose a JPG, PNG, WebP, or GIF photo that is 2 MB or smaller.");
          return;
        }
        const imageDataUrl = await blobToDataUrl(file);
        const attachmentUrl = await uploadImage(imageDataUrl, "message-photos");
        await axiosClient.post(`/messages/${activeId}`, {
          messageType,
          attachmentUrl,
          attachmentName: file.name,
          attachmentMimeType: file.type,
          attachmentSize: file.size,
        });
      } else {
        if (file.size > MAX_CHAT_DOCUMENT_BYTES) {
          setVoiceError("Choose a document that is 3 MB or smaller.");
          return;
        }
        const attachmentDataUrl = await blobToDataUrl(file);
        await axiosClient.post(`/messages/${activeId}`, {
          messageType,
          attachmentDataUrl,
          attachmentName: file.name,
          attachmentMimeType: file.type || "application/octet-stream",
          attachmentSize: file.size,
        });
      }
      await Promise.all([loadMessages(), loadConversations()]);
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : "Attachment could not be sent. Try a smaller file.");
    } finally {
      setSendingAttachment(false);
    }
  };

  return (
    <main className={`private-page messages-page ${selectedId ? "conversation-selected" : ""}`}>
      <PullToRefresh onRefresh={() => Promise.all([loadConversations(), loadMessages()]).then(() => undefined)} />
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
          <label className="conversation-search">
            <SearchOutlinedIcon />
            <input value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} placeholder="Search conversations" />
          </label>
          <div className="conversation-filters"><button type="button" className={inboxFilter === "inbox" ? "active" : ""} onClick={() => setInboxFilter("inbox")}>Inbox</button><button type="button" className={inboxFilter === "archived" ? "active" : ""} onClick={() => setInboxFilter("archived")}>Archived</button></div>
          {loadingConversations ? <PrivateSkeleton variant="messages" count={6} /> : filteredConversations.length ? (
            filteredConversations.map((item) => (
              <button className={item._id === activeId ? "active" : ""} key={item._id} onClick={() => setParams({ conversation: item._id })}>
                <span className="conversation-avatar">
                  {item.profileImage ? <img src={item.profileImage} alt="" /> : getConversationInitial(item, user?.uid)}
                  <i className={item.online ? "online" : "offline"} />
                </span>
                <div>
                  <strong className="conversation-name">{getConversationName(item, user?.uid)}<TrustBadge level={item.verificationLevel} status={item.verificationStatus} /></strong>
                  <p className="conversation-meta-line">{getConversationMeta(item, user?.uid)}</p>
                  <small>{formatLastSeen(item)}</small>
                </div>
                {item.unreadBy?.length ? <b>{item.unreadBy.length}</b> : null}
              </button>
            ))
          ) : (
            <div className="private-state compact">
              <h3>{conversations.length ? "No conversations found" : "No conversations yet"}</h3>
              <p>Start a chat from a product page when contacting a seller.</p>
              <Link className="private-secondary-button messages-empty-browse" to="/store">Browse Products</Link>
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
                    <strong className="conversation-name">{getConversationName(active, user?.uid)}<TrustBadge level={active.verificationLevel} status={active.verificationStatus} /></strong>
                    <small>{active.typing ? "Typing..." : formatLastSeen(active)}</small>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button type="button" onClick={() => setReportOpen(true)} aria-label="Report conversation" title="Report conversation">
                    <FlagOutlinedIcon />
                  </button>
                  <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} aria-label="More options">
                    <MoreVertOutlinedIcon />
                  </button>
                  {moreOpen ? <div className="chat-more-menu"><Link to={`/seller/${active.participantId || (active.sellerId === user?.uid ? active.buyerId : active.sellerId)}`}>View profile</Link><Link to={`/product/${active.productId}`}>View product</Link><button type="button" onClick={() => { setMoreOpen(false); setVoiceError("Conversation muted."); }}>Mute notifications</button><button type="button" onClick={() => archiveConversation(active._id, !archivedIds.includes(active._id))}>{archivedIds.includes(active._id) ? "Unarchive" : "Archive conversation"}</button><button type="button" onClick={() => { setMoreOpen(false); setVoiceError("User blocked locally. You can report the conversation for review."); }}>Block user</button></div> : null}
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
                    {item.messageType === "voice" && item.audioDataUrl ? (
                      <div className="voice-message">
                        <MicNoneOutlinedIcon />
                        <audio controls src={item.audioDataUrl}>
                          <track kind="captions" />
                        </audio>
                        <span>{formatVoiceTime(item.audioDurationSeconds || 0)}</span>
                      </div>
                    ) : item.messageType === "image" && (item.attachmentUrl || item.attachmentDataUrl) ? (
                      <figure className="chat-attachment chat-photo-message">
                        <img src={item.attachmentUrl || item.attachmentDataUrl} alt={item.attachmentName || "Shared photo"} />
                        <figcaption>{item.attachmentName || "Photo"}</figcaption>
                      </figure>
                    ) : item.messageType === "document" && item.attachmentDataUrl ? (
                      <a className="chat-attachment chat-document-message" href={item.attachmentDataUrl} download={item.attachmentName || "document"} target="_blank" rel="noreferrer">
                        <DescriptionOutlinedIcon />
                        <span>
                          <strong>{item.attachmentName || "Document"}</strong>
                          <small>{item.attachmentMimeType || "File"}</small>
                        </span>
                      </a>
                    ) : (
                      <p>{item.message || "Message"}</p>
                    )}
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
              {recording || voicePreview ? (
                <div className="voice-recorder-bar">
                  <button type="button" onClick={cancelVoiceRecording} aria-label="Cancel voice note">Cancel</button>
                  <span className={recording ? "recording-live" : ""}>
                    <MicNoneOutlinedIcon />
                    {recording ? `Recording ${formatVoiceTime(recordingSeconds)}` : `Voice note ${formatVoiceTime(voicePreview?.durationSeconds || 0)}`}
                  </span>
                  {voicePreview ? (
                    <audio controls src={voicePreview.url}>
                      <track kind="captions" />
                    </audio>
                  ) : null}
                  {recording ? (
                    <button type="button" className="chat-send-button" onClick={stopVoiceRecording} aria-label="Stop recording">Stop</button>
                  ) : (
                    <button type="button" className="chat-send-button" onClick={sendVoiceNote} disabled={sendingVoice} aria-label="Send voice note">
                      <SendOutlinedIcon />
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={send}>
                  <input ref={photoInputRef} className="chat-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => { void sendAttachment(event.target.files?.[0], "image"); event.currentTarget.value = ""; }} />
                  <input ref={documentInputRef} className="chat-file-input" type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => { void sendAttachment(event.target.files?.[0], "document"); event.currentTarget.value = ""; }} />
                  <button type="button" onClick={() => setEmojiOpen((open) => !open)} aria-label="Emoji">
                    <SentimentSatisfiedAltOutlinedIcon />
                  </button>
                  <input value={text} onChange={(event) => handleTextChange(event.target.value)} maxLength={1000} placeholder="Message..." />
                  <button type="button" onClick={() => setAttachOpen(true)} aria-label="Attach file">
                    <AttachFileOutlinedIcon />
                  </button>
                  <button
                    type={text.trim() ? "submit" : "button"}
                    className="chat-send-button"
                    onClick={text.trim() ? undefined : startVoiceRecording}
                    aria-label={text.trim() ? "Send" : "Record voice note"}
                  >
                    {text.trim() ? <SendOutlinedIcon /> : <MicNoneOutlinedIcon />}
                  </button>
                </form>
              )}
              {emojiOpen ? <div className="chat-emoji-picker" role="dialog" aria-label="Choose an emoji">{["👍", "😊", "❤️", "👋", "🔥", "😍", "😂", "🙏"].map((emoji) => <button key={emoji} type="button" onClick={() => { setText((current) => `${current}${emoji}`); setEmojiOpen(false); }}>{emoji}</button>)}</div> : null}
              {attachOpen ? <div className="chat-action-sheet" role="dialog" aria-modal="true" aria-label="Attachments"><button type="button" disabled={sendingAttachment} onClick={() => photoInputRef.current?.click()}><ImageOutlinedIcon />Photo sharing</button><button type="button" disabled={sendingAttachment} onClick={() => documentInputRef.current?.click()}><DescriptionOutlinedIcon />Document sharing</button><button type="button" onClick={() => setAttachOpen(false)}>Cancel</button></div> : null}
              {reportOpen ? <div className="chat-action-sheet" role="dialog" aria-modal="true" aria-label="Report conversation"><strong>Report conversation</strong><select value={reportReason} onChange={(event) => setReportReason(event.target.value)}><option>Spam or scam</option><option>Harassment</option><option>Unsafe payment request</option><option>Misleading product information</option><option>Other</option></select><button type="button" className="chat-report-submit" onClick={() => void submitConversationReport()}>Submit report</button><button type="button" onClick={() => setReportOpen(false)}>Cancel</button></div> : null}
              {voiceError ? <p className="voice-recorder-error">{voiceError}</p> : null}
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
