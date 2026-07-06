import type {
  GeoLocation,
  HourlyPoint,
  WeatherReport,
} from "@weather-aggregator/shared";
import { PROVIDER_LABELS } from "@weather-aggregator/shared";
import { fetchJson } from "./http.js";
import { HOURLY_WINDOW, topOfHourUTC } from "../time.js";

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
}

// WMO weather interpretation codes -> human-readable text.
const WMO_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export async function fetchOpenMeteo(loc: GeoLocation): Promise<WeatherReport> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${loc.lat}&longitude=${loc.lon}&timezone=UTC` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&hourly=temperature_2m,weather_code,precipitation_probability&forecast_days=2`;

  const data = await fetchJson<OpenMeteoResponse>(url);
  const c = data.current;

  return {
    provider: "open-meteo",
    providerLabel: PROVIDER_LABELS["open-meteo"],
    location: loc,
    temperatureC: c.temperature_2m,
    feelsLikeC: c.apparent_temperature,
    humidityPct: c.relative_humidity_2m,
    windSpeedKph: c.wind_speed_10m,
    condition: WMO_CODES[c.weather_code] ?? "Unknown",
    hourly: buildHourly(data.hourly),
    fetchedAt: new Date().toISOString(),
  };
}

function buildHourly(hourly: OpenMeteoResponse["hourly"]): HourlyPoint[] {
  if (!hourly) return [];
  const nowHour = Date.now() - 3_600_000; // include the current hour
  const points: HourlyPoint[] = [];
  for (let i = 0; i < hourly.time.length; i++) {
    // timezone=UTC returns local-naive strings in UTC; append Z to parse as UTC.
    const date = new Date(`${hourly.time[i]}Z`);
    if (date.getTime() < nowHour) continue;
    points.push({
      time: topOfHourUTC(date),
      temperatureC: hourly.temperature_2m[i],
      condition: WMO_CODES[hourly.weather_code[i]] ?? "Unknown",
      precipProbabilityPct: hourly.precipitation_probability?.[i],
    });
    if (points.length >= HOURLY_WINDOW) break;
  }
  return points;
}
