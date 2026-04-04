import { NextRequest, NextResponse } from "next/server";

const NLB_BASE = "https://rt.data.gov.hk/v2/transport/nlb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const routeId = searchParams.get("routeId");

  if (!routeId) {
    return NextResponse.json({ error: "Missing routeId param" }, { status: 400 });
  }

  try {
    // 1. Fetch stop list
    const listRes = await fetch(
      `${NLB_BASE}/stop.php?action=list&routeId=${routeId}`,
      { next: { revalidate: 600 } }
    );
    const listJson = await listRes.json();
    const stops: any[] = listJson.stops ?? [];

    if (stops.length === 0) {
      return NextResponse.json({ stops: [], isWorking: false });
    }

    // 2. Fetch ETA for last stop to check service availability
    const lastStop = stops[stops.length - 1];
    const etaRes = await fetch(
      `${NLB_BASE}/stop.php?action=estimatedArrivals&routeId=${routeId}&stopId=${lastStop.stopId}&language=zh`,
      { next: { revalidate: 20 } }
    )
      .then((r) => r.json())
      .catch(() => ({ estimatedArrivals: [] }));

    const isWorking =
      Array.isArray(etaRes.estimatedArrivals) && etaRes.estimatedArrivals.length > 0;

    return NextResponse.json(
      { stops, isWorking },
      {
        headers: { "Cache-Control": "s-maxage=15, stale-while-revalidate=30" },
      }
    );
  } catch {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
