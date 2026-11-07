import { normalizeText } from './format';

/*
 * Client-side input hygiene for everything sent to the API. React already
 * escapes what it renders, so this is about clean payloads: no markup, no
 * invisible characters that could hide text inside the prompt, and lengths the
 * server accepts. The server re-validates everything and rejects what does not
 * fit, so this is a first line of defense, never the only one.
 */

/** Elements whose content is dropped together with the tags. */
const DANGEROUS_BLOCKS = /<(script|style|iframe|object|embed|svg|math|template)\b[\s\S]*?<\/\1\s*>/gi;
const HTML_TAGS = /<\/?[a-z!?][^>]*>/gi;
const ANGLE_BRACKETS = /[<>]/g;
/** Zero-width and bidirectional-override characters. */
const INVISIBLE_CHARACTERS = /[​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

const isControlCharacter = (code: number) =>
  (code < 32 && code !== 9 && code !== 10 && code !== 13) || (code >= 127 && code <= 159);

function stripControlCharacters(text: string): string {
  let result = '';
  for (const character of text) {
    if (!isControlCharacter(character.codePointAt(0) ?? 0)) result += character;
  }
  return result;
}

interface SanitizeTextOptions {
  /** Keeps single line breaks (ingredient lists typed one per line). */
  multiline?: boolean;
}

/** Plain, trimmed text of at most `maxChars` characters. Non-strings become ''. */
export function sanitizeText(value: unknown, maxChars: number, { multiline = false }: SanitizeTextOptions = {}): string {
  if (typeof value !== 'string') return '';
  const plain = stripControlCharacters(
    value.normalize('NFC').replace(DANGEROUS_BLOCKS, ' ').replace(HTML_TAGS, ' ').replace(ANGLE_BRACKETS, ' '),
  ).replace(INVISIBLE_CHARACTERS, '');

  const collapsed = multiline
    ? plain
        .replace(/\r\n?/g, '\n')
        .replace(/[^\S\n]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{3,}/g, '\n\n')
    : plain.replace(/\s+/g, ' ');
  return collapsed.trim().slice(0, maxChars).trim();
}

/** Sanitized, de-duplicated (ignoring case and accents) list of at most `maxItems` entries. */
export function sanitizeTextList(values: unknown, { maxItems, maxChars }: { maxItems: number; maxChars: number }): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const text = sanitizeText(value, maxChars);
    const key = normalizeText(text);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(text);
    if (result.length >= maxItems) break;
  }
  return result;
}

/** Keeps only values from an allow-list, without duplicates. */
export function pickAllowed<T extends string>(allowed: readonly T[], values: readonly unknown[]): T[] {
  return [...new Set(values.filter((value): value is T => (allowed as readonly unknown[]).includes(value)))];
}
