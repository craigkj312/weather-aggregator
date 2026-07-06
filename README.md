# Weather Aggregator

A full-stack React + Express app that fetches current weather from **three providers** in parallel, averages the numeric readings, and shows an aggregated headline plus a per-provider breakdown.

- Headline panel: the **average** across all successful providers (temperature, feels-like, humidity, wind, most common condition).
- Source cards below: each provider's individual report, with graceful error states for any that fail.

## Providers

| Provider | API key required |
|----------|------------------|
| OpenWeatherMap | Yes (`OPENWEATHER_API_KEY`) |
| WeatherAPI.com | Yes (`WEATHERAPI_KEY`) |
| Open-Meteo | No |

Because Open-Meteo needs no key, the app still works (with a partial average) even before you add the other two keys.

## Architecture

```
weather-aggregator/
├── shared/   # Shared TypeScript types (WeatherReport, AggregatedWeather)
├── server/   # Express proxy: provider adapters + aggregator + /api/weather
└── client/   # Vite + React + Tailwind UI
```

API keys live only on the server, which acts as a proxy so keys are never exposed to the browser.

## Setup

1. Install dependencies from the repo root (npm workspaces):

   ```bash
   npm install
   ```

2. Create your env file and add keys:

   ```bash
   cp .env.example .env
   ```

   Fill in:

   ```
   OPENWEATHER_API_KEY=your_key
   WEATHERAPI_KEY=your_key
   ```

   - OpenWeatherMap free tier: https://openweathermap.org/api
   - WeatherAPI.com free tier: https://www.weatherapi.com/

3. Run both server and client together:

   ```bash
   npm run dev
   ```

   - Client: http://localhost:5173
   - API: http://localhost:3001

The Vite dev server proxies `/api/*` to the Express server, so no CORS config is needed in development.

## API

`GET /api/weather?q=<city>` — geocodes the city (via Open-Meteo, no key) then aggregates.

`GET /api/weather?lat=<lat>&lon=<lon>` — aggregates for exact coordinates.

Response shape: see [`shared/src/weather.ts`](shared/src/weather.ts) (`AggregatedWeather`).

## How averaging works

- **Numeric fields** (temp, feels-like, humidity, wind): arithmetic mean of the providers that responded successfully.
- **Condition**: the most frequently reported condition string (ties broken by first responder).
- **Partial failures**: failed providers are excluded from the average and shown as error cards; the headline reports an `N/3 sources` badge.

## Production build

```bash
npm run build      # builds shared -> server -> client
npm run start      # runs the compiled server (serve client/dist separately or via a static host)
```
