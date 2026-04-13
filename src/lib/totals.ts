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

/** Sum of each traveler's share (amount / split count) across expenses they are in — their "spent" after splitting. */
export function totalShareAfterSplit(members: string[], expenses: Expense[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of members) out[m] = 0;
  for (const e of expenses) {
    if (e.splitWith.length === 0) continue;
    const share = e.amount / e.splitWith.length;
    for (const m of e.splitWith) {
      const cur = out[m];
      if (cur !== undefined) out[m] = cur + share;
    }
  }
  return out;
}
