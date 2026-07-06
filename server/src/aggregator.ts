import type {
  AggregatedAverage,
  AggregatedHourlyPoint,
  AggregatedWeather,
  GeoLocation,
  WeatherReport,
} from "@weather-aggregator/shared";
import { PROVIDER_LABELS, type ProviderId } from "@weather-aggregator/shared";
import { fetchOpenWeatherMap } from "./providers/openweathermap.js";
import { fetchWeatherApi } from "./providers/weatherapi.js";
import { fetchOpenMeteo } from "./providers/openMeteo.js";
import { nextHourKeys } from "./time.js";

type ProviderFetcher = (loc: GeoLocation) => Promise<WeatherReport>;

const PROVIDERS: { id: ProviderId; fetch: ProviderFetcher }[] = [
  { id: "openweathermap", fetch: fetchOpenWeatherMap },
  { id: "weatherapi", fetch: fetchWeatherApi },
  { id: "open-meteo", fetch: fetchOpenMeteo },
];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Most frequent condition string; ties resolved by first-seen order.
function modeCondition(reports: WeatherReport[]): string {
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const r of reports) {
    if (!counts.has(r.condition)) order.push(r.condition);
    counts.set(r.condition, (counts.get(r.condition) ?? 0) + 1);
  }
  let best = order[0] ?? "Unknown";
  let bestCount = 0;
  for (const cond of order) {
    const count = counts.get(cond)!;
    if (count > bestCount) {
      best = cond;
      bestCount = count;
    }
  }
  return best;
}

// Average the hourly forecast per hour across whichever sources cover that hour.
function computeHourly(reports: WeatherReport[]): AggregatedHourlyPoint[] {
  const ok = reports.filter((r) => !r.error);
  const byHour = new Map<
    string,
    { temps: number[]; conditions: string[]; precip: number[] }
  >();

  for (const report of ok) {
    for (const point of report.hourly) {
      if (!Number.isFinite(point.temperatureC)) continue;
      const bucket =
        byHour.get(point.time) ?? { temps: [], conditions: [], precip: [] };
      bucket.temps.push(point.temperatureC);
      if (point.condition) bucket.conditions.push(point.condition);
      if (Number.isFinite(point.precipProbabilityPct)) {
        bucket.precip.push(point.precipProbabilityPct as number);
      }
      byHour.set(point.time, bucket);
    }
  }

  const result: AggregatedHourlyPoint[] = [];
  for (const time of nextHourKeys()) {
    const bucket = byHour.get(time);
    if (!bucket || bucket.temps.length === 0) continue;
    result.push({
      time,
      temperatureC: round1(mean(bucket.temps)),
      condition: modeStrings(bucket.conditions),
      precipProbabilityPct:
        bucket.precip.length > 0 ? Math.round(mean(bucket.precip)) : null,
      sourceCount: bucket.temps.length,
    });
  }
  return result;
}

function modeStrings(values: string[]): string {
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const v of values) {
    if (!counts.has(v)) order.push(v);
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best = order[0] ?? "";
  let bestCount = 0;
  for (const v of order) {
    const count = counts.get(v)!;
    if (count > bestCount) {
      best = v;
      bestCount = count;
    }
  }
  return best;
}

function computeAverage(reports: WeatherReport[]): AggregatedAverage | null {
  const ok = reports.filter((r) => !r.error);
  if (ok.length === 0) return null;
  return {
    temperatureC: round1(mean(ok.map((r) => r.temperatureC))),
    feelsLikeC: round1(mean(ok.map((r) => r.feelsLikeC))),
    humidityPct: Math.round(mean(ok.map((r) => r.humidityPct))),
    windSpeedKph: round1(mean(ok.map((r) => r.windSpeedKph))),
    condition: modeCondition(ok),
  };
}

export async function aggregateWeather(loc: GeoLocation): Promise<AggregatedWeather> {
  const settled = await Promise.allSettled(
    PROVIDERS.map((p) => p.fetch(loc))
  );

  const reports: WeatherReport[] = settled.map((result, i) => {
    const { id } = PROVIDERS[i];
    if (result.status === "fulfilled") {
      return result.value;
    }
    const reason =
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason);
    return {
      provider: id,
      providerLabel: PROVIDER_LABELS[id],
      location: loc,
      temperatureC: NaN,
      feelsLikeC: NaN,
      humidityPct: NaN,
      windSpeedKph: NaN,
      condition: "Unavailable",
      hourly: [],
      fetchedAt: new Date().toISOString(),
      error: reason,
    };
  });

  const successCount = reports.filter((r) => !r.error).length;

  return {
    location: loc,
    average: computeAverage(reports),
    hourly: computeHourly(reports),
    providers: reports,
    successCount,
    totalCount: reports.length,
  };
}
