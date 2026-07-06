import type { GeoLocation } from "@weather-aggregator/shared";
import { fetchJson } from "./http.js";

interface GeocodeResponse {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }[];
}

// Uses Open-Meteo's key-free geocoding API.
export async function geocode(query: string): Promise<GeoLocation> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;

  const data = await fetchJson<GeocodeResponse>(url);
  const first = data.results?.[0];
  if (!first) {
    throw new Error(`No location found for "${query}"`);
  }

  const parts = [first.name, first.admin1, first.country].filter(Boolean);
  return {
    name: parts.join(", "),
    lat: first.latitude,
    lon: first.longitude,
  };
}
