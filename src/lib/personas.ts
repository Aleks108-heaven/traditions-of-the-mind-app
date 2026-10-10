import { appData } from "./appData";
import { L } from "./i18n";
import type { ModeData, PersonaText } from "../types";

export function personaIdxByName(name: string): number {
  for (let i = 0; i < appData.personaMeta.length; i++) {
    if (appData.personaMeta[i].n === name) return i;
  }
  return -1;
}

export function personaText(lang: string, idx: number): PersonaText {
  const l = L(lang);
  return (l.personas && l.personas[idx]) || appData.languages.en.personas[idx];
}

export function modeData(lang: string, mode: string): ModeData {
  const l = L(lang);
  return (l.modes && l.modes[mode]) || appData.languages.en.modes[mode];
}

export function schoolLabel(lang: string, mode: string): string {
  const m = modeData(lang, mode);
  return (m && m.label) || mode;
}

export function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const a = parts[0] ? parts[0][0] : "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}
