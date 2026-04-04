/**
 * /api/bus-stop-eta  —  Unified, batched bus ETA endpoint
 *
 * Accepts a POST body with an array of route queries.
 * Fetches ALL ETAs from KMB / CTB / NLB in parallel on the server,
 * then returns one aggregated response.  The frontend makes exactly
 * ONE network request per stop-section expansion.
 *
 * Request body:
 *   {
 *     routes: Array<{
 *       id:          string            // caller-chosen unique key
 *       type:        "kmb"|"ctb"|"nlb"
 *       route?:      string            // required for kmb / ctb
 *       routeId?:    string            // required for nlb
 *       stop:        string            // stop ID
 *       serviceType?: string           // KMB service type, default "1"
 *     }>
 *   }
 *
 * Response:
 *   { results: Record<id, EtaItem[]> }
 *
 * EtaItem:
 *   { eta: string; dest: string; dest_en: string; rmk: string; rmk_en: string }
 */

import { NextRequest, NextResponse } from "next/server";

const KMB_BASE = "https://data.etabus.gov.hk/v1/transport/kmb";
const CTB_BASE = "https://rt.data.gov.hk/v2/transport/citybus";
const NLB_BASE = "https://rt.data.gov.hk/v2/transport/nlb";

type BusType = "kmb" | "ctb" | "nlb";

interface RouteQuery {
  id: string;
  type: BusType;
  route?: string;
  routeId?: string;
  stop: string;
  serviceType?: string;
}

interface EtaItem {
  eta: string;
  dest: string;
  dest_en: string;
  rmk: string;
  rmk_en: string;
}

async function fetchKmbEta(
  route: string,
  stop: string,
  serviceType: string
): Promise<EtaItem[]> {
  try {
    const res = await fetch(
      `${KMB_BASE}/eta/${stop}/${route}/${serviceType}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return ((json.data ?? []) as any[])
      .filter((x) => x.eta)
      .map((x) => ({
        eta: x.eta,
        dest: x.dest_tc ?? "",
        dest_en: x.dest_en ?? "",
        rmk: x.rmk_tc ?? "",
        rmk_en: x.rmk_en ?? "",
      }));
  } catch {
    return [];
  }
}

async function fetchCtbEta(
  route: string,
  stop: string
): Promise<EtaItem[]> {
  try {
    const res = await fetch(
      `${CTB_BASE}/eta/CTB/${stop}/${route}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return ((json.data ?? []) as any[])
      .filter((x) => x.eta)
      .map((x) => ({
        eta: x.eta,
        dest: x.dest_tc ?? "",
        dest_en: x.dest_en ?? "",
        rmk: x.rmk_tc ?? "",
        rmk_en: x.rmk_en ?? "",
      }));
  } catch {
    return [];
  }
}

async function fetchNlbEta(
  routeId: string,
  stop: string
): Promise<EtaItem[]> {
  try {
    const res = await fetch(
      `${NLB_BASE}/stop.php?action=estimatedArrivals&routeId=${routeId}&stopId=${stop}&language=zh`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return ((json.estimatedArrivals ?? []) as any[])
      .filter((x) => x.estimatedArrivalTime)
      .map((x) => ({
        eta: x.estimatedArrivalTime,
        dest: x.routeVariantName ?? "",
        dest_en: x.routeVariantName ?? "",
        rmk: x.remarks_tc ?? "",
        rmk_en: x.remarks_en ?? "",
      }));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  let body: { routes?: RouteQuery[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const routes = body.routes;
  if (!Array.isArray(routes) || routes.length === 0) {
    return NextResponse.json(
      { error: "routes must be a non-empty array" },
      { status: 400 }
    );
  }

  // Hard cap to avoid server overload
  if (routes.length > 40) {
    return NextResponse.json(
      { error: "Too many routes in one request (max 40)" },
      { status: 400 }
    );
  }

  // Validate each entry before firing any fetch
  for (const r of routes) {
    if (!r.id || !r.type || !r.stop) {
      return NextResponse.json(
        { error: "Each route entry must have id, type, and stop" },
        { status: 400 }
      );
    }
    if (r.type === "kmb" && !r.route) {
      return NextResponse.json(
        { error: `Route ${r.id}: KMB entries require a route param` },
        { status: 400 }
      );
    }
    if (r.type === "ctb" && !r.route) {
      return NextResponse.json(
        { error: `Route ${r.id}: CTB entries require a route param` },
        { status: 400 }
      );
    }
    if (r.type === "nlb" && !r.routeId) {
      return NextResponse.json(
        { error: `Route ${r.id}: NLB entries require a routeId param` },
        { status: 400 }
      );
    }
  }

  const fetched = await Promise.all(
    routes.map(async (r) => {
      let eta: EtaItem[] = [];
      if (r.type === "kmb") {
        eta = await fetchKmbEta(r.route!, r.stop, r.serviceType ?? "1");
      } else if (r.type === "ctb") {
        eta = await fetchCtbEta(r.route!, r.stop);
      } else if (r.type === "nlb") {
        eta = await fetchNlbEta(r.routeId!, r.stop);
      }
      return { id: r.id, eta };
    })
  );

  const results: Record<string, EtaItem[]> = {};
  for (const { id, eta } of fetched) {
    results[id] = eta;
  }

  return NextResponse.json(
    { results },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
