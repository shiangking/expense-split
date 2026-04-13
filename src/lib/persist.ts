import { THEMES, type ThemeKey } from "../themes";
import type { Expense, PersistedState, TabId } from "../types";

const STORAGE_KEY = "expense-split-v1";

export const defaultState: PersistedState = {
  v: 1,
  themeKey: "japan",
  tab: "members",
  members: [],
  expenses: [],
  settledIds: [],
  trackExpenseDates: true,
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseOptionalDate(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !ISO_DATE.test(raw)) return undefined;
  const t = Date.parse(`${raw}T12:00:00`);
  if (Number.isNaN(t)) return undefined;
  return raw;
}

function isThemeKey(k: string): k is ThemeKey {
  return k in THEMES;
}

function isTabId(k: string): k is TabId {
  return k === "members" || k === "expenses" || k === "settle";
}

function sanitizeExpense(raw: unknown): Expense | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "number" ? o.id : Number(o.id);
  const desc = typeof o.desc === "string" ? o.desc : "";
  const amount = typeof o.amount === "number" ? o.amount : Number(o.amount);
  const paidBy = typeof o.paidBy === "string" ? o.paidBy : "";
  const category = typeof o.category === "string" ? o.category : "";
  const theme = typeof o.theme === "string" && isThemeKey(o.theme) ? o.theme : "usa";
  const splitWith = Array.isArray(o.splitWith) ? o.splitWith.filter((x): x is string => typeof x === "string") : [];
  if (!Number.isFinite(id) || !desc.trim() || !Number.isFinite(amount) || amount <= 0 || !paidBy || splitWith.length === 0) {
    return null;
  }
  const date = parseOptionalDate(o.date);
  const base = { id, desc: desc.trim(), amount, paidBy, category, splitWith, theme };
  return date ? { ...base, date } : base;
}

/** Parse persisted trip JSON (from localStorage or Supabase). Returns null if invalid. */
export function parsePersistedStateFromJson(raw: unknown): PersistedState | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw as Partial<PersistedState>;
  if (parsed.v !== 1) return null;
  const themeKey = typeof parsed.themeKey === "string" && isThemeKey(parsed.themeKey) ? parsed.themeKey : defaultState.themeKey;
  const tab = typeof parsed.tab === "string" && isTabId(parsed.tab) ? parsed.tab : defaultState.tab;
  const members = Array.isArray(parsed.members)
    ? [...new Set(parsed.members.filter((m): m is string => typeof m === "string" && m.trim().length > 0).map((m) => m.trim()))]
    : [];
  const expensesRaw = Array.isArray(parsed.expenses) ? parsed.expenses : [];
  const expenses = expensesRaw.map(sanitizeExpense).filter((e): e is Expense => e !== null);
  const settledIds = Array.isArray(parsed.settledIds)
    ? parsed.settledIds.filter((x): x is string => typeof x === "string")
    : [];
  const trackExpenseDates = true;
  return { v: 1, themeKey, tab, members, expenses, settledIds, trackExpenseDates };
}

/** localStorage key: legacy single-device, or per-trip when cloud invite mode is on. */
export function storageKey(tripId: string | null, sharedMode: boolean): string {
  if (!sharedMode) return STORAGE_KEY;
  if (!tripId) return `${STORAGE_KEY}--no-trip`;
  return `${STORAGE_KEY}--trip--${tripId}`;
}

export function loadPersisted(tripId: string | null, sharedMode: boolean): PersistedState {
  if (sharedMode && !tripId) return { ...defaultState };
  const key = storageKey(tripId, sharedMode);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as unknown;
    return parsePersistedStateFromJson(parsed) ?? { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

export function savePersisted(state: PersistedState, tripId: string | null, sharedMode: boolean): void {
  if (sharedMode && !tripId) return;
  const key = storageKey(tripId, sharedMode);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export { STORAGE_KEY };
