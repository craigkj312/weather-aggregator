import { useEffect, useState } from "react";
import { useWeather } from "./hooks/useWeather.js";
import { LocationSearch } from "./components/LocationSearch.js";
import { HeadlinePanel } from "./components/HeadlinePanel.js";
import { ProviderSummaryGrid } from "./components/ProviderSummaryGrid.js";
import type { TempUnit } from "./utils/format.js";

const DEFAULT_CITY = "New York";

export default function App() {
  const { data, loading, error, fetchWeather } = useWeather();
  const [unit, setUnit] = useState<TempUnit>("F");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      fetchWeather({ q: DEFAULT_CITY });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        fetchWeather({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => fetchWeather({ q: DEFAULT_CITY }),
      { timeout: 8000 }
    );
  }, [fetchWeather]);

  return (
    <div className="min-h-full bg-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Weather Aggregator</h1>
          <p className="mt-1 text-slate-600">
            Averaged from multiple weather providers.
          </p>
        </header>

        <div className="mb-6">
          <LocationSearch
            loading={loading}
            onSearch={(q) => fetchWeather({ q })}
            onUseMyLocation={() => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (pos) =>
                    fetchWeather({
                      lat: pos.coords.latitude,
                      lon: pos.coords.longitude,
                    }),
                  () => fetchWeather({ q: DEFAULT_CITY })
                );
              } else {
                fetchWeather({ q: DEFAULT_CITY });
              }
            }}
          />
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
            {error}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && data && (
          <div className="space-y-8">
            <HeadlinePanel data={data} unit={unit} onUnitChange={setUnit} />
            <ProviderSummaryGrid reports={data.providers} unit={unit} />
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-64 animate-pulse rounded-2xl bg-slate-300" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
