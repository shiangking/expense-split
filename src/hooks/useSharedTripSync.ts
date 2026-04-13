import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { parsePersistedStateFromJson } from "../lib/persist";
import { rpcGetSharedTrip, rpcSaveSharedTrip } from "../lib/sharedTripRemote";
import type { PersistedState } from "../types";

const PUSH_DEBOUNCE_MS = 900;
const IGNORE_REMOTE_MS = 1200;
const POLL_MS = 12_000;

export type SharedTripSync = {
  mode: "idle" | "loading" | "synced" | "saving" | "error";
  message: string | null;
  /** True after first successful load for current tripId (enables pushes). */
  ready: boolean;
};

/** Keep this device's tab + theme; only trip fields come from the server. */
function withLocalChrome(prev: PersistedState, trip: PersistedState): PersistedState {
  return { ...trip, tab: prev.tab, themeKey: prev.themeKey };
}

function mergeInitialPull(local: PersistedState, remote: PersistedState): PersistedState {
  const localHas = local.members.length > 0 || local.expenses.length > 0;
  const remoteHas = remote.members.length > 0 || remote.expenses.length > 0;
  if (remoteHas && !localHas) return withLocalChrome(local, remote);
  if (!remoteHas && localHas) return local;
  if (remoteHas && localHas) return withLocalChrome(local, remote);
  return withLocalChrome(local, remote);
}

export function useSharedTripSync(
  tripId: string | null,
  data: PersistedState,
  setData: Dispatch<SetStateAction<PersistedState>>,
): SharedTripSync {
  const [mode, setMode] = useState<SharedTripSync["mode"]>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const dataRef = useRef(data);
  dataRef.current = data;

  const ignoreRemoteUntilRef = useRef(0);
  const lastRemoteUpdatedAtRef = useRef<string | null>(null);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedTripRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !tripId) {
      setMode("idle");
      setMessage(null);
      setReady(false);
      hydratedTripRef.current = null;
      return;
    }

    let cancelled = false;
    hydratedTripRef.current = null;
    setReady(false);

    void (async () => {
      setMode("loading");
      setMessage(null);
      try {
        const supabase = getSupabase();
        const row = await rpcGetSharedTrip(supabase, tripId);
        if (cancelled) return;
        if (!row) {
          setMode("error");
          setMessage("This invite link is not valid (no trip found).");
          setReady(false);
          return;
        }
        lastRemoteUpdatedAtRef.current = row.updated_at;
        const parsed = parsePersistedStateFromJson(row.state);
        if (!parsed) {
          setMode("error");
          setMessage("Trip data on the server could not be read.");
          setReady(false);
          return;
        }
        setData((prev) => mergeInitialPull(prev, parsed));
        hydratedTripRef.current = tripId;
        setReady(true);
        setMode("synced");
      } catch (e) {
        if (!cancelled) {
          setMode("error");
          setMessage(e instanceof Error ? e.message : "Could not load trip.");
          setReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tripId, setData]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !tripId || !ready || hydratedTripRef.current !== tripId) return;

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);

    pushTimerRef.current = setTimeout(async () => {
      try {
        setMode((m) => (m === "error" ? "saving" : m === "synced" ? "saving" : m));
        const supabase = getSupabase();
        const updated_at = await rpcSaveSharedTrip(supabase, tripId, dataRef.current);
        ignoreRemoteUntilRef.current = Date.now() + IGNORE_REMOTE_MS;
        lastRemoteUpdatedAtRef.current = updated_at;
        setMode("synced");
        setMessage(null);
      } catch (e) {
        setMode("error");
        setMessage(e instanceof Error ? e.message : "Could not save trip.");
      }
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [data, tripId, ready]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !tripId || !ready) return;

    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() < ignoreRemoteUntilRef.current) return;
      try {
        const supabase = getSupabase();
        const row = await rpcGetSharedTrip(supabase, tripId);
        if (!row) return;
        if (lastRemoteUpdatedAtRef.current && row.updated_at <= lastRemoteUpdatedAtRef.current) return;
        const parsed = parsePersistedStateFromJson(row.state);
        if (!parsed) return;
        const same = JSON.stringify(parsed) === JSON.stringify(dataRef.current);
        if (same) {
          lastRemoteUpdatedAtRef.current = row.updated_at;
          return;
        }
        lastRemoteUpdatedAtRef.current = row.updated_at;
        ignoreRemoteUntilRef.current = Date.now() + IGNORE_REMOTE_MS;
        setData((prev) => ({ ...parsed, tab: prev.tab, themeKey: prev.themeKey }));
      } catch {
        /* ignore poll errors */
      }
    };

    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => window.clearInterval(id);
  }, [tripId, ready, setData]);

  if (!isSupabaseConfigured() || !tripId) {
    return { mode: "idle", message: null, ready: false };
  }

  return { mode, message, ready };
}
