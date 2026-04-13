import { useState } from "react";
import type { Theme } from "../themes";
import type { CloudSync } from "../hooks/useSupabaseTripSync";

type Props = { T: Theme; cloud: CloudSync };

export function SyncBar({ T, cloud }: Props) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  if (cloud.mode === "disabled") return null;

  const label =
    cloud.mode === "connecting"
      ? "Connecting to cloud…"
      : cloud.mode === "syncing"
        ? "Saving…"
        : cloud.mode === "error"
          ? "Cloud sync issue"
          : cloud.mode === "needs_email"
            ? "Cloud sync"
            : "Cloud";

  const tone =
    cloud.mode === "error"
      ? "#b91c1c"
      : cloud.mode === "needs_email"
        ? T.accent
        : cloud.mode === "synced"
          ? "#1d9e75"
          : "var(--color-text-secondary)";

  const onSendLink = async () => {
    setLocalErr(null);
    setBusy(true);
    const err = await cloud.sendMagicLink(email);
    setBusy(false);
    if (err) setLocalErr(err);
  };

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
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: cloud.message || cloud.mode === "needs_email" ? 8 : 0 }}>
        <span style={{ fontWeight: 600, color: tone }}>{label}</span>
        {cloud.mode === "synced" && (
          <span style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}>
            {cloud.isAnonymous ? "Anonymous session" : cloud.userEmail ?? "Signed in"}
          </span>
        )}
      </div>
      {cloud.message && (
        <div style={{ fontSize: 12, color: cloud.mode === "error" ? "#b91c1c" : "var(--color-text-secondary)", marginBottom: cloud.mode === "needs_email" ? 10 : 0 }}>
          {cloud.message}
        </div>
      )}
      {(cloud.mode === "needs_email" || cloud.mode === "error") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                cloud.clearMagicLinkSent();
              }}
              placeholder="Email for magic link"
              autoComplete="email"
              style={{
                flex: "1 1 180px",
                minWidth: 0,
                padding: "8px 10px",
                borderRadius: 8,
                border: `0.5px solid ${T.accent}40`,
                fontSize: 13,
                background: "var(--color-background-secondary)",
                color: "var(--color-text-primary)",
              }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={onSendLink}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: T.accent,
                color: "#fff",
                fontWeight: 500,
                cursor: busy ? "wait" : "pointer",
                fontSize: 13,
              }}
            >
              {busy ? "Sending…" : "Send magic link"}
            </button>
          </div>
          {localErr && <p style={{ margin: 0, fontSize: 12, color: "#b91c1c" }}>{localErr}</p>}
          {cloud.magicLinkSent && (
            <p style={{ margin: 0, fontSize: 12, color: "#1d9e75" }}>
              Check your inbox and open the link on this device. Use the same email on every device you want synced.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
