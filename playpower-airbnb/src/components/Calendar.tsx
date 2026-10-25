import { useState } from "react";
import { Icon } from "./Icon";

export function Calendar() {
  const [offset, setOffset] = useState(9);
  const [range, setRange] = useState<[number, number] | null>([18, 23]);
  return (
    <section className="calendar-section" id="dates">
      <h2>5 nights in Candolim</h2>
      <p className="muted">18 Oct 2026 - 23 Oct 2026</p>
      <div className="calendar-pair">
        {[offset, offset + 1].map((month, index) => {
          const date = new Date(2026, month, 1);
          const days = new Date(2026, month + 1, 0).getDate();
          return (
            <div className="month" key={month}>
              <div className="month-heading">
                {index === 0 && (
                  <button
                    className="round"
                    aria-label="Previous month"
                    onClick={() => setOffset(offset - 1)}
                  >
                    <Icon name="back" size={16} />
                  </button>
                )}
                <strong>
                  {date.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                {index === 1 && (
                  <button
                    className="round"
                    aria-label="Next month"
                    onClick={() => setOffset(offset + 1)}
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
                {Array.from({ length: date.getDay() }, (_, i) => (
                  <span key={`blank-${i}`} />
                ))}
                {Array.from({ length: days }, (_, i) => {
                  const day = i + 1;
                  const selected =
                    month === 9 &&
                    !!range &&
                    (day === range[0] || day === range[1]);
                  const between =
                    month === 9 && !!range && day > range[0] && day < range[1];
                  return (
                    <button
                      key={day}
                      className={`day ${selected ? "selected" : ""} ${between ? "between" : ""} ${month === 10 && day > 16 && day < 26 ? "unavailable" : ""}`}
                      aria-label={`${date.toLocaleString("en-US", { month: "long" })} ${day}, ${date.getFullYear()}`}
                      aria-pressed={selected}
                      onClick={() => setRange([day, day + 5])}
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
        <button className="underlined" onClick={() => setRange(null)}>
          Clear dates
        </button>
      </div>
    </section>
  );
}
