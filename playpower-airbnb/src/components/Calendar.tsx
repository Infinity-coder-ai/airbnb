import { formatStayDate, stayNights } from "../data/stayDates";
import type { StayDates } from "../data/stayDates";
import { Icon } from "./Icon";

export function Calendar({
  stay,
  offset,
  onMonthChange,
  onSelect,
  onClear,
}: {
  stay: StayDates;
  offset: number;
  onMonthChange: (offset: number) => void;
  onSelect: (date: string) => void;
  onClear: () => void;
}) {
  const nights = stayNights(stay);
  return (
    <section
      className="calendar-section"
      id="dates"
      aria-labelledby="dates-heading"
    >
      <h2 id="dates-heading" tabIndex={-1}>
        {nights
          ? `${nights} ${nights === 1 ? "night" : "nights"} in Candolim`
          : stay.checkIn
            ? "Select checkout date"
            : "Select check-in date"}
      </h2>
      <p className="muted" aria-live="polite" aria-atomic="true">
        {stay.checkIn ? formatStayDate(stay.checkIn) : "Add check-in date"}
        {" - "}
        {stay.checkOut ? formatStayDate(stay.checkOut) : "Add checkout date"}
      </p>
      <div className="calendar-pair">
        {[offset, offset + 1].map((month, index) => {
          const date = new Date(Date.UTC(2026, month, 1));
          const days = new Date(Date.UTC(2026, month + 1, 0)).getUTCDate();
          return (
            <div className="month" key={month}>
              <div className="month-heading">
                {index === 0 && (
                  <button
                    className="round"
                    aria-label="Previous month"
                    onClick={() => onMonthChange(offset - 1)}
                  >
                    <Icon name="back" size={16} />
                  </button>
                )}
                <strong>
                  {date.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </strong>
                {index === 1 && (
                  <button
                    className="round"
                    aria-label="Next month"
                    onClick={() => onMonthChange(offset + 1)}
                  >
                    <Icon name="next" size={16} />
                  </button>
                )}
              </div>
              <div className="month-grid">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <span className="weekday" key={i}>
                    {day}
                  </span>
                ))}
                {Array.from({ length: date.getUTCDay() }, (_, i) => (
                  <span key={`blank-${i}`} />
                ))}
                {Array.from({ length: days }, (_, i) => {
                  const day = i + 1;
                  const key = new Date(Date.UTC(2026, month, day))
                    .toISOString()
                    .slice(0, 10);
                  const selected = key === stay.checkIn || key === stay.checkOut;
                  const between =
                    !!stay.checkIn &&
                    !!stay.checkOut &&
                    key > stay.checkIn &&
                    key < stay.checkOut;
                  return (
                    <button
                      key={day}
                      className={`day ${selected ? "selected" : ""} ${between ? "between" : ""} ${month === 10 && day > 16 && day < 26 ? "unavailable" : ""}`}
                      aria-label={`${date.toLocaleString("en-US", { month: "long", timeZone: "UTC" })} ${day}, ${date.getUTCFullYear()}`}
                      aria-pressed={selected}
                      onClick={() => onSelect(key)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="calendar-footer">
        <span aria-hidden="true">▱</span>
        <button className="underlined" onClick={onClear}>
          Clear dates
        </button>
      </div>
    </section>
  );
}
