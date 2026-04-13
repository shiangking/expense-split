import type { ThemeKey } from "./themes";

export type Expense = {
  id: number;
  desc: string;
  amount: number;
  paidBy: string;
  category: string;
  splitWith: string[];
  theme: ThemeKey;
};

export type ExpenseForm = {
  desc: string;
  amount: string;
  paidBy: string;
  category: string;
  splitWith: string[];
};

export type TabId = "members" | "expenses" | "settle";

export type PersistedState = {
  v: 1;
  themeKey: ThemeKey;
  tab: TabId;
  members: string[];
  expenses: Expense[];
  settledIds: string[];
};
