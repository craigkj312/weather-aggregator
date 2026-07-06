import type {
  GeoLocation,
  HourlyPoint,
  WeatherReport,
} from "@weather-aggregator/shared";
import { PROVIDER_LABELS } from "@weather-aggregator/shared";
import { fetchJson } from "./http.js";
import { HOURLY_WINDOW, topOfHourUTC } from "../time.js";

interface WeatherApiHour {
  time_epoch: number;
  temp_c: number;
  condition: { text: string };
  chance_of_rain: number;
  chance_of_snow: number;
}

interface WeatherApiResponse {
  location: { name: string };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    condition: { text: string; icon: string };
  };
  forecast?: {
    forecastday: { hour: WeatherApiHour[] }[];
  };
}

export async function fetchWeatherApi(loc: GeoLocation): Promise<WeatherReport> {
  const key = process.env.WEATHERAPI_KEY;
  if (!key) {
    throw new Error("WEATHERAPI_KEY is not set");
  }

  const url =
    `https://api.weatherapi.com/v1/forecast.json` +
    `?key=${key}&q=${loc.lat},${loc.lon}&days=2&aqi=no&alerts=no`;

  const data = await fetchJson<WeatherApiResponse>(url);
  const icon = data.current.condition.icon;

  return {
    provider: "weatherapi",
    providerLabel: PROVIDER_LABELS.weatherapi,
    location: { ...loc, name: data.location.name || loc.name },
    temperatureC: data.current.temp_c,
    feelsLikeC: data.current.feelslike_c,
    humidityPct: data.current.humidity,
    windSpeedKph: data.current.wind_kph,
    condition: data.current.condition.text,
    conditionIcon: icon
      ? icon.startsWith("//")
        ? `https:${icon}`
        : icon
      : undefined,
    hourly: buildHourly(data.forecast),
    fetchedAt: new Date().toISOString(),
  };
}

function buildHourly(forecast: WeatherApiResponse["forecast"]): HourlyPoint[] {
  if (!forecast) return [];
  const nowHour = Date.now() - 3_600_000; // include the current hour
  const hours = forecast.forecastday.flatMap((d) => d.hour);
  const points: HourlyPoint[] = [];
  for (const h of hours) {
    const date = new Date(h.time_epoch * 1000);
    if (date.getTime() < nowHour) continue;
    points.push({
      time: topOfHourUTC(date),
      temperatureC: h.temp_c,
      condition: h.condition.text,
      precipProbabilityPct: Math.max(h.chance_of_rain, h.chance_of_snow),
    });
    if (points.length >= HOURLY_WINDOW) break;
  }
  return points;
}
