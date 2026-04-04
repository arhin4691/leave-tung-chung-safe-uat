/**
 * /api/kmb-eta — Batch per-stop KMB ETA for an entire route
 *
 * Source spec: kmb_eta_api_specification (api_docs/)
 * Upstream:    GET /v1/transport/kmb/eta/{stop}/{route}/{service_type}
 *
 * Usage:
 *   GET /api/kmb-eta?route=X&type=O|I&stops=S1,S2,S3&serviceType=1
 *
 * Response:
 *   { etas: { [stopId]: Array<{ eta, dest_tc, dest_en, rmk_tc, rmk_en }> } }
 *
 * Mirrors /api/ctb-eta and /api/nlb-eta so the frontend can use a
 * single code-path for all operators when fetching per-stop ETAs.
 */

import { NextRequest, NextResponse } from "next/server";

const KMB_BASE = "https://data.etabus.gov.hk/v1/transport/kmb";

interface EtaEntry {
  eta: string | null;
  dest_tc: string;
  dest_en: string;
  rmk_tc: string;
  rmk_en: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const route = searchParams.get("route");
  const type = searchParams.get("type"); // "O" | "I"
  const stopsParam = searchParams.get("stops");
  const serviceType = searchParams.get("serviceType") ?? "1";

  if (!route || !stopsParam) {
    return NextResponse.json(
      { error: "Missing required params: route, stops" },
      { status: 400 },
    );
  }

  const dir = type === "I" ? "I" : "O";
  const stopIds = stopsParam.split(",").filter(Boolean);

  if (stopIds.length === 0) {
    return NextResponse.json({ etas: {} });
  }

  try {
    // Fan out: one upstream call per stop, all in parallel
    // Upstream: GET /v1/transport/kmb/eta/{stop}/{route}/{service_type}
    const results = await Promise.all(
      stopIds.map((stopId) =>
        fetch(`${KMB_BASE}/eta/${stopId}/${route}/${serviceType}`, {
          cache: "no-store",
        })
          .then((r) => (r.ok ? r.json() : { data: [] }))
          .then((j) => {
            const filtered: EtaEntry[] = ((j.data ?? []) as Record<string, unknown>[])
              .filter((x) => x.dir === dir && x.eta)
              .map((x) => ({
                eta: (x.eta as string) ?? null,
                dest_tc: (x.dest_tc as string) ?? "",
                dest_en: (x.dest_en as string) ?? "",
                rmk_tc: (x.rmk_tc as string) ?? "",
                rmk_en: (x.rmk_en as string) ?? "",
              }));
            return { stopId, data: filtered };
          })
          .catch(() => ({ stopId, data: [] as EtaEntry[] })),
      ),
    );

    const etas: Record<string, EtaEntry[]> = {};
    for (const { stopId, data } of results) {
      etas[stopId] = data;
    }

    return NextResponse.json(
      { etas },
      {
        headers: { "Cache-Control": "s-maxage=15, stale-while-revalidate=30" },
      },
    );
  } catch {
    return NextResponse.json({ error: "Upstream KMB API error" }, { status: 502 });
  }
}
