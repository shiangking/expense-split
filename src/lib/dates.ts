/** Today's date in local calendar as YYYY-MM-DD (for `<input type="date">`). */
export function calendarToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(s: string): boolean {
  if (!ISO_DATE.test(s)) return false;
  const t = Date.parse(`${s}T12:00:00`);
  return !Number.isNaN(t);
}

export function formatExpenseDate(iso: string): string {
  if (!isValidISODate(iso)) return iso;
  const t = Date.parse(`${iso}T12:00:00`);
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
