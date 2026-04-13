import { useMemo, useState } from "react";
import type { Expense, ExpenseForm } from "../types";
import type { Theme } from "../themes";
import { THEMES } from "../themes";
import { formatExpenseDate, isValidISODate } from "../lib/dates";

type Props = {
  T: Theme;
  members: string[];
  expenses: Expense[];
  form: ExpenseForm;
  setForm: (fn: (f: ExpenseForm) => ExpenseForm) => void;
  onAddExpense: () => void;
  onRemoveExpense: (id: number) => void;
  toggleSplit: (name: string) => void;
  selectAllSplit: () => void;
};

const field = (accent: string) =>
  ({
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${accent}35`,
    fontSize: 14,
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    width: "100%",
    boxSizing: "border-box" as const,
  }) as const;

export function ExpensesTab({
  T,
  members,
  expenses,
  form,
  setForm,
  onAddExpense,
  onRemoveExpense,
  toggleSplit,
  selectAllSplit,
}: Props) {
  const [formError, setFormError] = useState<string | null>(null);

  const sortedExpenses = useMemo(() => {
    const copy = [...expenses];
    copy.sort((a, b) => {
      const da = a.date ?? "";
      const db = b.date ?? "";
      if (da !== db) return db.localeCompare(da);
      return b.id - a.id;
    });
    return copy;
  }, [expenses]);

  const canSubmit = useMemo(() => {
    const amt = parseFloat(form.amount);
    return (
      form.desc.trim().length > 0 &&
      !Number.isNaN(amt) &&
      amt > 0 &&
      form.paidBy.length > 0 &&
      form.splitWith.length > 0 &&
      isValidISODate(form.expenseDate)
    );
  }, [form.amount, form.desc, form.expenseDate, form.paidBy, form.splitWith.length]);

  const handleAdd = () => {
    if (!canSubmit) {
      setFormError("Add a date, description, positive amount, who paid, and at least one person splitting.");
      return;
    }
    setFormError(null);
    onAddExpense();
  };

  if (members.length < 2) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)", fontSize: 14 }}>
        Add at least 2 travelers first
      </div>
    );
  }

  return (
    <>
      <section style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: -0.02 }}>
            Log an expense
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-tertiary)" }}>
            When it happened, who paid, and how it splits—dates are always saved.
          </p>
        </div>

        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${T.accent}22`,
            background: "linear-gradient(145deg, var(--color-background-primary) 0%, var(--color-background-secondary) 100%)",
            boxShadow: `inset 0 1px 0 ${T.accent}12`,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", minHeight: 4, background: T.accent }} aria-hidden />

          <div style={{ padding: "16px 16px 18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 118px) 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label
                  htmlFor="expense-date"
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 6,
                  }}
                >
                  Date
                </label>
                <input
                  id="expense-date"
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))}
                  style={{ ...field(T.accent), padding: "10px 8px", fontSize: 13 }}
                />
              </div>
              <div>
                <label
                  htmlFor="expense-desc"
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 6,
                  }}
                >
                  What was it?
                </label>
                <input
                  id="expense-desc"
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  placeholder="Coffee, train tickets, hotel…"
                  aria-label="Expense description"
                  style={field(T.accent)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label
                  htmlFor="expense-amt"
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 6,
                  }}
                >
                  Amount ({T.symbol})
                </label>
                <input
                  id="expense-amt"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                  inputMode="decimal"
                  type="text"
                  aria-label="Amount"
                  style={field(T.accent)}
                />
              </div>
              <div>
                <label
                  htmlFor="expense-cat"
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 6,
                  }}
                >
                  Category
                </label>
                <select
                  id="expense-cat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  aria-label="Category"
                  style={{ ...field(T.accent), cursor: "pointer", color: form.category ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}
                >
                  <option value="">Pick one…</option>
                  {T.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="expense-payer"
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 6,
                }}
              >
                Paid by
              </label>
              <select
                id="expense-payer"
                value={form.paidBy}
                onChange={(e) => setForm((f) => ({ ...f, paidBy: e.target.value }))}
                aria-label="Paid by"
                style={{ ...field(T.accent), cursor: "pointer", color: form.paidBy ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}
              >
                <option value="">Who fronted the bill?</option>
                {members.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--color-text-tertiary)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Split between
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} role="group" aria-label="Split between travelers">
                {members.map((m) => {
                  const on = form.splitWith.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleSplit(m)}
                      aria-pressed={on}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 999,
                        fontSize: 13,
                        cursor: "pointer",
                        border: on ? `2px solid ${T.accent}` : `1px solid var(--color-border-tertiary)`,
                        background: on ? `${T.accent}18` : "var(--color-background-primary)",
                        color: on ? T.accent : "var(--color-text-secondary)",
                        fontWeight: on ? 600 : 500,
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={selectAllSplit}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    cursor: "pointer",
                    border: `1px dashed ${T.accent}55`,
                    background: "transparent",
                    color: T.accent,
                    fontWeight: 500,
                  }}
                >
                  All
                </button>
              </div>
            </div>

            {formError && (
              <p role="alert" style={{ margin: "0 0 12px", fontSize: 13, color: "#b91c1c" }}>
                {formError}
              </p>
            )}

            <button
              type="button"
              onClick={handleAdd}
              disabled={!canSubmit}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                background: canSubmit ? `linear-gradient(180deg, ${T.accent} 0%, ${T.accent}dd 100%)` : `${T.accent}50`,
                color: "#fff",
                fontWeight: 600,
                cursor: canSubmit ? "pointer" : "not-allowed",
                fontSize: 15,
                letterSpacing: 0.02,
                boxShadow: canSubmit ? `0 4px 14px ${T.accent}44` : "none",
              }}
            >
              + Add to trip
            </button>
          </div>
        </div>
      </section>

      {expenses.length === 0 && (
        <div style={{ textAlign: "center", padding: "1.25rem", color: "var(--color-text-tertiary)", fontSize: 14 }}>
          No expenses yet — log your first one above.
        </div>
      )}

      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        Timeline
      </div>
      <ul style={{ display: "flex", flexDirection: "column", gap: 0, listStyle: "none", margin: 0, padding: 0 }}>
        {sortedExpenses.map((exp, i) => {
          const Et = THEMES[exp.theme] ?? T;
          const emoji = exp.category?.split(" ")[0] ?? "💴";
          const dateLabel = exp.date ? formatExpenseDate(exp.date) : "—";
          return (
            <li
              key={exp.id}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr auto",
                gap: 12,
                alignItems: "stretch",
                padding: "14px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--color-border-tertiary)",
              }}
            >
              <div
                style={{
                  textAlign: "right",
                  paddingTop: 2,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-text-tertiary)",
                  lineHeight: 1.35,
                }}
              >
                {dateLabel}
              </div>
              <div style={{ minWidth: 0, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }} aria-hidden>
                  {emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)", marginBottom: 4 }}>{exp.desc}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>
                    <span style={{ color: Et.accent }}>{exp.paidBy}</span>
                    <span aria-hidden> · </span>
                    split: {exp.splitWith.join(", ")}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: Et.accent, whiteSpace: "nowrap" }}>
                  {Et.symbol}
                  {exp.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{Et.flag}</div>
                <button
                  type="button"
                  onClick={() => onRemoveExpense(exp.id)}
                  aria-label={`Delete expense ${exp.desc}`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-tertiary)",
                    fontSize: 18,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
