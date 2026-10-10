import React, { createContext, useContext, useMemo, useRef, useState, useCallback, useEffect } from "react";
import {
  asBoolean,
  asFiniteNumber,
  asString,
  isRecord,
  lsGet,
  lsSet,
  oneOf,
  recordOf,
  type Coerce,
} from "../lib/storage";
import { appData, detectLang } from "../lib/appData";
import { applyTheme } from "../lib/theme";
import { personaText } from "../lib/personas";
import { openerFor, introFor, respond } from "../lib/scriptedEngine";
import { buildLiveSystemPrompt, crProviderReply, CR_PROVIDERS, LiveAiError, type ChatTurn } from "../lib/liveAi";
import { t } from "../lib/i18n";
import type { ChatMessage, ChatRole, Provider, Theme } from "../types";

type View = "library" | "chat";

const THEMES: readonly Theme[] = ["system", "light", "dark"];
const CHAT_ROLES: readonly ChatRole[] = ["user", "clinician", "system", "crisis"];

// Persisted history is untrusted: keep the well-formed messages, drop the rest.
const asChatMessages: Coerce<ChatMessage[]> = (v) => {
  if (!Array.isArray(v)) return undefined;
  return v.filter(
    (m): m is ChatMessage =>
      isRecord(m) && typeof m.text === "string" && CHAT_ROLES.includes(m.role as ChatRole)
  );
};

let messageSeq = 0;
const newId = () => `${Date.now().toString(36)}-${(messageSeq++).toString(36)}`;

interface AppStateValue {
  // ephemeral UI state
  view: View;
  currentPersonaIdx: number | null;
  search: string;
  school: string;
  isTyping: boolean;

  // persisted settings
  lang: string;
  theme: Theme;
  liveMode: boolean;
  provider: Provider;
  apiKey: string;
  apiBase: string;
  modelIds: Partial<Record<Provider, string>>;

  // persisted chat data
  chatHistories: Record<number, ChatMessage[]>;
  turnCounts: Record<number, number>;

  // actions
  setSearch: (v: string) => void;
  setSchool: (v: string) => void;
  setLang: (v: string) => void;
  setTheme: (v: Theme) => void;
  setLiveMode: (v: boolean) => void;
  setProvider: (v: Provider) => void;
  setApiKey: (v: string) => void;
  setApiBase: (v: string) => void;
  setModelId: (provider: Provider, modelId: string) => void;
  clearApiKey: () => void;
  openPersona: (idx: number) => void;
  goLibrary: () => void;
  sendMessage: (text: string) => void;
  clearChat: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("library");
  const [currentPersonaIdx, setCurrentPersonaIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [school, setSchool] = useState("");
  const [typingIdx, setTypingIdx] = useState<number | null>(null);
  // Only the conversation that is waiting on a reply shows the typing indicator.
  const isTyping = typingIdx !== null && typingIdx === currentPersonaIdx;
  const stopTyping = useCallback((idx: number) => setTypingIdx((cur) => (cur === idx ? null : cur)), []);

  const [lang, setLangState] = useState<string>(() => detectLang(lsGet<string | null>("lang", null, asString)));
  const [theme, setThemeState] = useState<Theme>(() => lsGet<Theme>("theme", "system", oneOf(THEMES)));
  const [liveMode, setLiveModeState] = useState<boolean>(() => lsGet("liveMode", false, asBoolean));
  const [provider, setProviderState] = useState<Provider>(() =>
    lsGet<Provider>("provider", "gemini", oneOf(Object.keys(CR_PROVIDERS) as Provider[]))
  );
  const [apiKey, setApiKeyState] = useState<string>(() => lsGet("apiKey", "", asString));
  const [apiBase, setApiBaseState] = useState<string>(() => lsGet("apiBase", "", asString));
  const [modelIds, setModelIdsState] = useState<Partial<Record<Provider, string>>>(() => {
    const ids = lsGet<Partial<Record<Provider, string>>>("modelIds", {}, recordOf(asString));
    // migrate the old single "modelId" key (pre-multi-provider) onto its own provider only
    const legacy = lsGet("modelId", "", asString);
    if (legacy && !Object.keys(ids).length) {
      const migrated = { ...ids, anthropic: legacy };
      lsSet("modelIds", migrated);
      return migrated;
    }
    return ids;
  });

  const [chatHistories, setChatHistories] = useState<Record<number, ChatMessage[]>>(() =>
    lsGet<Record<number, ChatMessage[]>>("chatHistories", {}, recordOf(asChatMessages))
  );
  const [turnCounts, setTurnCounts] = useState<Record<number, number>>(() =>
    lsGet<Record<number, number>>("turnCounts", {}, recordOf(asFiniteNumber))
  );
  const [historyLang, setHistoryLang] = useState<Record<number, string>>(() =>
    lsGet<Record<number, string>>("historyLang", {}, recordOf(asString))
  );

  // shown at most once per session, matching the original silent-fallback behaviour
  const liveWarnShown = useRef(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Keep <html lang> in step with the UI language (screen-reader pronunciation, hyphenation, quotes).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((v: string) => {
    setLangState(v);
    lsSet("lang", v);
  }, []);
  const setTheme = useCallback((v: Theme) => {
    setThemeState(v);
    lsSet("theme", v);
  }, []);
  const setLiveMode = useCallback((v: boolean) => {
    setLiveModeState(v);
    lsSet("liveMode", v);
  }, []);
  const setProvider = useCallback((v: Provider) => {
    setProviderState(v);
    lsSet("provider", v);
  }, []);
  const setApiKey = useCallback((v: string) => {
    setApiKeyState(v);
    lsSet("apiKey", v);
  }, []);
  const setApiBase = useCallback((v: string) => {
    setApiBaseState(v);
    lsSet("apiBase", v);
  }, []);
  const setModelId = useCallback((p: Provider, modelId: string) => {
    setModelIdsState((prev) => {
      const next = { ...prev, [p]: modelId };
      lsSet("modelIds", next);
      return next;
    });
  }, []);
  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    lsSet("apiKey", "");
  }, []);

