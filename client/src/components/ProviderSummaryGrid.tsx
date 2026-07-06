import type { WeatherReport } from "@weather-aggregator/shared";
import { ProviderCard } from "./ProviderCard.js";
import type { TempUnit } from "../utils/format.js";

interface ProviderSummaryGridProps {
  reports: WeatherReport[];
  unit: TempUnit;
}

export function ProviderSummaryGrid({ reports, unit }: ProviderSummaryGridProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Sources
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <ProviderCard key={report.provider} report={report} unit={unit} />
        ))}
      </div>
    </section>
  );
}
