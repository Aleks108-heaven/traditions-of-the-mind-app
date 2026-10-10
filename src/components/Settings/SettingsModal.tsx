import { appData } from "../../lib/appData";
import { t, fillUI } from "../../lib/i18n";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";
import { Button } from "../ui/Button";
import { RichText } from "../ui/RichText";
import { Select } from "../ui/Select";
import type { Theme } from "../../types";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { lang, setLang, theme, setTheme } = useAppState();

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "settings_title")}>
      <p>{t(lang, "settings_intro")}</p>

      <div className="toggle-row">
        <div>
          <label className="t-label" htmlFor="lang-select">{t(lang, "settings_language")}</label>
          <div className="t-desc">{t(lang, "settings_language_desc")}</div>
        </div>
        <Select id="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
          {appData.langs.map((l) => (
            <option key={l} value={l}>
              {appData.languages[l].label}
            </option>
          ))}
        </Select>
      </div>

      <div className="toggle-row">
        <div>
          <label className="t-label" htmlFor="theme-select">{t(lang, "settings_theme")}</label>
          <div className="t-desc">{t(lang, "settings_theme_desc")}</div>
        </div>
        <Select id="theme-select" value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
          <option value="system">{t(lang, "theme_system")}</option>
          <option value="light">{t(lang, "theme_light")}</option>
          <option value="dark">{t(lang, "theme_dark")}</option>
        </Select>
      </div>

      <div className="toggle-row section-divider">
        <div>
          <div className="t-label">{t(lang, "settings_install")}</div>
          <div className="t-desc">{t(lang, "settings_install_desc")}</div>
        </div>
      </div>
      <p className="hint">
        <RichText text={fillUI(t(lang, "settings_install_steps"), { app: t(lang, "brand_title") })} />
      </p>

      <div className="modal-foot flush">
        <Button variant="primary" size="sm" onClick={onClose}>{t(lang, "settings_done")}</Button>
      </div>
    </Modal>
  );
}
