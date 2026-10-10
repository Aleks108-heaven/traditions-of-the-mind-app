export interface PersonaMeta {
  n: string;
  y: string;
  mode: string;
}

export interface PersonaText {
  tag: string;
  voice: string;
  terms: string[];
}

export interface ModeData {
  label?: string;
  openers: string[];
  reflect: string[];
  technique: string[];
}

export interface CategoryInfo {
  kw: string[];
  topic?: string;
}

export interface LanguagePack {
  label: string;
  ui: Record<string, string>;
  modes: Record<string, ModeData>;
  personas: PersonaText[];
  categories: Record<string, CategoryInfo>;
  chainANotes?: string[];
  terms?: TermsText;
}

export interface ListRow {
  num: number;
  personaIdx: number;
}

export interface ChainItem {
  personaIdx: number;
}

export interface AppData {
  langs: string[];
  personaMeta: PersonaMeta[];
  chainA: ChainItem[];
  traditions: ListRow[];
  categoryOrder: string[];
  terms: TermsData;
  languages: Record<string, LanguagePack>;
}

export type ChatRole = "user" | "clinician" | "system" | "crisis";

export type ReplySource = "scripted" | "live";

export interface ChatMessage {
  /** Stable React key. Absent on history saved before this field existed. */
  id?: string;
  role: ChatRole;
  text: string;
  /** Only set for clinician/crisis replies — which engine produced this text. */
  source?: ReplySource;
}

/** An English rendering of a Dzogchen term; `by` says who uses it (omitted when no single source is named). */
export interface TermRendering {
  text: string;
  by?: string;
}

export interface TermEntry {
  key: string;
  tibetan: string;
  sanskrit?: string;
  renderings: TermRendering[];
}

export interface TermSource {
  author: string;
  title: string;
  detail: string;
}

export interface TermsData {
  terms: TermEntry[];
  sources: TermSource[];
}

/** Per-language term text, keyed by term key. Missing entries fall back to English. */
export interface TermsText {
  names?: Record<string, string>;
  short?: Record<string, string>;
  varies?: Record<string, string>;
}

export type Theme = "system" | "light" | "dark";

export type Provider = "anthropic" | "gemini" | "groq" | "openrouter" | "openai";

export interface ProviderConfig {
  label: string;
  defaultModel: string;
  keyHint: string;
}
