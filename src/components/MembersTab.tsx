import type { Theme } from "../themes";
import { Avatar } from "./Avatar";

type Props = {
  T: Theme;
  members: string[];
  nameInput: string;
  setNameInput: (v: string) => void;
  /** Sum of expenses each traveler paid (out-of-pocket). */
  totalPaidByMember: Record<string, number>;
  onAdd: () => void;
  onRemove: (name: string) => void;
};

export function MembersTab({
  T,
  members,
  nameInput,
  setNameInput,
  totalPaidByMember,
  onAdd,
  onRemove,
}: Props) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <label htmlFor="member-name" className="sr-only">
          Traveler name
        </label>
        <input
          id="member-name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder="Add traveler name..."
          autoComplete="name"
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: `0.5px solid ${T.accent}50`,
            fontSize: 14,
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
          }}
        />
        <button
          type="button"
          onClick={onAdd}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "none",
            background: T.accent,
            color: "#fff",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Add {T.pattern}
        </button>
      </div>
      {members.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--color-text-tertiary)", fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden>
            {T.pattern}
          </div>
          Add your travel companions to get started
        </div>
      )}
      <ul style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
        {members.map((m) => {
          const paid = totalPaidByMember[m] ?? 0;
          return (
            <li
              key={m}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 10,
                background: "var(--color-background-primary)",
                border: `0.5px solid ${T.accent}30`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={m} accent={T.accent} />
                <span style={{ fontWeight: 500, fontSize: 15 }}>{m}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", textAlign: "right" }}>
                  <span style={{ display: "block", fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 2 }}>
                    Total paid
                  </span>
                  {T.symbol}
                  {paid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(m)}
                  aria-label={`Remove ${m}`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-tertiary)",
                    fontSize: 20,
                    lineHeight: 1,
                    padding: "4px 8px",
                  }}
                >
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
