import type { Expense } from "../types";

export function computeBalances(members: string[], expenses: Expense[]): Record<string, number> {
  const bal: Record<string, number> = {};
  for (const m of members) bal[m] = 0;
  for (const exp of expenses) {
    if (exp.splitWith.length === 0) continue;
    const share = exp.amount / exp.splitWith.length;
    for (const m of exp.splitWith) {
      if (bal[m] !== undefined) bal[m] -= share;
    }
    if (bal[exp.paidBy] !== undefined) bal[exp.paidBy] += exp.amount;
  }
  return bal;
}

export type Settlement = { from: string; to: string; amount: number; id: string };

export function computeSettlements(balances: Record<string, number>): Settlement[] {
  const b = { ...balances };
  const result: Settlement[] = [];
  for (let i = 0; i < 50; i++) {
    const debtors = Object.entries(b)
      .filter(([, v]) => v < -0.01)
      .sort(([, a], [, b2]) => a - b2);
    const creditors = Object.entries(b)
      .filter(([, v]) => v > 0.01)
      .sort(([, a], [, b2]) => b2 - a);
    if (!debtors.length || !creditors.length) break;
    const [dName, dAmt] = debtors[0]!;
    const [cName, cAmt] = creditors[0]!;
    const amt = Math.min(-dAmt, cAmt);
    result.push({ from: dName, to: cName, amount: amt, id: `${dName}-${cName}-${i}` });
    b[dName] += amt;
    b[cName] -= amt;
  }
  return result;
}
