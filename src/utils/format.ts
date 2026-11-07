const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});
const litersFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

const preciseCurrencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** "R$ 45" */
export const formatCurrencyBRL = (value: number) => currencyFormatter.format(value);

/** "R$ 4,20" (keeps the cents, for unit prices). */
export const formatCurrencyBRLPrecise = (value: number) => preciseCurrencyFormatter.format(value);

/** 1250 ml → "1,25 L" */
export const formatLiters = (milliliters: number) => `${litersFormatter.format(milliliters / 1000)} L`;

/** Lowercase, accent-free form used to compare ingredient names ("Pimentão" ≈ "pimentao"). */
export const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Joins a list in Portuguese: "a", "a e b", "a, b e c". */
export function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

/** "Bom dia" / "Boa tarde" / "Boa noite" based on the local hour. */
export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/** Formats milliseconds as m:ss (e.g. 0:07). */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** "Hoje", "Ontem" or a short date such as "3 de nov.". */
export function formatRelativeDay(isoDate: string, now = new Date()): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return shortDateFormatter.format(date);
}

/** Joins dictated text to what the user already typed. */
export function appendText(current: string, addition: string): string {
  const base = current.trim();
  const extra = addition.trim();
  if (!base) return extra;
  if (!extra) return base;
  const separator = /[,.;:!?]$/.test(base) ? ' ' : ', ';
  return `${base}${separator}${extra}`;
}
