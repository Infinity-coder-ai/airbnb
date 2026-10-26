export type StayDates = { checkIn: string | null; checkOut: string | null };
export type DateField = "checkin" | "checkout";
export const initialStay: StayDates = {
  checkIn: "2026-10-18",
  checkOut: "2026-10-23",
};

// Date-only UTC arithmetic avoids daylight-saving and local timezone shifts.
export function dateFromKey(key: string) {
  return new Date(`${key}T00:00:00Z`);
}
export function formatStayDate(key: string, short = false) {
  return dateFromKey(key).toLocaleDateString(short ? "en-US" : "en-GB", {
    timeZone: "UTC",
    day: short ? "2-digit" : "numeric",
    month: short ? "2-digit" : "short",
    year: "numeric",
  });
}
export function stayNights(stay: StayDates) {
  if (!stay.checkIn || !stay.checkOut) return null;
  return Math.round(
    (dateFromKey(stay.checkOut).getTime() - dateFromKey(stay.checkIn).getTime()) /
      86_400_000,
  );
}
