import { formatHour, formatTemp, type TempUnit } from "../utils/format.js";

interface HourlyStripItem {
  time: string;
  temperatureC: number;
  condition?: string;
  precipProbabilityPct?: number | null;
}

interface HourlyStripProps {
  points: HourlyStripItem[];
  unit: TempUnit;
  variant?: "light" | "dark";
}

export function HourlyStrip({ points, unit, variant = "dark" }: HourlyStripProps) {
  if (points.length === 0) {
    const muted = variant === "light" ? "text-white/70" : "text-slate-400";
    return <p className={`text-sm ${muted}`}>No hourly forecast available.</p>;
  }

  const itemBg =
    variant === "light"
      ? "bg-white/10 text-white"
      : "bg-slate-50 text-slate-800";
  const subLabel = variant === "light" ? "text-white/70" : "text-slate-400";
  const precipColor = variant === "light" ? "text-sky-100" : "text-sky-600";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {points.map((p) => {
        const hasPrecip =
          typeof p.precipProbabilityPct === "number" &&
          Number.isFinite(p.precipProbabilityPct);
        return (
          <div
            key={p.time}
            title={p.condition}
            className={`flex min-w-[3.5rem] flex-col items-center gap-1 rounded-lg px-2 py-2 ${itemBg}`}
          >
            <span className={`text-xs font-medium ${subLabel}`}>
              {formatHour(p.time)}
            </span>
            <span className="text-base font-semibold">
              {formatTemp(p.temperatureC, unit)}
            </span>
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                hasPrecip ? precipColor : subLabel
              }`}
            >
              <Droplet />
              {hasPrecip ? `${Math.round(p.precipProbabilityPct as number)}%` : "--"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Droplet() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-3 w-3"
    >
      <path d="M12 2.5c-.3 0-.58.13-.77.36C9.9 4.42 5 10.5 5 14.5a7 7 0 1 0 14 0c0-4-4.9-10.08-6.23-11.64A1 1 0 0 0 12 2.5z" />
    </svg>
  );
}
