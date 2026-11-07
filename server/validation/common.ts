import { badRequest } from '../utils/httpError.ts';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Collapses whitespace, trims and truncates. Non-strings become an empty string. */
export function cleanText(value: unknown, maxChars: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxChars);
}

/** Removes a Markdown code fence if a model wraps its JSON in one. */
export function stripCodeFence(text: string): string {
  const match = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/i.exec(text);
  return match?.[1] ?? text;
}

/*
 * Strict request parsing: unknown fields, wrong types and oversized strings or
 * lists are rejected with 400 instead of being silently coerced or truncated.
 * Messages are pt-BR and safe to show to the user.
 */

/** Rejects any field outside `allowed`, which also catches "__proto__" and "constructor" keys. */
export function assertKnownKeys(value: Record<string, unknown>, allowed: readonly string[], where: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw badRequest(`Campo não permitido em ${where}: "${key.slice(0, 40)}".`);
  }
}

export function readObject(value: unknown, message: string): Record<string, unknown> {
  if (!isRecord(value)) throw badRequest(message);
  return value;
}

/** A list with at most `maxItems` entries (`undefined` / `null` = empty list). */
export function readList(value: unknown, maxItems: number, label: string): unknown[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw badRequest(`${label} deve ser uma lista.`);
  if (value.length > maxItems) throw badRequest(`${label} aceita no máximo ${maxItems} itens.`);
  return value;
}

const HTML_TAG = /<\/?[a-z!?][^>]*>/i;
const INVISIBLE_CHARACTERS = /[​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

const isControlCharacter = (code: number) =>
  (code < 32 && code !== 9 && code !== 10 && code !== 13) || (code >= 127 && code <= 159);

/**
 * NFC-normalizes and removes control characters (tabs and line breaks stay)
 * plus zero-width and bidirectional-override characters, which can hide text
 * from a human reader while the model still sees it.
 */
export function stripUnsafeCharacters(text: string): string {
  let result = '';
  for (const character of text.normalize('NFC')) {
    if (!isControlCharacter(character.codePointAt(0) ?? 0)) result += character;
  }
  return result.replace(INVISIBLE_CHARACTERS, '');
}

/**
 * Free text that may reach the prompt: a string within `maxChars`, without
 * HTML. Unsafe characters are removed and the result is trimmed.
 */
export function readUserText(value: unknown, maxChars: number, label: string, { optional = false } = {}): string {
  if (optional && (value === undefined || value === null)) return '';
  if (typeof value !== 'string') throw badRequest(`${label} deve ser um texto.`);
  if (value.length > maxChars) throw badRequest(`${label} passa do limite de ${maxChars} caracteres.`);
  if (HTML_TAG.test(value)) throw badRequest(`${label} não pode conter código HTML.`);
  return stripUnsafeCharacters(value).trim();
}
