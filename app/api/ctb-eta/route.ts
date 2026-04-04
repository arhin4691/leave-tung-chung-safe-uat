import { NextRequest, NextResponse } from "next/server";

const CTB_BASE = "https://rt.data.gov.hk/v2/transport/citybus";

/**
 * GET /api/ctb-eta?route=X&stops=S1,S2,S3
 * Batch-fetches ETA for multiple CTB stops in one request.
 * Returns: { etas: { [stopId]: any[] } }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const route = searchParams.get("route");
  const stopsParam = searchParams.get("stops");

  if (!route || !stopsParam) {
    return NextResponse.json({ error: "Missing route or stops param" }, { status: 400 });
  }

  const stopIds = stopsParam.split(",").filter(Boolean);

  if (stopIds.length === 0) {
    return NextResponse.json({ etas: {} });
  }

  try {
    const results = await Promise.all(
      stopIds.map((stopId) =>
        fetch(`${CTB_BASE}/eta/CTB/${stopId}/${route}`)
          .then((r) => r.json())
          .then((j) => ({ stopId, data: j.data ?? [] }))
          .catch(() => ({ stopId, data: [] }))
      )
    );

    const etas: Record<string, any[]> = {};
    for (const { stopId, data } of results) {
      etas[stopId] = data;
    }

    return NextResponse.json(
      { etas },
      {
        headers: { "Cache-Control": "s-maxage=15, stale-while-revalidate=30" },
      }
    );
  } catch {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
