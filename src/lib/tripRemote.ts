import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersistedState } from "../types";

export type TripRow = {
  user_id: string;
  state: unknown;
  updated_at: string;
};

export async function fetchTripRow(supabase: SupabaseClient, userId: string): Promise<TripRow | null> {
  const { data, error } = await supabase
    .from("expense_split_state")
    .select("user_id,state,updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as TripRow | null;
}

export async function upsertTripRow(
  supabase: SupabaseClient,
  userId: string,
  state: PersistedState,
): Promise<{ updated_at: string }> {
  const updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("expense_split_state")
    .upsert({ user_id: userId, state, updated_at }, { onConflict: "user_id" })
    .select("updated_at")
    .single();
  if (error) throw error;
  return { updated_at: (data as { updated_at: string }).updated_at };
}
