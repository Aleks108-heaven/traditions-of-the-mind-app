import React, { useEffect, useId, useRef } from "react";
import { t } from "../lib/i18n";
import { useAppState } from "../state/AppStateContext";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: number;
  children: React.ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, ...rest }: ModalProps) {
  return open ? <ModalDialog {...rest} /> : null;
}

function ModalDialog({ onClose, title, maxWidth, children }: Omit<ModalProps, "open">) {
  const { lang } = useAppState();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog on open and hand it back to the trigger on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;
    const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="modal-veil"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={maxWidth ? { maxWidth } : undefined}
        onKeyDown={handleKeyDown}
      >
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={t(lang, "close")}>
            <Icon name="close" />
          </Button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
