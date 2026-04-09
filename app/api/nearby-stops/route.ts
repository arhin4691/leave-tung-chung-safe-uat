/**
 * /api/nearby-stops — Find bus stops from other operators near a given coordinate
 *
 * Used by BusStopModal to discover routes from different operators at the same
 * physical location even when they use different stop ID registries.
 *
 * Strategy:
 *   KMB + CTB share the same stop ID registry — a bulk KMB stop list is fetched
 *   (cached 24 h) and filtered with a Haversine radius check.  The found KMB stop
 *   IDs are also valid CTB stop IDs.
 *
 *   MTR Bus stop coordinates are pre-computed from mtr_bus_stops_raw.csv and
 *   stored in the static MTR_BUS_STOP_LOCATIONS map, keyed by busStopId.
 *   The MTR_BUS_ROUTES_BY_STOP map tells us which routes serve each stop.
 *
 *   NLB stops use a separate numeric ID system and their coordinates are not
 *   pre-indexed — they are omitted from this proximity lookup.  NLB routes at
 *   KMB/CTB stops should be discovered through the cross-operator stop-all-eta
 *   query, which already handles NLB on shared physical stops via NLB_ROUTES_BY_STOP.
 *
 * GET /api/nearby-stops?lat=<number>&lng=<number>&radius=<meters>&excludeStopId=<id>
 *
 * Response:
 *   {
 *     stops: Array<{
 *       stopId: string;
 *       company: "KMB" | "MTRBUS";
 *       lat: number;
 *       lng: number;
 *       name_tc: string;
 *       name_en: string;
 *       dist: number;   // metres
 *     }>
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { MTR_BUS_STOP_LOCATIONS } from "@/shared/data/MTR_BUS_STOP_LOCATIONS";
import { MTR_BUS_ROUTES_BY_STOP } from "@/shared/data/MTR_BUS_ROUTES_BY_STOP";
import { MTR_BUS_STOP_NAMES } from "@/shared/data/MTR_BUS_STOP_NAMES";

const KMB_STOP_LIST_URL =
  "https://data.etabus.gov.hk/v1/transport/kmb/stop-list";

// Haversine distance in metres between two lat/lng points
function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Degree-based bounding box pre-filter (fast, no trig)
function inBounds(
  lat: number,
  lng: number,
  targetLat: number,
  targetLng: number,
  radiusM: number,
): boolean {
  const latDelta = radiusM / 111_000;
  const lngDelta = radiusM / (111_000 * Math.cos((targetLat * Math.PI) / 180));
  return (
    Math.abs(lat - targetLat) <= latDelta &&
    Math.abs(lng - targetLng) <= lngDelta
  );
}

interface NearbyStop {
  stopId: string;
  company: "KMB" | "MTRBUS";
  lat: number;
  lng: number;
  name_tc: string;
  name_en: string;
  dist: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius");
  const excludeStopId = searchParams.get("excludeStopId") ?? "";

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const targetLat = parseFloat(latStr);
  const targetLng = parseFloat(lngStr);
  const radius = Math.min(parseFloat(radiusStr ?? "80"), 200); // cap at 200m

  if (isNaN(targetLat) || isNaN(targetLng) || isNaN(radius)) {
    return NextResponse.json({ error: "Invalid lat/lng/radius" }, { status: 400 });
  }

  const results: NearbyStop[] = [];

  // ── 1. KMB stops (bulk list, shared with CTB) ──────────────────
  try {
    const res = await fetch(KMB_STOP_LIST_URL, {
      next: { revalidate: 86_400 }, // cache 24 hours — stops are static
    });
    if (res.ok) {
      const json = await res.json();
      type KmbStop = {
        stop: string;
        name_tc: string;
        name_en: string;
        lat: string;
        long: string;
      };
      const stopList: KmbStop[] = (json.data ?? []) as KmbStop[];

      for (const s of stopList) {
        if (s.stop === excludeStopId) continue;
        const lat = parseFloat(s.lat);
        const lng = parseFloat(s.long);
        if (isNaN(lat) || isNaN(lng)) continue;

        // Fast bounding-box pre-filter
        if (!inBounds(lat, lng, targetLat, targetLng, radius)) continue;

        const dist = haversineM(targetLat, targetLng, lat, lng);
        if (dist <= radius) {
          results.push({
            stopId: s.stop,
            company: "KMB",
            lat,
            lng,
            name_tc: s.name_tc,
            name_en: s.name_en,
            dist,
          });
        }
      }
    }
  } catch {
    // non-fatal — skip KMB stops on upstream error
  }

  // ── 2. MTR Bus stops (static coordinate map) ───────────────────
  for (const [busStopId, coords] of Object.entries(MTR_BUS_STOP_LOCATIONS)) {
    if (busStopId === excludeStopId) continue;
    if (!inBounds(coords.lat, coords.lng, targetLat, targetLng, radius)) continue;

    const dist = haversineM(targetLat, targetLng, coords.lat, coords.lng);
    if (dist <= radius) {
      // Only include if there are routes at this stop
      if (!(MTR_BUS_ROUTES_BY_STOP[busStopId]?.length > 0)) continue;

      const names = MTR_BUS_STOP_NAMES[busStopId];
      results.push({
        stopId: busStopId,
        company: "MTRBUS",
        lat: coords.lat,
        lng: coords.lng,
        name_tc: names?.zh ?? busStopId,
        name_en: names?.en ?? busStopId,
        dist,
      });
    }
  }

  // Sort by distance
  results.sort((a, b) => a.dist - b.dist);

  return NextResponse.json(
    { stops: results },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
