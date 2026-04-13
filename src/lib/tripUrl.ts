const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidTripId(id: string): boolean {
  return UUID_RE.test(id.trim());
}

export function readTripIdFromLocation(): string | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("trip");
    if (!raw) return null;
    const t = raw.trim();
    return isValidTripId(t) ? t.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function writeTripIdToUrl(tripId: string | null) {
  const url = new URL(window.location.href);
  if (tripId) url.searchParams.set("trip", tripId);
  else url.searchParams.delete("trip");
  window.history.replaceState({}, "", url.toString());
}

export function inviteUrl(tripId: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set("trip", tripId);
  return url.toString();
}
