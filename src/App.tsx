import { useEffect, useMemo, useState } from "react";
import { THEMES, type ThemeKey } from "./themes";
import type { ExpenseForm, PersistedState, TabId } from "./types";
import { computeBalances, computeSettlements } from "./lib/balances";
import { calendarToday, isValidISODate } from "./lib/dates";
import { loadPersisted, savePersisted } from "./lib/persist";
import { totalPaidByPayer } from "./lib/totals";
import { useSupabaseTripSync } from "./hooks/useSupabaseTripSync";
import { ThemePicker } from "./components/ThemePicker";
import { SyncBar } from "./components/SyncBar";
import { MembersTab } from "./components/MembersTab";
import { ExpensesTab } from "./components/ExpensesTab";
import { SettleTab } from "./components/SettleTab";

const TABS: TabId[] = ["members", "expenses", "settle"];
const TAB_LABELS: Record<TabId, string> = {
  members: "Travelers",
  expenses: "Expenses",
  settle: "Settle Up",
};

const emptyForm = (paidBy = "", splitWith: string[] = []): ExpenseForm => ({
  desc: "",
  amount: "",
  paidBy,
  category: "",
  splitWith,
  expenseDate: calendarToday(),
});

export default function App() {
  const [data, setData] = useState<PersistedState>(loadPersisted);
  const [nameInput, setNameInput] = useState("");
  const [form, setForm] = useState<ExpenseForm>(() => emptyForm());

  const cloud = useSupabaseTripSync(data, setData);

  const { themeKey, tab, members, expenses, settledIds, trackExpenseDates } = data;
  const T = THEMES[themeKey];

  useEffect(() => {
    savePersisted(data);
  }, [data]);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-bg", T.bg);
    document.documentElement.style.setProperty("--focus-ring", T.accent);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", T.accent);
  }, [T.accent, T.bg]);

  const balances = useMemo(() => computeBalances(members, expenses), [expenses, members]);
  const settlements = useMemo(() => computeSettlements(balances), [balances]);
  const totalPaidByMember = useMemo(() => totalPaidByPayer(members, expenses), [expenses, members]);

  const settlementSignature = useMemo(
    () => settlements.map((s) => `${s.id}:${s.amount.toFixed(2)}`).join("|"),
    [settlements],
  );

  useEffect(() => {
    const valid = new Set(settlements.map((s) => s.id));
    setData((d) => {
      const next = d.settledIds.filter((id) => valid.has(id));
      if (next.length === d.settledIds.length) return d;
      return { ...d, settledIds: next };
    });
  }, [settlementSignature]);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const handleThemeChange = (key: ThemeKey) => {
    setData((d) => ({ ...d, themeKey: key }));
    setForm((f) => ({ ...f, category: "" }));
  };

  const addMember = () => {
    const n = nameInput.trim();
    if (!n || members.includes(n)) return;
    setData((d) => ({ ...d, members: [...d.members, n] }));
    setNameInput("");
    setForm((f) => {
      const splitWith = f.splitWith.length === 0 ? [...members, n] : [...f.splitWith, n];
      return { ...f, splitWith };
    });
  };

  const removeMember = (n: string) => {
    setData((d) => ({
      ...d,
      members: d.members.filter((x) => x !== n),
      expenses: d.expenses
        .filter((e) => e.paidBy !== n)
        .map((e) => ({ ...e, splitWith: e.splitWith.filter((x) => x !== n) }))
        .filter((e) => e.splitWith.length > 0),
    }));
    setForm((f) => ({
      ...f,
      paidBy: f.paidBy === n ? "" : f.paidBy,
      splitWith: f.splitWith.filter((x) => x !== n),
    }));
  };

  const toggleSplit = (n: string) => {
    setForm((f) => ({
      ...f,
      splitWith: f.splitWith.includes(n) ? f.splitWith.filter((x) => x !== n) : [...f.splitWith, n],
    }));
  };

  const addExpense = () => {
    const amt = parseFloat(form.amount);
    if (!form.desc.trim() || Number.isNaN(amt) || amt <= 0 || !form.paidBy || form.splitWith.length === 0) return;
    setData((d) => ({
      ...d,
      expenses: [
        ...d.expenses,
        {
          desc: form.desc.trim(),
          amount: amt,
          paidBy: form.paidBy,
          category: form.category,
          splitWith: [...form.splitWith],
          id: Date.now(),
          theme: themeKey,
          ...(trackExpenseDates && isValidISODate(form.expenseDate) ? { date: form.expenseDate } : {}),
        },
      ],
    }));
    setForm(emptyForm(form.paidBy, form.splitWith));
  };

  const removeExpense = (id: number) => {
    setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
  };

  const toggleSettled = (id: string) => {
    setData((d) => ({
      ...d,
      settledIds: d.settledIds.includes(id) ? d.settledIds.filter((x) => x !== id) : [...d.settledIds, id],
    }));
  };

  return (
    <div
      style={{
        maxWidth: 540,
        margin: "0 auto",
        padding: "1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom))",
        fontFamily: "var(--font-sans)",
        background: T.gradient,
        minHeight: "100dvh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <h1
            style={{
              fontSize: 11,
              color: "var(--color-text-tertiary)",
              letterSpacing: 2,
              textTransform: "uppercase",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            Expense Splitter
          </h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 26, fontWeight: 500, color: T.accent, fontFamily: T.font }}>{T.subtitle}</span>
            <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
              {T.flag} {T.label}
            </span>
          </div>
        </div>
        <ThemePicker current={themeKey} onChange={handleThemeChange} accent={T.accent} />
      </div>

      <SyncBar T={T} cloud={cloud} />

      {(members.length > 0 || expenses.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Travelers", value: members.length },
            { label: "Expenses", value: expenses.length },
            { label: "Total", value: `${T.symbol}${totalSpent.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: `${T.accent}12`,
                borderRadius: 10,
                padding: "10px 14px",
                border: `0.5px solid ${T.accent}30`,
              }}
            >
              <div style={{ fontSize: 11, color: T.accent, marginBottom: 4, fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          borderBottom: `1.5px solid ${T.accent}30`,
          paddingBottom: 0,
        }}
        role="tablist"
        aria-label="Main sections"
      >
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            id={`tab-${t}`}
            aria-controls={`panel-${t}`}
            onClick={() => setData((d) => ({ ...d, tab: t }))}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? T.accent : "var(--color-text-secondary)",
              borderBottom: tab === t ? `2px solid ${T.accent}` : "2px solid transparent",
              marginBottom: -1.5,
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {TABS.map((t) => (
        <div
          key={t}
          id={`panel-${t}`}
          role="tabpanel"
          aria-labelledby={`tab-${t}`}
          hidden={tab !== t}
        >
          {tab === t && t === "members" && (
            <MembersTab
              T={T}
              members={members}
              nameInput={nameInput}
              setNameInput={setNameInput}
              totalPaidByMember={totalPaidByMember}
              onAdd={addMember}
              onRemove={removeMember}
            />
          )}
          {tab === t && t === "expenses" && (
            <ExpensesTab
              T={T}
              members={members}
              expenses={expenses}
              form={form}
              setForm={setForm}
              onAddExpense={addExpense}
              onRemoveExpense={removeExpense}
              toggleSplit={toggleSplit}
              selectAllSplit={() => setForm((f) => ({ ...f, splitWith: [...members] }))}
              trackExpenseDates={trackExpenseDates}
              onTrackExpenseDatesChange={(value) => setData((d) => ({ ...d, trackExpenseDates: value }))}
            />
          )}
          {tab === t && t === "settle" && (
            <SettleTab
              T={T}
              members={members}
              balances={balances}
              expensesCount={expenses.length}
              settlements={settlements}
              settledIds={settledIds}
              onToggleSettled={toggleSettled}
            />
          )}
        </div>
      ))}
    </div>
  );
}
