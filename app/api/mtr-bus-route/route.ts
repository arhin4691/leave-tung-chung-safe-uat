/**
 * /api/mtr-bus-route — MTR Bus schedule for a single route
 *
 * Source spec: MTR_BUS_API_Spec_v1.13 (api_docs/)
 * Upstream:    POST https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule
 *              Body: { language: "zh" | "en", routeName: string }
 *
 * Usage:
 *   GET /api/mtr-bus-route?routeName=K12&lang=zh
 *
 * Response:
 *   {
 *     routeName: string,
 *     status: "1" | string,          // "1" = normal service
 *     busStop: Array<{
 *       busStopId: string,
 *       isSuspended: string,         // "1" = suspended, "0" = normal
 *       bus: Array<{
 *         arrivalTimeInSecond: string,   // seconds from now (negative = departed)
 *         arrivalTimeText: string,       // "X minutes" | "Arriving" | "Departed"
 *         busId: string,
 *         busLocation: { latitude: number, longitude: number },
 *         departureTimeInSecond: string,
 *         departureTimeText: string,
 *         isScheduled: string,           // "1" = schedule-based, "0" = real-time
 *         lineRef: string,               // e.g. "K12_TPMS"
 *         isDelayed: string,
 *       }>
 *     }>
 *   }
 */

import { NextRequest, NextResponse } from "next/server";

const MTR_BUS_BASE = "https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const routeName = searchParams.get("routeName");
  const lang = searchParams.get("lang") ?? "zh";

  if (!routeName) {
    return NextResponse.json(
      { error: "Missing required param: routeName" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(MTR_BUS_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang, routeName }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `MTR upstream error: ${res.status}` },
        { status: 502 },
      );
    }

    const json = await res.json();

    return NextResponse.json(json, {
      headers: { "Cache-Control": "s-maxage=20, stale-while-revalidate=40" },
    });
  } catch {
    return NextResponse.json(
      { error: "MTR Bus API unavailable" },
      { status: 502 },
    );
  }
}
