import { NextRequest, NextResponse } from "next/server";
import type { BusRouteShapeCollection } from "@/shared/types";

const ROUTE_FARE_LIST_URL = "https://data.hkbus.app/routeFareList.json";
const WAYPOINTS_URL = "https://hkbus.github.io/route-waypoints";

interface HkbusRoute {
  route?: string;
  co?: string[];
  bound?: Record<string, string>;
  gtfsId?: string | number;
  nlbId?: string | number;
  serviceType?: string | number;
  dest?: { zh?: string; en?: string };
  stops?: Record<string, string[]>;
}

interface HkbusRouteFareList {
  routeList?: Record<string, HkbusRoute>;
}

function isRouteShapeCollection(value: unknown): value is BusRouteShapeCollection {
  if (!value || typeof value !== "object") return false;
  const collection = value as Record<string, unknown>;
  if (
    collection.type !== "FeatureCollection" ||
    !Array.isArray(collection.features) ||
    collection.features.length === 0
  ) {
    return false;
  }

  return collection.features.every((feature) => {
    if (!feature || typeof feature !== "object") return false;
    const routeFeature = feature as Record<string, unknown>;
    if (
      routeFeature.type !== "Feature" ||
      !routeFeature.properties ||
      typeof routeFeature.properties !== "object"
    ) {
      return false;
    }
    const geometry = routeFeature.geometry;
    if (!geometry || typeof geometry !== "object") return false;
    const routeGeometry = geometry as Record<string, unknown>;
    const coordinates = routeGeometry.coordinates;
    if (!Array.isArray(coordinates)) return false;
    if (routeGeometry.type === "LineString") {
      return (
        coordinates.length > 1 &&
        coordinates.every(isCoordinate)
      );
    }
    if (routeGeometry.type === "MultiLineString") {
      return (
        coordinates.length > 0 &&
        coordinates.every(
          (line) =>
            Array.isArray(line) &&
            line.length > 1 &&
            line.every(isCoordinate),
        )
      );
    }
    return false;
  });
}

function isCoordinate(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const route = searchParams.get("route");
  const company = searchParams.get("company")?.toUpperCase();
  const direction = searchParams.get("dir");

  if (
    !route ||
    !company ||
    !direction ||
    !["O", "I"].includes(direction)
  ) {
    return NextResponse.json(
      { error: "route, company, and dir=O|I are required" },
      { status: 400 },
    );
  }

  const companyKey: Record<string, string> = {
    KMB: "kmb",
    CTB: "ctb",
    NLB: "nlb",
  };
  const operator = companyKey[company];
  if (!operator) {
    return NextResponse.json(
      { error: "Route geometry is unavailable for this operator" },
      { status: 404 },
    );
  }

  const routeId = searchParams.get("routeId");
  const hasNlbRouteId = company === "NLB" && routeId !== null;
  const serviceType = searchParams.get("serviceType");
  const destination = searchParams.get("destination")?.trim().toLocaleLowerCase();
  const stopIds = new Set(
    (searchParams.get("stopIds") ?? "")
      .split(",")
      .filter(Boolean)
      .slice(0, 250),
  );

  try {
    const routesResponse = await fetch(ROUTE_FARE_LIST_URL, {
      next: { revalidate: 3600 },
    });
    if (!routesResponse.ok) {
      throw new Error(`HKBUS route feed returned ${routesResponse.status}`);
    }
    const feed = (await routesResponse.json()) as HkbusRouteFareList;
    let candidates = Object.values(feed.routeList ?? {}).filter(
      (item) =>
        item.route === route &&
        item.co?.includes(operator) &&
        (hasNlbRouteId || item.bound?.[operator] === direction) &&
        item.gtfsId !== undefined,
    );

    if (routeId) {
      candidates = candidates.filter(
        (item) => String(item.nlbId) === routeId,
      );
    }

    if (serviceType) {
      const matchingService = candidates.filter(
        (item) => String(item.serviceType ?? "1") === serviceType,
      );
      if (matchingService.length > 0) candidates = matchingService;
    }

    if (destination) {
      const matchingDestination = candidates.filter(
        (item) =>
          item.dest?.zh?.trim().toLocaleLowerCase() === destination ||
          item.dest?.en?.trim().toLocaleLowerCase() === destination,
      );
      if (matchingDestination.length > 0) candidates = matchingDestination;
    }

    if (stopIds.size > 0) {
      candidates.sort((a, b) => {
        const aMatches = (a.stops?.[operator] ?? []).filter((id) =>
          stopIds.has(id),
        ).length;
        const bMatches = (b.stops?.[operator] ?? []).filter((id) =>
          stopIds.has(id),
        ).length;
        return bMatches - aMatches;
      });
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "No route geometry found for this route and direction" },
        { status: 404 },
      );
    }

    for (const candidate of candidates.slice(0, 10)) {
      const shapeDirection = hasNlbRouteId
        ? candidate.bound?.[operator]
        : direction;
      if (shapeDirection !== "O" && shapeDirection !== "I") continue;

      const shapeResponse = await fetch(
        `${WAYPOINTS_URL}/${encodeURIComponent(String(candidate.gtfsId))}-${shapeDirection}.json`,
        { next: { revalidate: 86400 } },
      );
      if (!shapeResponse.ok) continue;

      const shape: unknown = await shapeResponse.json();
      if (isRouteShapeCollection(shape)) {
        return NextResponse.json(shape, {
          headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    return NextResponse.json(
      { error: "Route geometry is not currently available" },
      { status: 404 },
    );
  } catch (error) {
    console.error("[bus-route-shape] Failed to load route geometry:", error);
    return NextResponse.json(
      { error: "Route geometry service is unavailable" },
      { status: 502 },
    );
  }
}
