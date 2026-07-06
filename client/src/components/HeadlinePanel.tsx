import type { AggregatedWeather } from "@weather-aggregator/shared";
import {
  conditionGradient,
  formatHumidity,
  formatTemp,
  formatTempPrecise,
  formatWind,
  type TempUnit,
} from "../utils/format.js";
import { UnitToggle } from "./UnitToggle.js";
import { HourlyStrip } from "./HourlyStrip.js";

interface HeadlinePanelProps {
  data: AggregatedWeather;
  unit: TempUnit;
  onUnitChange: (unit: TempUnit) => void;
}

export function HeadlinePanel({ data, unit, onUnitChange }: HeadlinePanelProps) {
  const { average, location, successCount, totalCount } = data;

  if (!average) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 p-8 text-white shadow-lg">
        <h2 className="text-2xl font-semibold">{location.name}</h2>
        <p className="mt-4 text-lg opacity-90">
          No provider returned data. Check API keys and try again.
        </p>
      </div>
    );
  }

  const gradient = conditionGradient(average.condition);

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${gradient} p-8 text-white shadow-lg`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide opacity-80">
            Aggregated average
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{location.name}</h2>
        </div>
        <span className="whitespace-nowrap rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur">
          {successCount}/{totalCount} sources
        </span>
      </div>

      <div className="mt-6 flex items-end gap-6">
        <div className="flex items-start gap-2">
          <span className="text-7xl font-bold leading-none">
            {formatTemp(average.temperatureC, unit)}
          </span>
          <UnitToggle unit={unit} onChange={onUnitChange} className="mt-1" />
        </div>
        <div className="pb-2">
          <p className="text-2xl font-medium">{average.condition}</p>
          <p className="opacity-90">
            Feels like {formatTempPrecise(average.feelsLikeC, unit)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
        <Metric
          label="Avg temp"
          value={formatTempPrecise(average.temperatureC, unit)}
        />
        <Metric label="Humidity" value={formatHumidity(average.humidityPct)} />
        <Metric label="Wind" value={formatWind(average.windSpeedKph)} />
      </div>

      <div className="mt-6 border-t border-white/20 pt-4">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide opacity-80">
          Next 12 hours (averaged)
        </p>
        <HourlyStrip points={data.hourly} unit={unit} variant="light" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
