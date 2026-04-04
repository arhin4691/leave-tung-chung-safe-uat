/**
 * go_back page — revamped bus route browser
 *
 * Server component: pre-fetches all KMB / CTB / NLB routes in parallel
 * and hands them to BusPageClient for client-side filtering + ETA display.
 *
 * API docs used:
 *   KMB:  kmb_eta_api_specification  → GET /v1/transport/kmb/route/
 *   CTB:  ctb_bus_eta_api_specifications → GET /v2/transport/citybus/route/ctb
 *   NLB:  nlb_bus_eta_api            → GET /v2/transport/nlb/route.php?action=list
 */
import BusPageClient from "@/shared/components/back_routes/BusPageClient";
import type { Metadata } from "next";
import type { KmbRoute, CtbRoute, NlbRoute } from "@/shared/types";

export const metadata: Metadata = {
  title: "東涌出行 - 巴士路線",
  description: "Welcome to Leave Tung Chung Safe App - Buses",
};

export default async function GoBackPage() {
  let kmbData: KmbRoute[] = [];
  let ctbData: CtbRoute[] = [];
  let nlbData: NlbRoute[] = [];

  try {
    const [kmbRes, ctbRes, nlbRes] = await Promise.all([
      // KMB: GET /v1/transport/kmb/route/   (kmb_eta_api_specification)
      fetch("https://data.etabus.gov.hk/v1/transport/kmb/route/", {
        next: { revalidate: 600 },
      }),
      // CTB: GET /v2/transport/citybus/route/ctb   (ctb_bus_eta_api_specifications)
      fetch("https://rt.data.gov.hk/v2/transport/citybus/route/ctb", {
        next: { revalidate: 600 },
      }),
      // NLB: GET /v2/transport/nlb/route.php?action=list   (nlb_bus_eta_api)
      fetch("https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list", {
        next: { revalidate: 600 },
      }),
    ]);

    const kmbJson = await kmbRes.json();
    // Keep only service_type "1" to avoid duplicates from special variants
    kmbData = ((kmbJson.data ?? []) as KmbRoute[]).filter(
      (x) => x.service_type?.toString() === "1",
    );

    const ctbJson = await ctbRes.json();
    ctbData = (ctbJson.data ?? []) as CtbRoute[];

    const nlbJson = await nlbRes.json();
    nlbData = (nlbJson.routes ?? []) as NlbRoute[];
  } catch (error) {
    console.error("GoBackPage fetch error:", error);
  }

  return (
    <BusPageClient kmbData={kmbData} ctbData={ctbData} nlbData={nlbData} />
  );
}

