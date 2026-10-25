import { useId } from "react";
import type { CSSProperties } from "react";

// Original line drawings; no reference SVG path data is used.
const drawings: Record<string, string> = {
  close: "M6 6l12 12M18 6L6 18",
  next: "M9 5l7 7-7 7",
  back: "M15 5l-7 7 7 7",
  down: "M5 9l7 7 7-7",
  heart: "M12 20S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12Z",
  share: "M12 16V3m-5 5 5-5 5 5M5 12v9h14v-9",
  search: "M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z",
  kitchen: "M4 3v7m3-7v7m-3 3h3m-1-3v11M12 3v18m0-18c7 1 7 10 0 10M20 3v18",
  wifi: "M2 8c6-6 14-6 20 0M5 12c4-4 10-4 14 0M8 16c2-2 6-2 8 0M12 20h.01",
  desk: "M3 11h18v10M4 11V4h5v7M14 11V5h5v6M3 17h18",
  car: "M3 11l3-7h12l3 7v8H3v-8Zm0 0h18M6 15h2m8 0h2M5 19v2m14-2v2",
  pool: "M8 3v13m8-13v13M8 7h8M8 12h8M2 18q3-3 6 0t6 0 6 0M2 22q3-3 6 0t6 0 6 0",
  bath: "M3 11h18v8H3v-8ZM6 11V5a3 3 0 0 1 6 0M7 19v3m10-3v3M16 3v5m4-4v4",
  paw: "M12 11c-3 0-7 6-5 9 2 2 4-1 5-1s3 3 5 1c2-3-2-9-5-9ZM4 6l1 3m4-6v3m6-3v3m4 0-1 3",
  camera: "M3 5h14v14H3V5Zm14 5 5-3v10l-5-3M7 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  alarm: "M4 4h16v16H4V4ZM2 2l20 20M8 8l8 8M8 16l2-2",
  fan: "M12 11c-7-3-6-10-2-9 3 1 3 5 2 9Zm1 1c3-7 10-6 9-2-1 3-5 3-9 2Zm-1 1c7 3 6 10 2 9-3-1-3-5-2-9Zm-1-1c-3 7-10 6-9 2 1-3 5-3 9-2Z",
  door: "M4 22V2h15v20M15 2v20M2 22h20M11 12h.01",
  outdoor: "M3 13h18v9H3v-9Zm2 0c-3-6 3-7 4-12 6 5 1 7 5 10 1-6 6-3 5 2",
  key: "M14 13l8 8v-5h-3v-3h-3M15 8a7 7 0 1 1-14 0 7 7 0 0 1 14 0ZM7 6h.01",
  shield: "M12 2 2 6v7c0 6 10 9 10 9s10-3 10-9V6L12 2Zm0 0v20",
  calendar: "M3 5h18v16H3V5ZM7 2v6m10-6v6M3 10h18M9 13l6 6m0-6-6 6",
  map: "M2 5l6-3 8 3 6-3v17l-6 3-8-3-6 3V5Zm6-3v17m8-14v17",
  check: "M6 12l4 4 8-9M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  chat: "M3 3h18v15h-6l-3 4-3-4H3V3Z",
  tag: "M2 3h9l11 11-9 9L2 12V3Zm5 4h.01",
  clean: "M6 3h12l-5 5v5l5 4v5H4v-8l5-5V6H6V3Zm8 0 7 4m-7 4 7 4",
  flag: "M4 22V2l8 2 8-1v11l-8 1-8-2",
  school: "M1 8l11-6 11 6-11 6L1 8Zm4 3v8l7 4 7-4v-8M23 8v10",
  balloon: "M12 2C2 2 2 14 12 19 22 14 22 2 12 2Zm0 17v5",
  home: "M2 11 12 2l10 9v11h-7v-9H9v9H2V11Z",
};
export function Icon({
  name,
  size = 24,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  if (name === "grid")
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={style}
      >
        {[5, 12, 19].flatMap((x) =>
          [5, 12, 19].map((y) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="1.6"
              fill="currentColor"
            />
          )),
        )}
      </svg>
    );
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={drawings[name] ?? drawings.check} />
    </svg>
  );
}

export function Laurel({ className }: { className: string }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg className={className} viewBox="0 0 56 112" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#81888c" />
          <stop offset=".5" stopColor="#34383a" />
          <stop offset="1" stopColor="#191c1e" />
        </linearGradient>
      </defs>
      <path
        d="M45 104C10 92 4 47 16 9"
        fill="none"
        stroke="#43484b"
        strokeWidth="2"
      />
      {[
        [16, 17, -8, 8, 15],
        [12, 40, -23, 9, 16],
        [15, 62, -36, 9, 16],
        [25, 82, -55, 9, 16],
        [39, 96, -75, 8, 14],
      ].map(([x, y, angle, rx, ry], index) => (
        <ellipse
          key={index}
          cx={x}
          cy={y}
          rx={rx}
          ry={ry}
          transform={`rotate(${angle} ${x} ${y})`}
          fill={`url(#${id})`}
        />
      ))}
    </svg>
  );
}
