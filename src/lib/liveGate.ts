import { detectCategory } from "./scriptedEngine";

/**
 * Whether a message may be sent to a Live AI provider. A message that looks like a crisis is never sent:
 * the scripted engine's fixed crisis reply is shown instead, in every mode, so crisis handling does not
 * depend on a model following its prompt.
 */
export function shouldUseLive(lang: string, text: string, liveMode: boolean, apiKey: string): boolean {
  return liveMode && !!apiKey && detectCategory(lang, text) !== "crisis";
}
