import type { TempUnit } from "../utils/format.js";

interface UnitToggleProps {
  unit: TempUnit;
  onChange: (unit: TempUnit) => void;
  className?: string;
}

export function UnitToggle({ unit, onChange, className = "" }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className={`inline-flex overflow-hidden rounded-full border border-white/40 text-sm font-semibold ${className}`}
    >
      {(["F", "C"] as const).map((u) => (
        <button
          key={u}
          type="button"
          aria-pressed={unit === u}
          onClick={() => onChange(u)}
          className={`px-3 py-1 transition ${
            unit === u
              ? "bg-white/90 text-slate-900"
              : "text-white/90 hover:bg-white/20"
          }`}
        >
          °{u}
        </button>
      ))}
    </div>
  );
}
