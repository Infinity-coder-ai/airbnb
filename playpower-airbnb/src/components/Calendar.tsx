import { useState } from "react";
import { Icon } from "./Icon";

export type DateRange = { checkIn: string | null; checkOut: string | null };
type Props = { range: DateRange; onChange: (range: DateRange) => void };

const today = new Date();
today.setHours(0, 0, 0, 0);
const toKey = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");
const fromKey = (key: string) => new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10)));
const pretty = (key: string) => fromKey(key).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function Calendar({ range, onChange }: Props) {
  const [monthStart, setMonthStart] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const checkIn = range.checkIn;
  const checkOut = range.checkOut;
  const nights = checkIn && checkOut ? Math.round((fromKey(checkOut).getTime() - fromKey(checkIn).getTime()) / 86400000) : 0;
  const changeMonth = (delta: number) => setMonthStart(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  const chooseDate = (day: string) => {
    if (!checkIn || checkOut || day <= checkIn) onChange({ checkIn: day, checkOut: null });
    else onChange({ checkIn, checkOut: day });
  };
  return (
    <section className="calendar-section" id="dates" aria-labelledby="dates-title">
      <h2 id="dates-title">{nights ? `${nights} night${nights === 1 ? "" : "s"} in Candolim` : "Select check-in and checkout dates"}</h2>
      <p className="muted">{checkIn ? pretty(checkIn) : "Add check-in date"} — {checkOut ? pretty(checkOut) : "Add checkout date"}</p>
      <div className="calendar-pair">
        {[0, 1].map((index) => {
          const month = new Date(monthStart.getFullYear(), monthStart.getMonth() + index, 1);
          const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
          return (
            <div className="month" key={toKey(month)}>
              <div className="month-heading">
                {index === 0 && (
                  <button type="button" className="round" aria-label="Previous month" disabled={monthStart.getFullYear() === today.getFullYear() && monthStart.getMonth() === today.getMonth()} onClick={() => changeMonth(-1)}>
                    <Icon name="back" size={16} />
                  </button>
                )}
                <strong>{month.toLocaleString("en-US", { month: "long", year: "numeric" })}</strong>
                {index === 1 && (
                  <button type="button" className="round" aria-label="Next month" onClick={() => changeMonth(1)}>
                    <Icon name="next" size={16} />
                  </button>
                )}
              </div>
              <div className="month-grid">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => <span className="weekday" key={i}>{day}</span>)}
                {Array.from({ length: month.getDay() }, (_, i) => <span key={`blank-${i}`} />)}
                {Array.from({ length: days }, (_, i) => {
                  const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
                  const key = toKey(date);
                  const disabled = date < today;
                  const endpoint = key === checkIn || key === checkOut;
                  const between = !!checkIn && !!checkOut && key > checkIn && key < checkOut;
                  return (
                    <button type="button" key={key}
                      className={`day ${endpoint ? "selected" : ""} ${between ? "between" : ""} ${disabled ? "unavailable" : ""}`}
                      aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      aria-pressed={endpoint} disabled={disabled}
                      onClick={() => chooseDate(key)}>{i + 1}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="calendar-footer">
        <span aria-hidden="true">▱</span>
        <button type="button" className="underlined" onClick={() => onChange({ checkIn: null, checkOut: null })}>Clear dates</button>
      </div>
    </section>
  );
}
