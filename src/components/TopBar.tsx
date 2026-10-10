import { useEffect, useState } from "react";
import { t } from "../lib/i18n";
import { useAppState } from "../state/AppStateContext";
import { Icon } from "./ui/Icon";
import { NavLink } from "./ui/NavLink";

interface TopBarProps {
  onLineage: () => void;
  onLibrary: () => void;
  onTraditions: () => void;
  onAbout: () => void;
  onSettings: () => void;
}

export function TopBar({ onLineage, onLibrary, onTraditions, onAbout, onSettings }: TopBarProps) {
  const { lang } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Every action closes the (mobile) menu first, so it never sits behind a dialog.
  const act = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  return (
    <header className={`topbar${menuOpen ? " menu-open" : ""}`}>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <Icon name="folder" />
        </span>
        <div className="brand-text">
          <span className="brand-word">{t(lang, "brand_title")}</span>
          <span className="brand-sub label-caps">{t(lang, "brand_sub")}</span>
        </div>
      </div>
      <div className="topbar-spacer" />
      <button
        type="button"
        className="topbar-menu-btn"
        aria-expanded={menuOpen}
        aria-controls="topbar-actions"
        aria-label={t(lang, "menu")}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <Icon name={menuOpen ? "close" : "menu"} />
      </button>
      <nav className="topbar-actions" id="topbar-actions">
        <NavLink onClick={act(onLineage)}>{t(lang, "nav_lineage")}</NavLink>
        <NavLink onClick={act(onLibrary)}>{t(lang, "nav_library")}</NavLink>
        <NavLink onClick={act(onTraditions)}>{t(lang, "nav_traditions")}</NavLink>
        <NavLink onClick={act(onAbout)}>{t(lang, "nav_about")}</NavLink>
        <NavLink onClick={act(onSettings)}>
          <Icon name="sliders" /> {t(lang, "nav_settings")}
        </NavLink>
      </nav>
    </header>
  );
}
