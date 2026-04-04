import { NextRequest, NextResponse } from "next/server";

const CTB_BASE = "https://rt.data.gov.hk/v2/transport/citybus";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const route = searchParams.get("route");
  const mode = searchParams.get("mode"); // "reverse" → outbound, else inbound

  if (!route) {
    return NextResponse.json({ error: "Missing route param" }, { status: 400 });
  }

  const direction = mode === "reverse" ? "outbound" : "inbound";

  try {
    // 1. Fetch stop ID list for this route+direction
    const routeStopRes = await fetch(
      `${CTB_BASE}/route-stop/ctb/${route}/${direction}`,
      { next: { revalidate: 600 } }
    );
    const routeStopJson = await routeStopRes.json();
    const stopIds: string[] = (routeStopJson.data ?? []).map((s: any) => s.stop as string);

    if (stopIds.length === 0) {
      return NextResponse.json({ stops: [], isWorking: false });
    }

    // 2. Fetch stop details for ALL stops + ETA for last stop — all in parallel
    const [stopResults, etaRes] = await Promise.all([
      Promise.all(
        stopIds.map((id) =>
          fetch(`${CTB_BASE}/stop/${id}`, { next: { revalidate: 3600 } })
            .then((r) => r.json())
            .then((j) => j.data)
            .catch(() => null)
        )
      ),
      fetch(`${CTB_BASE}/eta/CTB/${stopIds[stopIds.length - 1]}/${route}`, {
        next: { revalidate: 20 },
      })
        .then((r) => r.json())
        .catch(() => ({ data: [] })),
    ]);

    const dir = mode === "reverse" ? "O" : "I";
    const isWorking = (etaRes.data ?? []).some(
      (i: any) => i.dir === dir && i.eta !== "" && i.eta !== null
    );

    const stops = stopResults.filter(Boolean).map((s: any) => ({
      stop: s.stop,
      name_en: s.name_en,
      name_tc: s.name_tc,
      lat: s.lat,
      long: s.long,
    }));

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
