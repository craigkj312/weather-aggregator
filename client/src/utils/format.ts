export type TempUnit = "F" | "C";

// Values from the API are stored in Celsius; convert on display.
export function toUnit(c: number, unit: TempUnit): number {
  return unit === "F" ? c * 1.8 + 32 : c;
}

export function formatTemp(c: number, unit: TempUnit = "F"): string {
  if (!Number.isFinite(c)) return "--";
  return `${Math.round(toUnit(c, unit))}°`;
}

export function formatTempPrecise(c: number, unit: TempUnit = "F"): string {
  if (!Number.isFinite(c)) return "--";
  return `${toUnit(c, unit).toFixed(1)}°${unit}`;
}

export function formatWind(kph: number): string {
  if (!Number.isFinite(kph)) return "--";
  return `${kph.toFixed(1)} km/h`;
}

export function formatHumidity(pct: number): string {
  if (!Number.isFinite(pct)) return "--";
  return `${Math.round(pct)}%`;
}

// Formats a UTC ISO hour into a local short label, e.g. "1 PM". "Now" for the current hour.
export function formatHour(iso: string): string {
  const d = new Date(iso);
  const current = new Date();
  if (d.getUTCFullYear() === current.getUTCFullYear() &&
      d.getUTCMonth() === current.getUTCMonth() &&
      d.getUTCDate() === current.getUTCDate() &&
      d.getUTCHours() === current.getUTCHours()) {
    return "Now";
  }
  return d.toLocaleTimeString([], { hour: "numeric" });
}

// Maps a condition string to a Tailwind gradient for the headline background.
export function conditionGradient(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("thunder") || c.includes("storm"))
    return "from-slate-700 to-slate-900";
  if (c.includes("snow") || c.includes("sleet") || c.includes("freezing"))
    return "from-sky-200 to-indigo-300";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower"))
    return "from-slate-500 to-blue-700";
  if (c.includes("fog") || c.includes("mist") || c.includes("overcast"))
    return "from-slate-400 to-slate-600";
  if (c.includes("cloud"))
    return "from-blue-400 to-slate-500";
  if (c.includes("clear") || c.includes("sun"))
    return "from-amber-400 to-orange-500";
  return "from-blue-500 to-indigo-600";
}
