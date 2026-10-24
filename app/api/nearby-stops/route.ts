/**
 * Find same-pole bus stops across KMB, CTB, NLB and MTR Bus.
 *
 * hk-bus-crawling publishes a daily updated, cross-operator stop map with
 * canonical stop coordinates. MTR Bus stop locations are maintained in the
 * app because the MTR Bus ETA API does not provide a route/stop index.
 */
import { NextRequest, NextResponse } from "next/server";
import { MTR_BUS_ROUTES_BY_STOP } from "@/shared/data/MTR_BUS_ROUTES_BY_STOP";
import { MTR_BUS_STOP_LOCATIONS } from "@/shared/data/MTR_BUS_STOP_LOCATIONS";
import { MTR_BUS_STOP_NAMES } from "@/shared/data/MTR_BUS_STOP_NAMES";

const HKBUS_FEED_URL =
  "https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json";
const HKBUS_REFRESH_MS = 60 * 60 * 1000;
const SUPPORTED_COMPANIES = ["kmb", "ctb", "nlb"] as const;

type HkBusCompany = (typeof SUPPORTED_COMPANIES)[number];
type CompanyName = "KMB" | "CTB" | "NLB" | "MTRBUS";

interface FeedStop {
  location?: { lat?: number | string; lng?: number | string };
  name?: { en?: string; zh?: string };
}

interface FeedRoute {
  co?: string[];
  route?: string;
  bound?: Partial<Record<HkBusCompany, string>>;
  dest?: { en?: string; zh?: string };
  orig?: { en?: string; zh?: string };
  serviceType?: string | number;
  nlbId?: string | number | null;
  stops?: Partial<Record<HkBusCompany, string[]>>;
}

interface HkBusFeed {
  routeList?: Record<string, FeedRoute>;
  stopList?: Record<string, FeedStop>;
  stopMap?: Record<string, [string, string][]>;
}

interface NearbyRoute {
  route: string;
  company: CompanyName;
  dir: "I" | "O";
  dest_tc: string;
  dest_en: string;
  routeId?: string;
  serviceType?: string;
}

interface NearbyStop {
  stopId: string;
  company: CompanyName;
  lat: number;
  lng: number;
  name_tc: string;
  name_en: string;
  dist: number;
  routes: NearbyRoute[];
}

interface TransitIndex {
  feed: Required<Pick<HkBusFeed, "routeList" | "stopList" | "stopMap">>;
  routesByStop: Map<string, NearbyRoute[]>;
}

let cachedIndex: { expiresAt: number; index: TransitIndex } | undefined;
let indexRequest: Promise<TransitIndex> | undefined;

function companyName(company: HkBusCompany): Exclude<CompanyName, "MTRBUS"> {
  return company.toUpperCase() as Exclude<CompanyName, "MTRBUS">;
}

function buildTransitIndex(feed: HkBusFeed): TransitIndex {
  if (!feed.routeList || !feed.stopList || !feed.stopMap) {
    throw new Error("hk-bus-crawling feed is missing route or stop data");
  }

  const routesByStop = new Map<string, NearbyRoute[]>();
  for (const route of Object.values(feed.routeList)) {
    if (!route.route || !route.co || !route.stops) continue;

    for (const company of SUPPORTED_COMPANIES) {
      if (!route.co.includes(company)) continue;
      const routeStops = route.stops[company] ?? [];
      const dir = route.bound?.[company] === "I" ? "I" : "O";
      const routeInfo: NearbyRoute = {
        route: route.route,
        company: companyName(company),
        dir,
        dest_tc: route.dest?.zh ?? "",
        dest_en: route.dest?.en ?? "",
        ...(company === "nlb" && route.nlbId != null
          ? { routeId: String(route.nlbId) }
          : {}),
        ...(company === "kmb"
          ? { serviceType: String(route.serviceType ?? "1") }
          : {}),
      };

      for (const stopId of routeStops) {
        const key = `${company}:${stopId}`;
        const routes = routesByStop.get(key) ?? [];
        routes.push(routeInfo);
        routesByStop.set(key, routes);
      }
    }
  }

  return {
    feed: {
      routeList: feed.routeList,
      stopList: feed.stopList,
      stopMap: feed.stopMap,
    },
    routesByStop,
  };
}

