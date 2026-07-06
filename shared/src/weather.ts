export type ProviderId = "openweathermap" | "weatherapi" | "open-meteo";

export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
}

export interface HourlyPoint {
  time: string; // ISO timestamp, normalized to the top of the hour (UTC)
  temperatureC: number;
  condition?: string;
  precipProbabilityPct?: number; // 0-100, when the provider reports it
}

export interface WeatherReport {
  provider: ProviderId;
  providerLabel: string;
  location: GeoLocation;
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  windSpeedKph: number;
  condition: string;
  conditionIcon?: string;
  hourly: HourlyPoint[];
  fetchedAt: string;
  error?: string;
}

export interface AggregatedHourlyPoint {
  time: string; // ISO timestamp, top of the hour (UTC)
  temperatureC: number;
  condition: string;
  precipProbabilityPct: number | null; // averaged across sources that report it
  sourceCount: number;
}

export interface AggregatedAverage {
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  windSpeedKph: number;
  condition: string;
}

export interface AggregatedWeather {
  location: GeoLocation;
  average: AggregatedAverage | null;
  hourly: AggregatedHourlyPoint[];
  providers: WeatherReport[];
  successCount: number;
  totalCount: number;
}

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  openweathermap: "OpenWeatherMap",
  weatherapi: "WeatherAPI.com",
  "open-meteo": "Open-Meteo",
};
