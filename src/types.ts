export interface Tradition {
  /** Position in the list, 1-based. */
  num: number;
  n: string;
  y: string;
  mode: string;
}

export interface TraditionText {
  tag: string;
  terms: string[];
}

export interface LanguagePack {
  label: string;
  ui: Record<string, string>;
  /** Parallel to AppData.traditions. Absent (or a null entry) means "fall back to English". */
  traditions?: (TraditionText | null)[];
}

export interface AppData {
  langs: string[];
  traditions: Tradition[];
  languages: Record<string, LanguagePack>;
}

export type Theme = "system" | "light" | "dark";