async function getTransitIndex(): Promise<TransitIndex> {
  if (cachedIndex && cachedIndex.expiresAt > Date.now()) {
    return cachedIndex.index;
  }

  if (!indexRequest) {
    indexRequest = (async () => {
      const response = await fetch(HKBUS_FEED_URL, {
        next: { revalidate: 3600 },
      });
      if (!response.ok) {
        throw new Error(`hk-bus-crawling returned ${response.status}`);
      }
      const index = buildTransitIndex((await response.json()) as HkBusFeed);
      cachedIndex = { expiresAt: Date.now() + HKBUS_REFRESH_MS, index };
      return index;
    })();
  }

  try {
    return await indexRequest;
  } finally {
    indexRequest = undefined;
  }
}

function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const radius = 6_371_000;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius");
  const excludeStopId = searchParams.get("excludeStopId") ?? "";
  const excludeCompany = (searchParams.get("excludeCompany") ?? "").toLowerCase();

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const targetLat = Number(latStr);
  const targetLng = Number(lngStr);
  const requestedRadius = radiusStr === null ? 80 : Number(radiusStr);
  if (
    !Number.isFinite(targetLat) ||
    !Number.isFinite(targetLng) ||
    !Number.isFinite(requestedRadius) ||
    Math.abs(targetLat) > 90 ||
    Math.abs(targetLng) > 180 ||
    requestedRadius <= 0
  ) {
    return NextResponse.json(
      { error: "Invalid lat/lng/radius" },
      { status: 400 },
    );
  }

  const radius = Math.min(requestedRadius, 200);

  try {
    const { feed, routesByStop } = await getTransitIndex();
    const results: NearbyStop[] = [];

    for (const [physicalStopId, stop] of Object.entries(feed.stopList)) {
      const lat = Number(stop.location?.lat);
      const lng = Number(stop.location?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      const dist = haversineM(targetLat, targetLng, lat, lng);
      if (dist > radius) continue;

      for (const [rawCompany, stopId] of feed.stopMap[physicalStopId] ?? []) {
        if (!(SUPPORTED_COMPANIES as readonly string[]).includes(rawCompany)) {
          continue;
        }
        if (rawCompany === excludeCompany && stopId === excludeStopId) continue;

        const company = rawCompany as HkBusCompany;
        const routes =
          routesByStop.get(`${company}:${stopId}`) ?? [];
        if (routes.length === 0) continue;

        results.push({
          stopId,
          company: companyName(company),
          lat,
          lng,
          name_tc: stop.name?.zh ?? stopId,
          name_en: stop.name?.en ?? stopId,
          dist,
          routes,
        });
      }
    }

    for (const [stopId, location] of Object.entries(MTR_BUS_STOP_LOCATIONS)) {
      if (excludeCompany === "mtrbus" && stopId === excludeStopId) continue;

      const dist = haversineM(
        targetLat,
        targetLng,
        location.lat,
        location.lng,
      );
      if (dist > radius) continue;

      const routeNames = MTR_BUS_ROUTES_BY_STOP[stopId] ?? [];
      if (routeNames.length === 0) continue;

      const names = MTR_BUS_STOP_NAMES[stopId];
      results.push({
        stopId,
        company: "MTRBUS",
        lat: location.lat,
        lng: location.lng,
        name_tc: names?.zh ?? stopId,
        name_en: names?.en ?? stopId,
        dist,
        routes: routeNames.map((route) => ({
          route,
          company: "MTRBUS",
          dir: "O",
          dest_tc: route,
          dest_en: route,
        })),
      });
    }

    results.sort((a, b) => a.dist - b.dist);
    return NextResponse.json(
      { stops: results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[/api/nearby-stops] lookup failed:", error);
    return NextResponse.json(
      { error: "Cross-operator stop data is unavailable" },
      { status: 502 },
    );
  }
}
