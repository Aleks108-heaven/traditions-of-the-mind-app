import { t } from "../../lib/i18n";
import { initials } from "../../lib/personas";
import type { ChatMessage } from "../../types";
import { Icon } from "../ui/Icon";

interface MessageBubbleProps {
  message: ChatMessage;
  personaName: string;
  lang: string;
}

export function MessageBubble({ message, personaName, lang }: MessageBubbleProps) {
  const cls =
    message.role === "user" ? "user" : message.role === "system" ? "system" : message.role === "crisis" ? "crisis" : "clinician";
  const showAvatar = message.role !== "user";
  // Missing source only happens for chat history saved before this field existed —
  // all of that was necessarily scripted (Live mode never wrote messages back then).
  const showSourceBadge = message.role === "clinician";
  const source = message.source || "scripted";
  return (
    <div className={`msg ${cls}`}>
      {showAvatar && (
        <div className="avatar" aria-hidden="true">
          {message.role === "system" || message.role === "crisis" ? <Icon name="info" /> : initials(personaName)}
        </div>
      )}
      <div>
        {showSourceBadge && (
          <div className="reply-source">{t(lang, source === "live" ? "live_badge" : "scripted_badge")}</div>
        )}
        {/* A crisis message must interrupt a screen-reader user; everything else is announced politely by the log. */}
        <div className="bubble" role={message.role === "crisis" ? "alert" : undefined}>
          {message.text}
        </div>
      </div>
    </div>
  );
}

export function TypingBubble({ personaName, lang }: { personaName: string; lang: string }) {
  return (
    <div className="msg clinician" role="status">
      <div className="avatar" aria-hidden="true">
        {initials(personaName)}
      </div>
      <div className="bubble">
        <span className="typing" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sr-only">
          {personaName} {t(lang, "chat_typing")}
        </span>
      </div>
    </div>
  );
}
