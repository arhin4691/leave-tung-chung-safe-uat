/**
 * /api/mtr-schedule
 *
 * Batched MTR schedule endpoint.
 * Fetches ETA for all stations on a given MTR line in a single Promise.all.
 *
 * Usage:
 *   GET /api/mtr-schedule?line=TCL&stations=TUC,SUN,TSY,LAK,NAC,OLY,KOW,HOK
 *   GET /api/mtr-schedule?line=AEL&stations=HOK,KOW,TSY,AIR,AWE
 *
 * The `line` param defaults to "TCL" for backward compatibility.
 */

import { NextRequest, NextResponse } from "next/server";

const MTR_BASE = "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const stationsParam = searchParams.get("stations");
  const line          = (searchParams.get("line") ?? "TCL").toUpperCase();

  if (!stationsParam) {
    return NextResponse.json(
      { error: "Missing required query param: stations" },
      { status: 400 }
    );
  }

  const stations = stationsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (stations.length === 0) {
    return NextResponse.json({ error: "No valid stations provided" }, { status: 400 });
  }

  try {
    // Batch all station requests in parallel on the server
    const results = await Promise.all(
      stations.map(async (station) => {
        const res = await fetch(
          `${MTR_BASE}?line=${line}&sta=${station}&lang=tc`,
          { next: { revalidate: 20 } }
        );
        if (!res.ok) return { station, data: null };
        const json = await res.json();
        return { station, data: json.data ?? null };
      })
    );

    return NextResponse.json(
      { stations: results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
        },
      }
    );
  } catch (err) {
    console.error("[/api/mtr-schedule] fetch error:", err);
    return NextResponse.json(
      { error: "Upstream MTR API unavailable" },
      { status: 502 }
    );
  }
}
