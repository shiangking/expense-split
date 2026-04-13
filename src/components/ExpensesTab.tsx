import { useMemo, useState } from "react";
import type { Expense, ExpenseForm } from "../types";
import type { Theme } from "../themes";
import { THEMES } from "../themes";
import { calendarToday, formatExpenseDate, isValidISODate } from "../lib/dates";

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
  trackExpenseDates: boolean;
  onTrackExpenseDatesChange: (value: boolean) => void;
};

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
  trackExpenseDates,
  onTrackExpenseDatesChange,
}: Props) {
  const [formError, setFormError] = useState<string | null>(null);

  const sortedExpenses = useMemo(() => {
    const copy = [...expenses];
    if (trackExpenseDates) {
      copy.sort((a, b) => {
        const da = a.date ?? "";
        const db = b.date ?? "";
        if (da !== db) return db.localeCompare(da);
        return b.id - a.id;
      });
    } else {
      copy.sort((a, b) => b.id - a.id);
    }
    return copy;
  }, [expenses, trackExpenseDates]);

  const canSubmit = useMemo(() => {
    const amt = parseFloat(form.amount);
    const base =
      form.desc.trim().length > 0 &&
      !Number.isNaN(amt) &&
      amt > 0 &&
      form.paidBy.length > 0 &&
      form.splitWith.length > 0;
    if (!base) return false;
    if (trackExpenseDates && !isValidISODate(form.expenseDate)) return false;
    return true;
  }, [form.amount, form.desc, form.expenseDate, form.paidBy, form.splitWith.length, trackExpenseDates]);

  const handleAdd = () => {
    if (!canSubmit) {
      setFormError(
        trackExpenseDates
          ? "Add a description, valid date, positive amount, who paid, and at least one person splitting."
          : "Add a description, positive amount, who paid, and at least one person splitting.",
      );
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
      <div
        style={{
          background: "var(--color-background-secondary)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 18,
          border: `0.5px solid ${T.accent}25`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: `0.5px solid ${T.accent}20`,
          }}
        >
          <input
            id="track-expense-dates"
            type="checkbox"
            checked={trackExpenseDates}
            onChange={(e) => {
              const on = e.target.checked;
              onTrackExpenseDatesChange(on);
              if (on) {
                setForm((f) => ({ ...f, expenseDate: isValidISODate(f.expenseDate) ? f.expenseDate : calendarToday() }));
              }
            }}
            style={{ width: 18, height: 18, accentColor: T.accent, cursor: "pointer" }}
          />
          <label htmlFor="track-expense-dates" style={{ fontSize: 14, color: "var(--color-text-primary)", cursor: "pointer" }}>
            Track expense dates
          </label>
        </div>

        {trackExpenseDates && (
          <div style={{ marginBottom: 10 }}>
            <label
              htmlFor="expense-date"
              style={{
                display: "block",
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Date
            </label>
            <input
              id="expense-date"
              type="date"
              value={form.expenseDate}
              onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))}
              style={{
                width: "100%",
                maxWidth: 220,
                padding: "8px 10px",
                borderRadius: 8,
                border: `0.5px solid ${T.accent}40`,
                fontSize: 13,
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <input
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            placeholder="Description"
            aria-label="Expense description"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: `0.5px solid ${T.accent}40`,
              fontSize: 13,
              background: "var(--color-background-primary)",
              color: "var(--color-text-primary)",
            }}
          />
          <input
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder={`Amount (${T.symbol})`}
            inputMode="decimal"
            type="text"
            aria-label="Amount"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: `0.5px solid ${T.accent}40`,
              fontSize: 13,
              background: "var(--color-background-primary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <select
            value={form.paidBy}
            onChange={(e) => setForm((f) => ({ ...f, paidBy: e.target.value }))}
            aria-label="Paid by"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: `0.5px solid ${T.accent}40`,
              fontSize: 13,
              background: "var(--color-background-primary)",
              color: form.paidBy ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
            }}
          >
            <option value="">Paid by...</option>
            {members.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            aria-label="Category"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: `0.5px solid ${T.accent}40`,
              fontSize: 13,
              background: "var(--color-background-primary)",
              color: form.category ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
            }}
          >
            <option value="">Category...</option>
            {T.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
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
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    cursor: "pointer",
                    border: on ? `1.5px solid ${T.accent}` : `0.5px solid var(--color-border-tertiary)`,
                    background: on ? `${T.accent}20` : "var(--color-background-primary)",
                    color: on ? T.accent : "var(--color-text-secondary)",
                    fontWeight: on ? 600 : 400,
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
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 12,
                cursor: "pointer",
                border: `0.5px solid ${T.accent}40`,
                background: "transparent",
                color: T.accent,
              }}
            >
              All
            </button>
          </div>
        </div>
        {formError && (
          <p role="alert" style={{ margin: "0 0 10px", fontSize: 13, color: "#b91c1c" }}>
            {formError}
          </p>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canSubmit}
          style={{
            width: "100%",
            padding: "9px",
            borderRadius: 8,
            border: "none",
            background: canSubmit ? T.accent : `${T.accent}55`,
            color: "#fff",
            fontWeight: 500,
            cursor: canSubmit ? "pointer" : "not-allowed",
            fontSize: 14,
          }}
        >
          Add expense
        </button>
      </div>

      {expenses.length === 0 && (
        <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--color-text-tertiary)", fontSize: 14 }}>
          No expenses yet — add your first one!
        </div>
      )}
      <ul style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
        {sortedExpenses.map((exp) => {
          const Et = THEMES[exp.theme] ?? T;
          const emoji = exp.category?.split(" ")[0] ?? "💴";
          return (
            <li
              key={exp.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                background: "var(--color-background-primary)",
                border: `0.5px solid ${Et.accent}30`,
              }}
            >
              <div style={{ fontSize: 22 }} aria-hidden>
                {emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{exp.desc}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {trackExpenseDates && exp.date ? (
                    <>
                      <span>{formatExpenseDate(exp.date)}</span>
                      <span aria-hidden> · </span>
                    </>
                  ) : null}
                  {exp.paidBy} · {exp.splitWith.join(", ")}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 600, color: Et.accent }}>
                  {Et.symbol}
                  {exp.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{Et.flag}</div>
              </div>
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
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
