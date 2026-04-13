import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersistedState } from "../types";

export type SharedTripPayload = { state: unknown; updated_at: string };

/** Only shared trip data goes to the server—never tab/theme so each device keeps its own UI. */
export function toCloudTripState(state: PersistedState): Record<string, unknown> {
  return {
    v: state.v,
    members: state.members,
    expenses: state.expenses,
    settledIds: state.settledIds,
    trackExpenseDates: state.trackExpenseDates,
  };
}

export async function rpcCreateSharedTrip(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.rpc("create_shared_trip");
  if (error) throw error;
  if (typeof data !== "string") throw new Error("Unexpected response when creating trip.");
  return data;
}

export async function rpcGetSharedTrip(supabase: SupabaseClient, tripId: string): Promise<SharedTripPayload | null> {
  const { data, error } = await supabase.rpc("get_shared_trip", { trip_id: tripId });
  if (error) throw error;
  if (data == null) return null;
  if (typeof data !== "object" || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;
  if (!("state" in o) || typeof o.updated_at !== "string") return null;
  return { state: o.state, updated_at: o.updated_at };
}

export async function rpcSaveSharedTrip(
  supabase: SupabaseClient,
  tripId: string,
  state: PersistedState,
): Promise<string> {
  const { data, error } = await supabase.rpc("save_shared_trip", { trip_id: tripId, new_state: toCloudTripState(state) });
  if (error) throw error;
  if (typeof data !== "string") throw new Error("Unexpected response when saving trip.");
  return data;
}
