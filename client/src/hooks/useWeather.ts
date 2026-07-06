import { useCallback, useState } from "react";
import type { AggregatedWeather } from "@weather-aggregator/shared";

export type WeatherQuery =
  | { q: string }
  | { lat: number; lon: number };

interface UseWeatherState {
  data: AggregatedWeather | null;
  loading: boolean;
  error: string | null;
}

function buildUrl(query: WeatherQuery): string {
  const params = new URLSearchParams();
  if ("q" in query) {
    params.set("q", query.q);
  } else {
    params.set("lat", String(query.lat));
    params.set("lon", String(query.lon));
  }
  return `/api/weather?${params.toString()}`;
}

export function useWeather() {
  const [state, setState] = useState<UseWeatherState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchWeather = useCallback(async (query: WeatherQuery) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(buildUrl(query));
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setState({ data: body as AggregatedWeather, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, []);

  return { ...state, fetchWeather };
}
