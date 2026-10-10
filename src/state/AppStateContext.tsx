import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { asString, lsGet, lsSet, oneOf } from "../lib/storage";
import { detectLang } from "../lib/appData";
import { applyTheme } from "../lib/theme";
import type { Theme } from "../types";

const THEMES: readonly Theme[] = ["system", "light", "dark"];

interface AppStateValue {
  // ephemeral UI state
  search: string;

  // persisted settings
  lang: string;
  theme: Theme;

  // actions
  setSearch: (v: string) => void;
  setLang: (v: string) => void;
  setTheme: (v: Theme) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");
  const [lang, setLangState] = useState<string>(() => detectLang(lsGet<string | null>("lang", null, asString)));
  const [theme, setThemeState] = useState<Theme>(() => lsGet<Theme>("theme", "system", oneOf(THEMES)));

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

  const value: AppStateValue = useMemo(
    () => ({ search, lang, theme, setSearch, setLang, setTheme }),
    [search, lang, theme, setLang, setTheme]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
