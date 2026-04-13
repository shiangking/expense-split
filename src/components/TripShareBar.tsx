import { useState } from "react";
import type { Theme } from "../themes";
import type { SharedTripSync } from "../hooks/useSharedTripSync";
import { inviteUrl } from "../lib/tripUrl";

type Props = {
  T: Theme;
  tripId: string;
  sync: SharedTripSync;
  onLeaveTrip: () => void;
};

export function TripShareBar({ T, tripId, sync, onLeaveTrip }: Props) {
  const [copied, setCopied] = useState(false);

  const short = `${tripId.slice(0, 8)}…${tripId.slice(-4)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl(tripId));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const tone =
    sync.mode === "error"
      ? "#b91c1c"
      : sync.mode === "saving"
        ? T.accent
        : sync.mode === "loading"
          ? "var(--color-text-secondary)"
          : "#1d9e75";

  const statusLabel =
    sync.mode === "loading"
      ? "Loading trip…"
      : sync.mode === "saving"
        ? "Saving…"
        : sync.mode === "error"
          ? "Sync issue"
          : "Shared trip";

  return (
    <div
      style={{
        marginBottom: 18,
        padding: "12px 14px",
        borderRadius: 10,
        border: `0.5px solid ${T.accent}28`,
        background: "var(--color-background-primary)",
        fontSize: 13,
        color: "var(--color-text-secondary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: tone }}>{statusLabel}</span>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: "ui-monospace, monospace" }}>{short}</span>
        <button
          type="button"
          onClick={copy}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: `0.5px solid ${T.accent}45`,
            background: copied ? "#1d9e7520" : "transparent",
            color: copied ? "#1d9e75" : T.accent,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {copied ? "Copied" : "Copy invite link"}
        </button>
        <button
          type="button"
          onClick={onLeaveTrip}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "0.5px solid var(--color-border-tertiary)",
            background: "transparent",
            color: "var(--color-text-secondary)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Leave trip
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "var(--color-text-tertiary)" }}>
        Anyone with this link can view and edit this trip. The link is the only access control—only share it with your group.
      </p>
      {sync.message && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: sync.mode === "error" ? "#b91c1c" : "var(--color-text-secondary)" }}>{sync.message}</p>
      )}
    </div>
  );
}
