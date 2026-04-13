import type { Theme } from "../themes";
import type { Settlement } from "../lib/balances";
import { Avatar } from "./Avatar";

type Props = {
  T: Theme;
  members: string[];
  balances: Record<string, number>;
  expensesCount: number;
  settlements: Settlement[];
  settledIds: string[];
  onToggleSettled: (id: string) => void;
};

export function SettleTab({
  T,
  members,
  balances,
  expensesCount,
  settlements,
  settledIds,
  onToggleSettled,
}: Props) {
  if (members.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)", fontSize: 14 }}>
        Add travelers and expenses first
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {members.map((m) => {
          const b = balances[m] ?? 0;
          const isPos = b > 0.01;
          const isNeg = b < -0.01;
          return (
            <div
              key={m}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                background: "var(--color-background-primary)",
                border: `0.5px solid ${
                  isPos ? "#1d9e75" : isNeg ? T.accent : "var(--color-border-tertiary)"
                }40`,
              }}
            >
              <Avatar name={m} accent={isPos ? "#1d9e75" : isNeg ? T.accent : "#888"} />
              <span style={{ flex: 1, fontWeight: 500 }}>{m}</span>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: isPos ? "#1d9e75" : isNeg ? T.accent : "var(--color-text-tertiary)",
                }}
              >
                {isPos ? "+" : ""}
                {T.symbol}
                {b.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" }}>
                {isPos ? "gets back" : isNeg ? "owes" : "settled ✓"}
              </span>
            </div>
          );
        })}
      </div>

      {settlements.length > 0 && (
        <>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            Suggested payments
          </div>
          <ul style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
            {settlements.map((s) => {
              const done = settledIds.includes(s.id);
              return (
                <li
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: done ? "#1d9e7515" : "var(--color-background-secondary)",
                    border: done ? "0.5px solid #1d9e7540" : "0.5px solid var(--color-border-tertiary)",
                    opacity: done ? 0.6 : 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Avatar name={s.from} accent={T.accent} size={30} />
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{s.from}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }} aria-hidden>
                    →
                  </span>
                  <Avatar name={s.to} accent="#1d9e75" size={30} />
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{s.to}</span>
                  <span style={{ flex: 1, minWidth: 8 }} />
                  <span style={{ fontWeight: 600, color: T.accent }}>
                    {T.symbol}
                    {s.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleSettled(s.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      cursor: "pointer",
                      border: done ? "0.5px solid #1d9e75" : `0.5px solid ${T.accent}50`,
                      background: done ? "#1d9e7520" : "transparent",
                      color: done ? "#1d9e75" : T.accent,
                    }}
                  >
                    {done ? "✓ Done" : "Settle"}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {settlements.length === 0 && expensesCount > 0 && (
        <div style={{ textAlign: "center", padding: "1.5rem", color: "#1d9e75", fontWeight: 500 }}>
          All settled up! ✓
        </div>
      )}
      {settlements.length === 0 && expensesCount === 0 && (
        <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--color-text-tertiary)", fontSize: 14 }}>
          Add expenses to see balances and payment suggestions.
        </div>
      )}
    </>
  );
}