  const pushMessage = useCallback((idx: number, msg: ChatMessage) => {
    setChatHistories((prev) => {
      const next = { ...prev, [idx]: [...(prev[idx] || []), { ...msg, id: msg.id ?? newId() }] };
      lsSet("chatHistories", next);
      return next;
    });
  }, []);

  const openPersona = useCallback(
    (idx: number) => {
      if (idx < 0 || idx == null) return;
      setCurrentPersonaIdx(idx);
      setView("chat");

      const hasRealConversation = !!turnCounts[idx];
      const existing = chatHistories[idx];
      const staleLang = existing && existing.length && !hasRealConversation && historyLang[idx] !== lang;

      if (staleLang || !existing || !existing.length) {
        const intro: ChatMessage = { id: newId(), role: "system", text: introFor(lang, idx) };
        const opener: ChatMessage = { id: newId(), role: "clinician", source: "scripted", text: openerFor(lang, idx) };
        const next = [intro, opener];
        setChatHistories((prev) => {
          const merged = { ...prev, [idx]: next };
          lsSet("chatHistories", merged);
          return merged;
        });
        setHistoryLang((prev) => {
          const merged = { ...prev, [idx]: lang };
          lsSet("historyLang", merged);
          return merged;
        });
      }
    },
    [chatHistories, historyLang, lang, turnCounts]
  );

  const goLibrary = useCallback(() => setView("library"), []);

  const clearChat = useCallback(() => {
    const idx = currentPersonaIdx;
    if (idx == null) return;
    setChatHistories((prev) => {
      const next = { ...prev, [idx]: [] };
      lsSet("chatHistories", next);
      return next;
    });
    setTurnCounts((prev) => {
      const next = { ...prev, [idx]: 0 };
      lsSet("turnCounts", next);
      return next;
    });
    openPersona(idx);
  }, [currentPersonaIdx, openPersona]);

  const sendMessage = useCallback(
    (text: string) => {
      const idx = currentPersonaIdx;
      if (!text.trim() || idx == null) return;
      pushMessage(idx, { role: "user", text });

      const nextTurn = (turnCounts[idx] || 0) + 1;
      setTurnCounts((prev) => {
        const next = { ...prev, [idx]: nextTurn };
        lsSet("turnCounts", next);
        return next;
      });

      const fallback = () => {
        const reply = respond(lang, idx, text, nextTurn);
        pushMessage(idx, reply);
      };

      setTypingIdx(idx);

      if (liveMode && apiKey) {
        const meta = appData.personaMeta[idx];
        const txt = personaText(lang, idx);
        const hist = (chatHistories[idx] || [])
          .filter((m) => m.role === "user" || m.role === "clinician")
          .slice(-16);
        const turns: ChatTurn[] = hist.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }));
        turns.push({ role: "user", content: text });
        const sys = buildLiveSystemPrompt(lang, meta, txt);
        const activeModel = (modelIds[provider] || "").trim();

        crProviderReply(provider, apiKey, activeModel, sys, turns, apiBase)
          .then((reply) => {
            stopTyping(idx);
            pushMessage(idx, { role: "clinician", source: "live", text: reply });
          })
          .catch((err: unknown) => {
            stopTyping(idx);
            if (!liveWarnShown.current) {
              liveWarnShown.current = true;
              const message = err instanceof LiveAiError || err instanceof Error ? err.message : String(err);
              pushMessage(idx, {
                role: "system",
                text: `${t(lang, "msg_live_fallback_note") || "Live reply unavailable — using the scripted engine."} (${message})`,
              });
            }
            fallback();
          });
      } else {
        setTimeout(() => {
          stopTyping(idx);
          fallback();
        }, 380 + Math.random() * 420);
      }
    },
    [apiBase, apiKey, chatHistories, currentPersonaIdx, lang, liveMode, modelIds, provider, pushMessage, stopTyping, turnCounts]
  );

  const value: AppStateValue = useMemo(
    () => ({
      view,
      currentPersonaIdx,
      search,
      school,
      isTyping,
      lang,
      theme,
      liveMode,
      provider,
      apiKey,
      apiBase,
      modelIds,
      chatHistories,
      turnCounts,
      setSearch,
      setSchool,
      setLang,
      setTheme,
      setLiveMode,
      setProvider,
      setApiKey,
      setApiBase,
      setModelId,
      clearApiKey,
      openPersona,
      goLibrary,
      sendMessage,
      clearChat,
    }),
    [
      view,
      currentPersonaIdx,
      search,
      school,
      isTyping,
      lang,
      theme,
      liveMode,
      provider,
      apiKey,
      apiBase,
      modelIds,
      chatHistories,
      turnCounts,
      setLang,
      setTheme,
      setLiveMode,
      setProvider,
      setApiKey,
      setApiBase,
      setModelId,
      clearApiKey,
      openPersona,
      goLibrary,
      sendMessage,
      clearChat,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
