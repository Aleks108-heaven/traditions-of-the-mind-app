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
  library?: LibraryText;
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
  library: LibraryData;
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

/** What kind of statement something is: documented fact, a traditional account, or a summary of an idea (check the named work). */
export type LibraryStatus = "historical" | "tradition" | "summary";

export interface LibraryLink {
  label: string;
  url: string;
}

export interface LibraryWork {
  id: string;
  title: string;
  tibetan?: string;
  edition?: string;
  status: "historical" | "tradition";
}

export interface LibraryTeacher {
  key: string;
  /** Must match a character's name in personaMeta. */
  name: string;
  ideaStatus: LibraryStatus;
  works: LibraryWork[];
  links: LibraryLink[];
}

export interface LibraryData {
  teachers: LibraryTeacher[];
  general: LibraryLink[];
  glossary: { key: string; tibetan: string }[];
}

/** Per-language library text, keyed by teacher key / work id / glossary key. Missing entries fall back to English. */
export interface LibraryText {
  ideas?: Record<string, string>;
  notes?: Record<string, string>;
  terms?: Record<string, string>;
  glossary?: Record<string, string>;
}

export type Theme = "system" | "light" | "dark";

export type Provider = "anthropic" | "gemini" | "groq" | "openrouter" | "openai";

export interface ProviderConfig {
  label: string;
  defaultModel: string;
  keyHint: string;
}
