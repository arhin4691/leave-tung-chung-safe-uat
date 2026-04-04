/**
 * /api/bus-eta — Unified bus ETA endpoint
 *
 * Aggregates real-time arrival data from KMB, CTB, and NLB into a single
 * normalised response so the frontend only ever makes ONE API call per stop.
 *
 * Usage:
 *   GET /api/bus-eta?type=kmb&route=E33&stop=STOP_ID&serviceType=1
 *   GET /api/bus-eta?type=ctb&route=E33&stop=STOP_ID
 *   GET /api/bus-eta?type=nlb&routeId=623&stop=STOP_ID
 *
 * Response:
 *   { eta: Array<{ eta: string; rmk: string; rmk_en: string; dest: string; dest_en: string }> }
 */

import { NextRequest, NextResponse } from "next/server";

const KMB_BASE = "https://data.etabus.gov.hk/v1/transport/kmb";
const CTB_BASE = "https://rt.data.gov.hk/v1.1/transport/citybus";
const NLB_BASE = "https://rt.data.gov.hk/v2/transport/nlb";

type EtaItem = {
  eta: string;
  rmk: string;
  rmk_en: string;
  dest: string;
  dest_en: string;
};

async function fetchKmbEta(
  route: string,
  stop: string,
  serviceType: string
): Promise<EtaItem[]> {
  const res = await fetch(
    `${KMB_BASE}/eta/${stop}/${route}/${serviceType}`,
    { next: { revalidate: 20 } }
  );
  if (!res.ok) return [];
  const json = await res.json();
  const data: any[] = json.data ?? [];
  return data
    .filter((x) => x.eta)
    .map((x) => ({
      eta: x.eta,
      rmk: x.rmk_tc ?? "",
      rmk_en: x.rmk_en ?? "",
      dest: x.dest_tc ?? "",
      dest_en: x.dest_en ?? "",
    }));
}

async function fetchCtbEta(
  route: string,
  stop: string
): Promise<EtaItem[]> {
  const res = await fetch(
    `${CTB_BASE}/ctb/${stop}/${route}/eta`,
    { next: { revalidate: 20 } }
  );
  if (!res.ok) return [];
  const json = await res.json();
  const data: any[] = json.data ?? [];
  return data
    .filter((x) => x.eta)
    .map((x) => ({
      eta: x.eta,
      rmk: x.rmk_tc ?? "",
      rmk_en: x.rmk_en ?? "",
      dest: x.dest_tc ?? "",
      dest_en: x.dest_en ?? "",
    }));
}

async function fetchNlbEta(
  routeId: string,
  stop: string
): Promise<EtaItem[]> {
  const res = await fetch(
    `${NLB_BASE}/stop.php?action=estimatedArrivals&routeId=${routeId}&stopId=${stop}&language=zh`,
    { next: { revalidate: 20 } }
  );
  if (!res.ok) return [];
  const json = await res.json();
  const data: any[] = json.estimatedArrivals ?? [];
  return data
    .filter((x) => x.estimatedArrivalTime)
    .map((x) => ({
      eta: x.estimatedArrivalTime,
      rmk: x.remarks_tc ?? "",
      rmk_en: x.remarks_en ?? "",
      dest: x.destinationName_c ?? "",
      dest_en: x.destinationName_e ?? "",
    }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type        = searchParams.get("type");        // "kmb" | "ctb" | "nlb"
  const route       = searchParams.get("route");       // route number (KMB/CTB)
  const stop        = searchParams.get("stop");        // stop ID
  const serviceType = searchParams.get("serviceType") ?? "1"; // KMB service type
  const routeId     = searchParams.get("routeId");     // NLB route ID

  if (!type || !stop) {
    return NextResponse.json(
      { error: "Missing required params: type, stop" },
      { status: 400 }
    );
  }

  try {
    let eta: EtaItem[] = [];

    if (type === "kmb") {
      if (!route) return NextResponse.json({ error: "Missing param: route" }, { status: 400 });
      eta = await fetchKmbEta(route, stop, serviceType);
    } else if (type === "ctb") {
      if (!route) return NextResponse.json({ error: "Missing param: route" }, { status: 400 });
      eta = await fetchCtbEta(route, stop);
    } else if (type === "nlb") {
      if (!routeId) return NextResponse.json({ error: "Missing param: routeId" }, { status: 400 });
      eta = await fetchNlbEta(routeId, stop);
    } else {
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }

    return NextResponse.json(
      { eta },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
        },
      }
    );
  } catch (err) {
    console.error("[/api/bus-eta] fetch error:", err);
    return NextResponse.json(
      { error: "Upstream ETA API unavailable" },
      { status: 502 }
    );
  }
}
