import { Router } from "express";
import type { GeoLocation } from "@weather-aggregator/shared";
import { aggregateWeather } from "../aggregator.js";
import { geocode } from "../providers/geocode.js";

export const weatherRouter = Router();

weatherRouter.get("/weather", async (req, res) => {
  try {
    const { lat, lon, q } = req.query;

    let location: GeoLocation;

    if (typeof q === "string" && q.trim()) {
      location = await geocode(q.trim());
    } else if (typeof lat === "string" && typeof lon === "string") {
      const latNum = Number(lat);
      const lonNum = Number(lon);
      if (
        !Number.isFinite(latNum) ||
        !Number.isFinite(lonNum) ||
        latNum < -90 ||
        latNum > 90 ||
        lonNum < -180 ||
        lonNum > 180
      ) {
        return res
          .status(400)
          .json({ error: "Invalid lat/lon. lat must be -90..90 and lon -180..180." });
      }
      location = { name: `${latNum.toFixed(2)}, ${lonNum.toFixed(2)}`, lat: latNum, lon: lonNum };
    } else {
      return res
        .status(400)
        .json({ error: "Provide either a `q` (city name) or both `lat` and `lon`." });
    }

    const result = await aggregateWeather(location);
    return res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({ error: message });
  }
});
