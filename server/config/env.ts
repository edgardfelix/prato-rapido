import { createHash } from 'node:crypto';
import path from 'node:path';

/*
 * Typed, validated runtime configuration. Values come from process.env,
 * which Node loads from ".env" through the --env-file-if-exists flag.
 */

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..');

const THINKING_LEVELS = ['minimal', 'low', 'medium', 'high'] as const;
export type ThinkingLevelName = (typeof THINKING_LEVELS)[number];

/*
 * Model defaults, verified with `models.get` against the Gemini API (v1) on
 * 2026-11-07. Retired names such as gemini-1.5-flash, gemini-1.5-pro and
 * gemini-2.0-flash-exp, and the "-latest" aliases, answer 404 there.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
export const DEFAULT_GEMINI_FALLBACK_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];

function readString(name: string, fallback = ''): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

function readInt(name: string, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(readString(name), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = readString(name).toLowerCase();
  if (['true', '1', 'yes'].includes(value)) return true;
  if (['false', '0', 'no'].includes(value)) return false;
  return fallback;
}

function readList(name: string): string[] {
  return readString(name)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** GEMINI_FALLBACK_MODELS (comma-separated, in order); the older single GEMINI_FALLBACK_MODEL still works. */
function readFallbackModels(): string[] {
  const configured = readList('GEMINI_FALLBACK_MODELS');
  if (configured.length > 0) return configured;
  const legacy = readList('GEMINI_FALLBACK_MODEL');
  return legacy.length > 0 ? legacy : DEFAULT_GEMINI_FALLBACK_MODELS;
}

function readThinkingLevel(): ThinkingLevelName {
  const value = readString('GEMINI_THINKING_LEVEL', 'low').toLowerCase();
  return (THINKING_LEVELS as readonly string[]).includes(value) ? (value as ThinkingLevelName) : 'low';
}

/** An https URL without a trailing slash, or '' when missing or invalid. */
function readHttpsUrl(name: string): string {
  const value = readString(name);
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href.replace(/\/+$/, '') : '';
  } catch {
    return '';
  }
}

export interface PaywallConfig {
  /** AI routes require a buyer access token. On by default once Upstash is configured. */
  enabled: boolean;
  upstash: Readonly<{ url: string; token: string }> | null;
  /** Webhook secret from the Cakto panel; without it every delivery is refused. */
  webhookSecret: string;
  checkoutUrl: string | null;
  /** Optional: only these Cakto product ids / short ids / offer ids grant access. */
  productIds: readonly string[];
  priceLabel: string;
  tokenTtlDays: number;
  /** Misconfigurations, logged at startup. */
  warnings: readonly string[];
}

/** Upstash REST URL: https, or plain http on loopback for local emulators (e.g. serverless-redis-http). */
function readUpstashUrl(): string {
  const value = readString('UPSTASH_REDIS_REST_URL');
  try {
    const url = new URL(value);
    const isLoopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    return url.protocol === 'https:' || (url.protocol === 'http:' && isLoopback) ? url.href.replace(/\/+$/, '') : '';
  } catch {
    return '';
  }
}

function readPaywallConfig(): PaywallConfig {
  const rawUrl = readString('UPSTASH_REDIS_REST_URL');
  const url = readUpstashUrl();
  const token = readString('UPSTASH_REDIS_REST_TOKEN');
  const upstash = url && token ? Object.freeze({ url, token }) : null;
  const enabled = readBoolean('PAYWALL_ENABLED', upstash !== null);
  const webhookSecret = readString('CAKTO_WEBHOOK_SECRET');
  const rawCheckoutUrl = readString('CAKTO_CHECKOUT_URL');
  const checkoutUrl = readHttpsUrl('CAKTO_CHECKOUT_URL') || null;

  const warnings: string[] = [];
  if (rawUrl && !url) warnings.push('UPSTASH_REDIS_REST_URL must be the https "REST URL" of the database (https://<name>.upstash.io).');
  if (Boolean(rawUrl) !== Boolean(token)) warnings.push('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN together.');
  if (enabled) {
    if (!upstash) warnings.push('PAYWALL_ENABLED=true without Upstash credentials: nobody can activate access.');
    if (!webhookSecret) warnings.push('CAKTO_WEBHOOK_SECRET is empty: the Cakto webhook refuses every delivery, so new buyers are not registered.');
    if (!checkoutUrl) {
      warnings.push(rawCheckoutUrl ? 'CAKTO_CHECKOUT_URL must be an https URL.' : 'CAKTO_CHECKOUT_URL is empty: the "Comprar Acesso" button stays hidden.');
    }
  }

  return Object.freeze({
    enabled,
    upstash,
    webhookSecret,
    checkoutUrl,
    productIds: Object.freeze(readList('CAKTO_PRODUCT_IDS')),
    priceLabel: readString('ACCESS_PRICE_LABEL', 'R$ 21,90').slice(0, 40),
    tokenTtlDays: readInt('ACCESS_TOKEN_TTL_DAYS', 90, 1, 365),
    warnings: Object.freeze(warnings),
  });
}

const geminiApiKey = readString('GEMINI_API_KEY');

/** Stable secret for signing image URLs (explicit, or derived from the Gemini key). */
const imageSigningSecret =
  readString('IMAGE_SIGNING_SECRET') ||
  createHash('sha256').update(`prato-rapido:image-url:${geminiApiKey || 'demo'}`).digest('hex');

export const env = Object.freeze({
  port: readInt('PORT', 3001, 1, 65_535),
  isProduction: process.env.NODE_ENV === 'production',
  trustProxy: readBoolean('TRUST_PROXY', false),
  allowedOrigins: readString('ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  rateLimitPerMinute: readInt('RATE_LIMIT_PER_MINUTE', 10, 1, 1_000),
  /** Demo mode serves sample data, so the app runs before a key is configured. */
  demoMode: readBoolean('DEMO_MODE', false) || geminiApiKey === '',
  gemini: Object.freeze({
    apiKey: geminiApiKey,
    /** Primary model: GEMINI_MODEL from .env, or DEFAULT_GEMINI_MODEL when it is not set. */
    model: readString('GEMINI_MODEL', DEFAULT_GEMINI_MODEL),
    /** Tried in this order when the primary model fails (404, 429, 5xx, timeout). */
    fallbackModels: Object.freeze(readFallbackModels()),
    thinkingLevel: readThinkingLevel(),
    timeoutMs: readInt('GEMINI_TIMEOUT_MS', 25_000, 5_000, 120_000),
  }),
  pollinationsApiKey: readString('POLLINATIONS_API_KEY'),
  imageSigningSecret,
  /** Paid access: Cakto webhook → Upstash Redis buyer list → signed access tokens. */
  paywall: readPaywallConfig(),
  paths: Object.freeze({
    root: PROJECT_ROOT,
    dist: path.join(PROJECT_ROOT, 'dist'),
    imageCache: path.join(PROJECT_ROOT, '.cache', 'images'),
  }),
});
