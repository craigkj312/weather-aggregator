import type {
  GeoLocation,
  HourlyPoint,
  WeatherReport,
} from "@weather-aggregator/shared";
import { PROVIDER_LABELS } from "@weather-aggregator/shared";
import { fetchJson } from "./http.js";
import { HOURLY_WINDOW, topOfHourUTC } from "../time.js";

interface OwmResponse {
  name: string;
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number };
  weather: { description: string; icon: string }[];
}

interface OwmForecastResponse {
  list: {
    dt: number;
    main: { temp: number };
    weather: { description: string }[];
    pop?: number; // probability of precipitation, 0-1
  }[];
}

export async function fetchOpenWeatherMap(loc: GeoLocation): Promise<WeatherReport> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error("OPENWEATHER_API_KEY is not set");
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${loc.lat}&lon=${loc.lon}&units=metric&appid=${key}`;

  const data = await fetchJson<OwmResponse>(url);
  const weather = data.weather?.[0];

  return {
    provider: "openweathermap",
    providerLabel: PROVIDER_LABELS.openweathermap,
    location: { ...loc, name: data.name || loc.name },
    temperatureC: data.main.temp,
    feelsLikeC: data.main.feels_like,
    humidityPct: data.main.humidity,
    // OWM wind speed is m/s with units=metric -> convert to kph.
    windSpeedKph: data.wind.speed * 3.6,
    condition: capitalize(weather?.description ?? "Unknown"),
    conditionIcon: weather?.icon
      ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
      : undefined,
    // Free tier only offers 3-hour steps, so OWM contributes to a subset of hours.
    hourly: await fetchHourly(loc, key),
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchHourly(loc: GeoLocation, key: string): Promise<HourlyPoint[]> {
  try {
    const url =
      `https://api.openweathermap.org/data/2.5/forecast` +
      `?lat=${loc.lat}&lon=${loc.lon}&units=metric&cnt=6&appid=${key}`;
    const data = await fetchJson<OwmForecastResponse>(url);
    const cutoff = Date.now() + HOURLY_WINDOW * 3_600_000;
    return data.list
      .filter((e) => e.dt * 1000 <= cutoff)
      .map((e) => ({
        time: topOfHourUTC(new Date(e.dt * 1000)),
        temperatureC: e.main.temp,
        condition: capitalize(e.weather?.[0]?.description ?? "Unknown"),
        precipProbabilityPct:
          typeof e.pop === "number" ? Math.round(e.pop * 100) : undefined,
      }));
  } catch {
    // Hourly is best-effort; a failure here should not drop the current reading.
    return [];
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
