import { useState } from "react";
import { appData } from "../../lib/appData";
import { t, fillUI } from "../../lib/i18n";
import { CR_PROVIDERS } from "../../lib/liveAi";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { RichText } from "../ui/RichText";
import { Select } from "../ui/Select";
import type { Provider, Theme } from "../../types";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    liveMode,
    setLiveMode,
    provider,
    setProvider,
    apiKey,
    setApiKey,
    apiBase,
    setApiBase,
    modelIds,
    setModelId,
    clearApiKey,
  } = useAppState();
  const [showKey, setShowKey] = useState(false);

  const cfg = CR_PROVIDERS[provider] || CR_PROVIDERS.anthropic;
  const activeModel = modelIds[provider] || "";

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

      <div className="toggle-row">
        <div>
          <label className="t-label" htmlFor="live-switch">{t(lang, "settings_live")}</label>
          <div className="t-desc">{t(lang, "settings_live_desc")}</div>
        </div>
        <span className="switch">
          <input id="live-switch" type="checkbox" role="switch" checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} />
          <span className="slider" aria-hidden="true" />
        </span>
      </div>

      {liveMode && (
        <div>
          <div className="field">
            <label htmlFor="provider-select">{t(lang, "settings_provider")}</label>
            <Select id="provider-select" className="block" value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
              {(Object.keys(CR_PROVIDERS) as Provider[]).map((k) => (
                <option key={k} value={k}>
                  {CR_PROVIDERS[k].label}
                </option>
              ))}
            </Select>
            <div className="hint">{t(lang, `tip_${provider}`)}</div>
          </div>
          <div className="field">
            <label htmlFor="api-key">{t(lang, "settings_api_key")}</label>
            <div className="input-with-action">
              <input
                type={showKey ? "text" : "password"}
                id="api-key"
                placeholder={cfg.keyHint}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={(e) => setApiKey(e.target.value.trim())}
              />
              <Button
                variant="ghost"
                size="sm"
                aria-label={t(lang, showKey ? "settings_key_hide" : "settings_key_show")}
                aria-pressed={showKey}
                onClick={() => setShowKey((s) => !s)}
              >
                <Icon name={showKey ? "eye-off" : "eye"} />
              </Button>
            </div>
            <div className="hint">{t(lang, "settings_key_stored")}</div>
          </div>
          <div className="field">
            <label htmlFor="model-id">
              {t(lang, "settings_model_id")} <span className="optional">{t(lang, "settings_optional")}</span>
            </label>
            <input
              type="text"
              id="model-id"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={fillUI(t(lang, "settings_model_default"), { model: cfg.defaultModel })}
              value={activeModel}
              onChange={(e) => setModelId(provider, e.target.value.trim())}
            />
            <div className="hint">{fillUI(t(lang, "settings_model_blank"), { model: cfg.defaultModel })}</div>
          </div>
          {provider === "openai" && (
            <div className="field">
              <label htmlFor="api-base">{t(lang, "settings_base_url")}</label>
              <input
                type="text"
                id="api-base"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="https://api.openai.com/v1"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value.trim())}
              />
              <div className="hint">{t(lang, "settings_base_url_hint")}</div>
            </div>
          )}
          <div className="callout">{t(lang, "settings_cors_note")}</div>
        </div>
      )}

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
        <Button size="sm" onClick={clearApiKey}>{t(lang, "settings_clear_key")}</Button>
        <Button variant="primary" size="sm" onClick={onClose}>{t(lang, "settings_done")}</Button>
      </div>
    </Modal>
  );
}
