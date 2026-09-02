import type { Lang } from "@/lib/i18n/dictionaries";

export type Period = "day" | "week" | "month" | "year";

export interface PeriodRange {
  /** Inclusive, YYYY-MM-DD. */
  start: string;
  /** Inclusive, YYYY-MM-DD. */
  end: string;
  /** Reference date for the previous period's link. */
  prevDate: string;
  /** Reference date for the next period's link. */
  nextDate: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseISODate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Start of the ISO (Monday-first) week containing `d`. */
function startOfWeek(d: Date) {
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - daysSinceMonday * DAY_MS);
}

export function todayISO() {
  return toISODate(new Date());
}

/**
 * All date arithmetic here is UTC-only (never local-time getters/setters).
 * `transaction_date` is a plain calendar date with no timezone, and this
 * runs on the server, which may not share the user's timezone — mixing in
 * local-time math would risk an off-by-one-day drift.
 */
export function getPeriodRange(period: Period, referenceDate: string): PeriodRange {
  const ref = parseISODate(referenceDate);

  switch (period) {
    case "day": {
      const prev = new Date(ref.getTime() - DAY_MS);
      const next = new Date(ref.getTime() + DAY_MS);
      return { start: toISODate(ref), end: toISODate(ref), prevDate: toISODate(prev), nextDate: toISODate(next) };
    }
    case "week": {
      const start = startOfWeek(ref);
      const end = new Date(start.getTime() + 6 * DAY_MS);
      const prev = new Date(start.getTime() - 7 * DAY_MS);
      const next = new Date(start.getTime() + 7 * DAY_MS);
      return { start: toISODate(start), end: toISODate(end), prevDate: toISODate(prev), nextDate: toISODate(next) };
    }
    case "month": {
      const y = ref.getUTCFullYear();
      const m = ref.getUTCMonth();
      const start = new Date(Date.UTC(y, m, 1));
      const end = new Date(Date.UTC(y, m + 1, 0));
      const prev = new Date(Date.UTC(y, m - 1, 1));
      const next = new Date(Date.UTC(y, m + 1, 1));
      return { start: toISODate(start), end: toISODate(end), prevDate: toISODate(prev), nextDate: toISODate(next) };
    }
    case "year": {
      const y = ref.getUTCFullYear();
      const start = new Date(Date.UTC(y, 0, 1));
      const end = new Date(Date.UTC(y, 11, 31));
      const prev = new Date(Date.UTC(y - 1, 0, 1));
      const next = new Date(Date.UTC(y + 1, 0, 1));
      return { start: toISODate(start), end: toISODate(end), prevDate: toISODate(prev), nextDate: toISODate(next) };
    }
  }
}

const LOCALE: Record<Lang, string> = { id: "id-ID", en: "en-US" };

export function formatPeriodLabel(period: Period, start: string, end: string, lang: Lang): string {
  const locale = LOCALE[lang];
  const startDate = parseISODate(start);
  const endDate = parseISODate(end);

  switch (period) {
    case "day":
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
        startDate
      );
    case "week": {
      const sameMonth = startDate.getUTCMonth() === endDate.getUTCMonth();
      const startFmt = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: sameMonth ? undefined : "short",
        timeZone: "UTC",
      }).format(startDate);
      const endFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
        endDate
      );
      return `${startFmt}–${endFmt}`;
    }
    case "month":
      return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(startDate);
    case "year":
      return new Intl.DateTimeFormat(locale, { year: "numeric", timeZone: "UTC" }).format(startDate);
  }
}
