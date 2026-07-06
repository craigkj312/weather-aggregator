import type { WeatherReport } from "@weather-aggregator/shared";
import {
  formatHumidity,
  formatTempPrecise,
  formatWind,
  type TempUnit,
} from "../utils/format.js";
import { HourlyStrip } from "./HourlyStrip.js";

interface ProviderCardProps {
  report: WeatherReport;
  unit: TempUnit;
}

export function ProviderCard({ report, unit }: ProviderCardProps) {
  if (report.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-rose-800">{report.providerLabel}</h3>
          <span className="rounded-full bg-rose-200 px-2 py-0.5 text-xs font-medium text-rose-800">
            Unavailable
          </span>
        </div>
        <p className="mt-3 text-sm text-rose-700">
          Data is temporarily unavailable from this source.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex min-h-10 items-center justify-between">
        <h3 className="font-semibold text-slate-800">{report.providerLabel}</h3>
        <div className="h-10 w-10 shrink-0">
          {report.conditionIcon && (
            <img
              src={report.conditionIcon}
              alt={report.condition}
              className="h-10 w-10"
            />
          )}
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">
          {formatTempPrecise(report.temperatureC, unit)}
        </span>
        <span className="text-slate-500">{report.condition}</span>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm text-slate-600">
        <Row label="Feels like" value={formatTempPrecise(report.feelsLikeC, unit)} />
        <Row label="Humidity" value={formatHumidity(report.humidityPct)} />
        <Row label="Wind" value={formatWind(report.windSpeedKph)} />
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Next 12 hours
        </p>
        <HourlyStrip points={report.hourly} unit={unit} variant="dark" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
