import { useState } from "react";
import type { Theme } from "../themes";
import { isValidTripId } from "../lib/tripUrl";

type Props = {
  T: Theme;
  onCreateTrip: () => void;
  onJoinTrip: (tripId: string) => void;
  busy: boolean;
  error: string | null;
};

export function TripLanding({ T, onCreateTrip, onJoinTrip, busy, error }: Props) {
  const [paste, setPaste] = useState("");

  const join = () => {
    const raw = paste.trim();
    if (!isValidTripId(raw)) return;
    onJoinTrip(raw.toLowerCase());
  };

  return (
    <div style={{ maxWidth: 420, margin: "2rem auto", padding: "0 1rem" }}>
      <div
        style={{
          padding: "1.5rem",
          borderRadius: 12,
          border: `0.5px solid ${T.accent}35`,
          background: "var(--color-background-primary)",
        }}
      >
        <h2 style={{ margin: "0 0 8px", fontSize: 18, color: T.accent, fontWeight: 600 }}>Shared trip</h2>
        <p style={{ margin: "0 0 1.25rem", fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          Start a new trip and share the link with your travel companions—everyone can edit from their own phone. No email login
          required.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={onCreateTrip}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: T.accent,
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            cursor: busy ? "wait" : "pointer",
            marginBottom: 20,
          }}
        >
          {busy ? "Creating…" : "Start a new shared trip"}
        </button>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Or join with an invite ID
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <input
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            style={{
              flex: "1 1 220px",
              minWidth: 0,
              padding: "8px 10px",
              borderRadius: 8,
              border: `0.5px solid ${T.accent}40`,
              fontSize: 13,
              fontFamily: "ui-monospace, monospace",
              background: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
            }}
          />
          <button
            type="button"
            disabled={busy || !isValidTripId(paste.trim())}
            onClick={join}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `0.5px solid ${T.accent}50`,
              background: "transparent",
              color: T.accent,
              fontWeight: 500,
              cursor: busy || !isValidTripId(paste.trim()) ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            Join trip
          </button>
        </div>
        {error && <p style={{ margin: "12px 0 0", fontSize: 13, color: "#b91c1c" }}>{error}</p>}
      </div>
    </div>
  );
}
