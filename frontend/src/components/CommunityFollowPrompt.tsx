import { useEffect, useMemo, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TelegramIcon from "@mui/icons-material/Telegram";
import XIcon from "@mui/icons-material/X";
import { useAuthContext } from "../contexts/AuthContext";

type CommunityPreference = {
  dismissedUntil?: number;
  followedX?: boolean;
  joinedTelegram?: boolean;
};

const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 5000;
const preferenceKey = (uid: string) => `smaj:community-follow:${uid}`;

const readPreference = (uid: string): CommunityPreference => {
  try {
    return JSON.parse(window.localStorage.getItem(preferenceKey(uid)) || "{}") as CommunityPreference;
  } catch {
    return {};
  }
};

const CommunityFollowPrompt = () => {
  const { user } = useAuthContext();
  const uid = user?.uid || "";
  const [open, setOpen] = useState(false);
  const [preference, setPreference] = useState<CommunityPreference>(() => uid ? readPreference(uid) : {});

  useEffect(() => {
    if (!uid) return;
    const next = readPreference(uid);
    const syncTimer = window.setTimeout(() => { setPreference(next); setOpen(false); }, 0);
    const shouldShow = window.matchMedia("(max-width: 1023px)").matches && !(next.followedX && next.joinedTelegram) && (next.dismissedUntil || 0) <= Date.now();
    const showTimer = shouldShow ? window.setTimeout(() => setOpen(true), SHOW_DELAY_MS) : null;
    return () => {
      window.clearTimeout(syncTimer);
      if (showTimer) window.clearTimeout(showTimer);
    };
  }, [uid]);

  const available = useMemo(() => ({ x: !preference.followedX, telegram: !preference.joinedTelegram }), [preference]);
  const save = (next: CommunityPreference) => {
    setPreference(next);
    if (uid) window.localStorage.setItem(preferenceKey(uid), JSON.stringify(next));
    if (next.followedX && next.joinedTelegram) setOpen(false);
  };
  const dismiss = () => {
    save({ ...preference, dismissedUntil: Date.now() + DISMISS_FOR_MS });
    setOpen(false);
  };
  const complete = (platform: "x" | "telegram") => {
    save({ ...preference, dismissedUntil: 0, ...(platform === "x" ? { followedX: true } : { joinedTelegram: true }) });
  };

  if (!open || !uid) return null;
  return <aside className="community-follow-prompt" role="dialog" aria-modal="false" aria-label="Join the SMAJ community">
    <button type="button" className="community-follow-close" onClick={dismiss} aria-label="Close community invitation"><CloseRoundedIcon /></button>
    <div><small>SMAJ COMMUNITY</small><strong>Join the SMAJ Community</strong><p>Get service news, support, and important updates.</p></div>
    <div className="community-follow-actions">
      {available.x ? <a href="https://x.com/smajpihub" target="_blank" rel="noreferrer" onClick={() => complete("x")}><XIcon />Follow on X</a> : null}
      {available.telegram ? <a href="https://t.me/smajpihub" target="_blank" rel="noreferrer" onClick={() => complete("telegram")}><TelegramIcon />Join Telegram</a> : null}
    </div>
    <button type="button" className="community-follow-later" onClick={dismiss}>Maybe later</button>
  </aside>;
};

export default CommunityFollowPrompt;
