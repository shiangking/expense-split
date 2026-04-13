import { useEffect, useRef, useState } from "react";
import type { Theme } from "../themes";
import type { SharedTripSync } from "../hooks/useSharedTripSync";
import { inviteUrl } from "../lib/tripUrl";

type Props = {
  T: Theme;
  tripId: string;
  sync: SharedTripSync;
  onLeaveTrip: () => void;
};

export function TripShareFab({ T, tripId, sync, onLeaveTrip }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = panelRef.current;
      if (!el) return;
      const t = e.target as Node;
      if (!el.contains(t) && !(e.target as HTMLElement).closest?.("[data-trip-fab]")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

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

  const status =
    sync.mode === "loading" ? "…" : sync.mode === "saving" ? "Saving" : sync.mode === "error" ? "!" : "✓";

  return (
    <div
      style={{
        position: "fixed",
        left: 14,
        bottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Shared trip"
          style={{
            width: "min(calc(100vw - 88px), 280px)",
            padding: "12px 14px",
            borderRadius: 12,
            border: `0.5px solid ${T.accent}35`,
            background: "var(--color-background-primary)",
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
            fontSize: 12,
            color: "var(--color-text-secondary)",
          }}
        >
          <div style={{ fontWeight: 600, color: T.accent, marginBottom: 6, fontSize: 13 }}>Shared trip</div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--color-text-tertiary)", wordBreak: "break-all", marginBottom: 10 }}>
            {tripId.slice(0, 8)}…{tripId.slice(-6)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            <button
              type="button"
              onClick={copy}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `0.5px solid ${T.accent}45`,
                background: copied ? "#1d9e7518" : "transparent",
                color: copied ? "#1d9e75" : T.accent,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLeaveTrip();
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "0.5px solid var(--color-border-tertiary)",
                background: "transparent",
                color: "var(--color-text-secondary)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Leave
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, color: "var(--color-text-tertiary)" }}>
            Anyone with the link can edit. Share only with your group.
          </p>
          {sync.message && (
            <p style={{ margin: "8px 0 0", fontSize: 11, color: sync.mode === "error" ? "#b91c1c" : "var(--color-text-secondary)" }}>{sync.message}</p>
          )}
        </div>
      )}
      <button
        type="button"
        data-trip-fab
        aria-expanded={open}
        aria-label={open ? "Close shared trip menu" : "Shared trip: invite and sync"}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          border: `2px solid ${T.accent}55`,
          background: "var(--color-background-primary)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          position: "relative",
        }}
      >
        <span aria-hidden>🔗</span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: 2,
            right: 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: tone,
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          {status}
        </span>
      </button>
    </div>
  );
}
