/**
 * /api/stop-all-eta ??Fetch all ETAs at a bus stop from KMB, CTB, or NLB
 *
 * GET /api/stop-all-eta?stopId=<id>&company=kmb|ctb|nlb
 *
 * Calls the stop-level ETA endpoint from the respective operator,
 * groups results by route+direction and returns up to 3 ETA slots each.
 *
 * Response: { rows: StopEtaRow[], timestamp: string }
 */
import { NextRequest, NextResponse } from "next/server";
import type { StopEtaRow, StopEtaSlot } from "@/shared/types";
import { NLB_ROUTES_BY_STOP, NLB_ROUTE_INFO } from "@/shared/data/NLB_ROUTES_BY_STOP";

const KMB_BASE = "https://data.etabus.gov.hk/v1/transport/kmb";
const CTB_BASE = "https://rt.data.gov.hk/v2/transport/citybus";
const NLB_BASE = "https://rt.data.gov.hk/v2/transport/nlb";

function groupEtas(data: Record<string, unknown>[]): StopEtaRow[] {
  const map = new Map<string, StopEtaRow>();

  for (const item of data) {
    const route = (item.route as string) ?? "";
    const dir = ((item.dir as string) ?? "O") as "I" | "O";
    const co = (item.co as string) ?? "";
    const key = `${co}|${route}|${dir}`;

    if (!map.has(key)) {
      map.set(key, {
        route,
        co,
        dir,
        dest_tc: (item.dest_tc as string) ?? "",
        dest_en: (item.dest_en as string) ?? "",
        etas: [],
      });
    }

    const row = map.get(key)!;
    const slot: StopEtaSlot = {
      eta: (item.eta as string | null) ?? null,
      eta_seq: (item.eta_seq as number) ?? 0,
      rmk_tc: (item.rmk_tc as string) ?? "",
      rmk_en: (item.rmk_en as string) ?? "",
    };
    row.etas.push(slot);

    // Prefer non-empty dest from first valid entry
    if (!row.dest_tc && item.dest_tc) row.dest_tc = item.dest_tc as string;
    if (!row.dest_en && item.dest_en) row.dest_en = item.dest_en as string;
  }

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      etas: row.etas
        .sort((a, b) => a.eta_seq - b.eta_seq)
        .slice(0, 3),
    }))
    .sort((a, b) =>
      a.route.localeCompare(b.route, undefined, { numeric: true, sensitivity: "base" })
    );
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const stopId = searchParams.get("stopId");
  const company = searchParams.get("company");

  if (!stopId || !company) {
    return NextResponse.json(
      { error: "Missing stopId or company" },
      { status: 400 }
    );
  }

  try {
    let data: Record<string, unknown>[] = [];

    if (company === "kmb") {
      const res = await fetch(`${KMB_BASE}/stop-eta/${encodeURIComponent(stopId)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        data = (json.data ?? []) as Record<string, unknown>[];
      }
    } else if (company === "ctb") {
      const res = await fetch(
        `${CTB_BASE}/stop-eta/CTB/${encodeURIComponent(stopId)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const json = await res.json();
        data = (json.data ?? []) as Record<string, unknown>[];
      }
    } else if (company === "nlb") {
      // Use static reverse-stop lookup to find all NLB routes at this stop,
      // then fetch live ETAs for each route in parallel.
      const routeIds = (NLB_ROUTES_BY_STOP[stopId] ?? []).slice(0, 8); // cap at 8
      const nlbRows: StopEtaRow[] = [];

      await Promise.all(
        routeIds.map(async (rid) => {
          const routeData = NLB_ROUTE_INFO[rid];
          if (!routeData) return;
          try {
            const res = await fetch(
              `${NLB_BASE}/stop.php?action=estimatedArrivals&routeId=${rid}&stopId=${stopId}&language=zh`,
              { cache: "no-store" }
            );
            if (!res.ok) return;
            const json = await res.json();
            const arrivals = (json.estimatedArrivals ?? []) as Array<{
              estimatedArrivalTime: string;
              destinationName_c: string;
              destinationName_e: string;
            }>;
            if (arrivals.length === 0) return;

            const dest_tc =
              arrivals[0]?.destinationName_c ||
              routeData.name_c.split(" > ").pop() ||
              "";
            const dest_en =
              arrivals[0]?.destinationName_e ||
              routeData.name_e.split(" > ").pop() ||
              "";

            nlbRows.push({
              route: routeData.routeNo,
              co: "NLB",
              dir: "O",
              dest_tc,
              dest_en,
              etas: arrivals.slice(0, 3).map((a, i) => ({
                // Convert "YYYY-MM-DD HH:mm:ss" ??ISO 8601 for Date.parse()
                eta: a.estimatedArrivalTime
                  ? a.estimatedArrivalTime.replace(" ", "T") + "+08:00"
                  : null,
                eta_seq: i + 1,
                rmk_tc: "",
                rmk_en: "",
              } as StopEtaSlot)),
            });
          } catch {
            // skip this route if request fails
          }
        })
      );

      // Sort by soonest ETA
      nlbRows.sort((a, b) => {
        const etaA = a.etas[0]?.eta ? Date.parse(a.etas[0].eta) : Infinity;
        const etaB = b.etas[0]?.eta ? Date.parse(b.etas[0].eta) : Infinity;
        return etaA - etaB;
      });

      return NextResponse.json({ rows: nlbRows, timestamp: new Date().toISOString() });
    }

    const rows = groupEtas(data);
    return NextResponse.json({ rows, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("stop-all-eta error:", err);
    return NextResponse.json({
      rows: [],
      timestamp: new Date().toISOString(),
    });
  }
}
