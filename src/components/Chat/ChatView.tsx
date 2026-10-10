import { useEffect, useRef } from "react";
import { appData } from "../../lib/appData";
import { t } from "../../lib/i18n";
import { schoolLabel, personaText } from "../../lib/personas";
import { useAppState } from "../../state/AppStateContext";
import { Button } from "../ui/Button";
import { MessageBubble, TypingBubble } from "./MessageBubble";
import { Composer } from "./Composer";

interface ChatViewProps {
  onAbout: () => void;
}

export function ChatView({ onAbout }: ChatViewProps) {
  const { lang, currentPersonaIdx, chatHistories, isTyping, liveMode, apiKey, goLibrary, clearChat } = useAppState();
  const scrollRef = useRef<HTMLDivElement>(null);

  const idx = currentPersonaIdx;
  const meta = idx != null ? appData.personaMeta[idx] : null;
  const txt = idx != null ? personaText(lang, idx) : null;
  const history = idx != null ? chatHistories[idx] || [] : [];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length, isTyping]);

  if (idx == null || !meta || !txt) return null;

  const school = schoolLabel(lang, meta.mode);
  const sameAsTag = school.toLowerCase().indexOf(txt.tag.toLowerCase()) > -1 || txt.tag.toLowerCase().indexOf(school.toLowerCase()) > -1;
  const metaLine = sameAsTag ? `${meta.y} · ${txt.tag}` : `${meta.y} · ${school} · ${txt.tag}`;
  const showLiveBadge = liveMode && !!apiKey;

  return (
    <div className="view" id="view-chat">
      <div className="chat-head">
        <Button variant="ghost" size="sm" onClick={goLibrary}>{t(lang, "chat_back")}</Button>
        <div className="persona-id">
          <div className="name">{meta.n}</div>
          <div className="meta">{metaLine}</div>
        </div>
        {showLiveBadge && <span className="live-badge">{t(lang, "live_badge")}</span>}
        <Button variant="ghost" size="sm" onClick={clearChat}>{t(lang, "chat_clear")}</Button>
      </div>
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-col" role="log" aria-live="polite" aria-relevant="additions" aria-label={`${t(lang, "chat_log")} — ${meta.n}`}>
          {history.map((m, i) => (
            <MessageBubble key={m.id ?? i} message={m} personaName={meta.n} lang={lang} />
          ))}
          {isTyping && <TypingBubble personaName={meta.n} lang={lang} />}
        </div>
      </div>
      <Composer key={idx} onAbout={onAbout} />
    </div>
  );
}
