import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { parsePersistedStateFromJson } from "../lib/persist";
import { fetchTripRow, upsertTripRow } from "../lib/tripRemote";
import type { PersistedState } from "../types";

const PUSH_DEBOUNCE_MS = 900;
const IGNORE_REMOTE_MS = 1200;

export type CloudSyncMode = "disabled" | "connecting" | "synced" | "syncing" | "error" | "needs_email";

export type CloudSync = {
  mode: CloudSyncMode;
  message: string | null;
  userEmail: string | null;
  isAnonymous: boolean;
  sendMagicLink: (email: string) => Promise<string | undefined>;
  magicLinkSent: boolean;
  clearMagicLinkSent: () => void;
};

function sessionFlags(session: Session | null) {
  if (!session?.user) return { email: null as string | null, anonymous: false, id: null as string | null };
  return {
    email: session.user.email ?? null,
    anonymous: Boolean(session.user.is_anonymous),
    id: session.user.id,
  };
}

export function useSupabaseTripSync(
  data: PersistedState,
  setData: Dispatch<SetStateAction<PersistedState>>,
): CloudSync {
  const [mode, setMode] = useState<CloudSyncMode>("disabled");
  const [message, setMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  const dataRef = useRef(data);
  dataRef.current = data;

  const ignoreRemoteUntilRef = useRef(0);
  const lastAppliedRemoteTsRef = useRef<string | null>(null);
  const prevUserIdRef = useRef<string | null>(null);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootstrappedRef = useRef(false);
  const hydrateBusyRef = useRef(false);

  const clearMagicLinkSent = useCallback(() => setMagicLinkSent(false), []);

  const sendMagicLink = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) return "Cloud sync is not configured.";
    const supabase = getSupabase();
    const trimmed = email.trim();
    if (!trimmed) return "Enter an email address.";
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) return error.message;
    setMagicLinkSent(true);
    return undefined;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setMode("disabled");
      setSessionUserId(null);
      return;
    }

    const supabase = getSupabase();
    let cancelled = false;
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const tearDownRealtime = () => {
      if (realtimeChannel) {
        void supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };

    const applyRemoteRow = (row: { state: unknown; updated_at: string }) => {
      if (cancelled) return;
      if (Date.now() < ignoreRemoteUntilRef.current) return;
      const ts = row.updated_at;
      if (lastAppliedRemoteTsRef.current && ts <= lastAppliedRemoteTsRef.current) return;
      const parsed = parsePersistedStateFromJson(row.state);
      if (!parsed) return;
      lastAppliedRemoteTsRef.current = ts;
      setData(parsed);
    };

    const pullOrSeed = async (userId: string) => {
      const row = await fetchTripRow(supabase, userId);
      const local = dataRef.current;
      const localHas = local.members.length > 0 || local.expenses.length > 0;

      if (!row) {
        await upsertTripRow(supabase, userId, local);
        ignoreRemoteUntilRef.current = Date.now() + IGNORE_REMOTE_MS;
        lastAppliedRemoteTsRef.current = new Date().toISOString();
        setMode("synced");
        setMessage("Trip saved to the cloud.");
        return;
      }

      const parsed = parsePersistedStateFromJson(row.state);
      if (!parsed) {
        await upsertTripRow(supabase, userId, local);
        ignoreRemoteUntilRef.current = Date.now() + IGNORE_REMOTE_MS;
        setMode("synced");
        setMessage("Cloud data was invalid; replaced with this device.");
        return;
      }

      const remoteHas = parsed.members.length > 0 || parsed.expenses.length > 0;

      if (remoteHas && !localHas) {
        lastAppliedRemoteTsRef.current = row.updated_at;
        setData(parsed);
        setMode("synced");
        setMessage("Loaded trip from the cloud.");
        return;
      }
      if (!remoteHas && localHas) {
        await upsertTripRow(supabase, userId, local);
        ignoreRemoteUntilRef.current = Date.now() + IGNORE_REMOTE_MS;
        lastAppliedRemoteTsRef.current = new Date().toISOString();
        setMode("synced");
        setMessage("Saved this device to the cloud.");
        return;
      }
      if (remoteHas && localHas) {
        lastAppliedRemoteTsRef.current = row.updated_at;
        setData(parsed);
        setMode("synced");
        setMessage("Merged with cloud (server copy).");
        return;
      }

      setMode("synced");
      setMessage(null);
    };

    const subscribeRealtime = (userId: string) => {
      tearDownRealtime();
      realtimeChannel = supabase
        .channel(`expense_split_state:${userId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "expense_split_state", filter: `user_id=eq.${userId}` },
          (payload) => {
            if (cancelled) return;
            const n = payload.new as { state?: unknown; updated_at?: string } | undefined;
            if (n?.state !== undefined && typeof n.updated_at === "string") {
              applyRemoteRow({ state: n.state, updated_at: n.updated_at });
            }
          },
        )
        .subscribe();
    };

    const afterSession = async (session: Session | null) => {
      if (cancelled) return;
      if (hydrateBusyRef.current) return;
      if (!session?.user?.id) {
        tearDownRealtime();
        setSessionUserId(null);
        setMode("needs_email");
        setMessage("Sign in with email to use cloud sync.");
        return;
      }

      hydrateBusyRef.current = true;
      try {
        const uid = session.user.id;
        const { email, anonymous } = sessionFlags(session);
        setUserEmail(email);
        setIsAnonymous(anonymous);

        const prev = prevUserIdRef.current;

        if (prev && prev !== uid) {
          setMode("connecting");
          try {
            await upsertTripRow(supabase, uid, dataRef.current);
            ignoreRemoteUntilRef.current = Date.now() + IGNORE_REMOTE_MS;
            setMessage("Moved your trip to this signed-in account.");
          } catch (e) {
            setMode("error");
            setMessage(e instanceof Error ? e.message : "Could not upload trip for new account.");
            setSessionUserId(null);
            return;
          }
        }

        setMode("connecting");
        setMessage(null);
        try {
          await pullOrSeed(uid);
        } catch (e) {
          setMode("error");
          setMessage(e instanceof Error ? e.message : "Could not load cloud trip.");
          setSessionUserId(null);
          tearDownRealtime();
          return;
        }

        if (cancelled) return;
        prevUserIdRef.current = uid;
        setSessionUserId(uid);
        subscribeRealtime(uid);
        bootstrappedRef.current = true;
        setMode("synced");
      } finally {
        hydrateBusyRef.current = false;
      }
    };

    const bootstrap = async () => {
      setMode("connecting");
      setMessage(null);
      let session = (await supabase.auth.getSession()).data.session ?? null;
      if (!session) {
        const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
        if (anonErr) {
          setMode("needs_email");
          setMessage(
            `${anonErr.message} Enable Anonymous users under Authentication → Sign in methods, or sign in with the same email on every device.`,
          );
          setSessionUserId(null);
          return;
        }
        session = anonData.session;
        if (!session?.user?.id) {
          setMode("needs_email");
          setMessage("Could not start an anonymous session. Try the magic link below.");
          return;
        }
      }
      await afterSession(session);
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      if (event === "SIGNED_OUT") {
        tearDownRealtime();
        setSessionUserId(null);
        prevUserIdRef.current = null;
        bootstrappedRef.current = false;
        setMode("needs_email");
        setMessage("Signed out. Sign in again to sync.");
        return;
      }
      if (event === "USER_UPDATED" && session?.user) {
        setUserEmail(session.user.email ?? null);
        setIsAnonymous(Boolean(session.user.is_anonymous));
        return;
      }
      if (session?.user?.id) {
        void afterSession(session);
      }
    });

    return () => {
      cancelled = true;
      tearDownRealtime();
      subscription.unsubscribe();
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [setData]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !sessionUserId) return;

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);

    pushTimerRef.current = setTimeout(async () => {
      if (!bootstrappedRef.current) return;
      try {
        setMode((m) => (m === "error" ? "syncing" : m === "synced" ? "syncing" : m));
        const supabase = getSupabase();
        const { updated_at } = await upsertTripRow(supabase, sessionUserId, dataRef.current);
        ignoreRemoteUntilRef.current = Date.now() + IGNORE_REMOTE_MS;
        lastAppliedRemoteTsRef.current = updated_at;
        setMode("synced");
        setMessage(null);
      } catch (e) {
        setMode("error");
        setMessage(e instanceof Error ? e.message : "Could not save to the cloud.");
      }
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [data, sessionUserId]);

  if (!isSupabaseConfigured()) {
    return {
      mode: "disabled",
      message: null,
      userEmail: null,
      isAnonymous: false,
      sendMagicLink,
      magicLinkSent,
      clearMagicLinkSent,
    };
  }

  return {
    mode,
    message,
    userEmail,
    isAnonymous,
    sendMagicLink,
    magicLinkSent,
    clearMagicLinkSent,
  };
}
