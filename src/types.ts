import type { ThemeKey } from "./themes";

/** ISO calendar date YYYY-MM-DD when date tracking is enabled */
export type ISODate = string;

export type Expense = {
  id: number;
  desc: string;
  amount: number;
  paidBy: string;
  category: string;
  splitWith: string[];
  theme: ThemeKey;
  /** Set when trip uses date tracking */
  date?: ISODate;
};

export type ExpenseForm = {
  desc: string;
  amount: string;
  paidBy: string;
  category: string;
  splitWith: string[];
  expenseDate: ISODate;
};

export type TabId = "members" | "expenses" | "settle";

export type PersistedState = {
  v: 1;
  themeKey: ThemeKey;
  tab: TabId;
  members: string[];
  expenses: Expense[];
  settledIds: string[];
  /** When true, expenses capture and display calendar dates */
  trackExpenseDates: boolean;
};
