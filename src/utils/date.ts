/*
 * Local calendar-day helpers. Day keys are "YYYY-MM-DD" in the user's time
 * zone, so a streak follows the user's own midnight (not UTC).
 */

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

export const isDateKey = (value: unknown): value is string => typeof value === 'string' && DAY_KEY_PATTERN.test(value);

export function toDateKey(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(key: string, amount: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

/** Whole days from `from` to `to` (rounding absorbs daylight-saving shifts). */
export function diffInDays(from: string, to: string): number {
  return Math.round((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / MS_PER_DAY);
}

const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

/** "6 de nov." */
export const formatDayMonth = (key: string) => dayMonthFormatter.format(parseDateKey(key));
