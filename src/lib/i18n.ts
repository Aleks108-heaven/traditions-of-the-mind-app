import { appData } from "./appData";
import type { LanguagePack } from "../types";

export function L(lang: string): LanguagePack {
  return appData.languages[lang] || appData.languages.en;
}

export function t(lang: string, key: string): string {
  const l = L(lang);
  if (l.ui && l.ui[key] != null) return l.ui[key];
  if (appData.languages.en.ui[key] != null) return appData.languages.en.ui[key];
  return key;
}

export function fillUI(str: string, vars?: Record<string, string>): string {
  return String(str).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
}
