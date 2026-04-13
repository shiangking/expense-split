import type { Expense } from "../types";

/** Sum of bill amounts this traveler paid (money they put on the card / cash). */
export function totalPaidByPayer(members: string[], expenses: Expense[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of members) out[m] = 0;
  for (const e of expenses) {
    const cur = out[e.paidBy];
    if (cur !== undefined) out[e.paidBy] = cur + e.amount;
  }
  return out;
}
