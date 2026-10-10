import { useEffect, useRef, useState } from "react";
import { t } from "../../lib/i18n";
import { useAppState } from "../../state/AppStateContext";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

interface ComposerProps {
  onAbout: () => void;
}

export function Composer({ onAbout }: ComposerProps) {
  const { lang, sendMessage } = useAppState();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) setTimeout(() => el.focus(), 50);
  }, []);

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  function handleSend() {
    const text = value.trim();
    if (!text) return;
    sendMessage(text);
    setValue("");
    requestAnimationFrame(autoGrow);
  }

  return (
    <div className="composer">
      <div className="composer-col">
        <div className="composer-row">
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            aria-label={t(lang, "composer_placeholder")}
            placeholder={t(lang, "composer_placeholder")}
            onChange={(e) => {
              setValue(e.target.value);
              autoGrow();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="send-btn" aria-label={t(lang, "send")} disabled={!value.trim()} onClick={handleSend}>
            <Icon name="send" />
          </button>
        </div>
        <div className="disclaimer-line">
          <span>{t(lang, "disclaimer_line")}</span>{" "}
          <Button variant="ghost" inline onClick={onAbout}>
            {t(lang, "disclaimer_full_link")}
          </Button>
        </div>
      </div>
    </div>
  );
}
