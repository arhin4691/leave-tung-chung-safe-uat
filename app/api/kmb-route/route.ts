/**
 * /api/kmb-route
 *
 * Batched KMB route detail endpoint.
 * Previously BackRoutesItems.tsx (client) fired 3 separate fetches:
 *   1. route-stop list       → data.etabus.gov.hk/v1/transport/kmb/route-stop/…
 *   2. route-eta (isWorking) → data.etabus.gov.hk/v1/transport/kmb/route-eta/…
 *   3. timetable             → search.kmb.hk/KMBWebSite/Function/FunctionRequest.ashx
 *
 * This server-side route fetches all three in parallel and returns a single
 * aggregated JSON blob.  The client calls ONE endpoint instead of three.
 *
 * Usage: GET /api/kmb-route?route=X&type=O   (type = "O" outbound | "I" inbound)
 */

import { NextRequest, NextResponse } from "next/server";

const KMB_BASE = "https://data.etabus.gov.hk/v1/transport/kmb";
const KMB_WEB =
  "https://search.kmb.hk/KMBWebSite/Function/FunctionRequest.ashx";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const route = searchParams.get("route");
  const type = searchParams.get("type"); // "O" | "I"

  if (!route || !type) {
    return NextResponse.json(
      { error: "Missing required query params: route, type" },
      { status: 400 },
    );
  }

  const direction = type === "O" ? "outbound" : "inbound";
  const bound = type === "O" ? 1 : 2;

  try {
    const [stopRes, etaRes, ttRes] = await Promise.all([
      fetch(`${KMB_BASE}/route-stop/${route}/${direction}/1`, {
        next: { revalidate: 600 },
      }),
      fetch(`${KMB_BASE}/route-eta/${route}/1`, { next: { revalidate: 20 } }),
      fetch(`${KMB_WEB}?action=getSpecialRoute&route=${route}&bound=${bound}`, {
        next: { revalidate: 600 },
      }),
    ]);

    const [stopJson, etaJson, ttJson] = await Promise.all([
      stopRes.ok ? stopRes.json() : null,
      etaRes.ok ? etaRes.json() : null,
      ttRes.ok ? ttRes.json() : null,
    ]);

    const etaData: any[] = etaJson?.data ?? [];
    const etaFiltered = etaData.filter((x: any) => x.dir === type);

    return NextResponse.json(
      {
        stops: stopJson?.data ?? [],
        eta: etaFiltered,
        timetable: ttJson?.data?.routes ?? [],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    console.error("[/api/kmb-route] fetch error:", err);
    return NextResponse.json(
      { error: "Upstream KMB API unavailable" },
      { status: 502 },
    );
  }
}
