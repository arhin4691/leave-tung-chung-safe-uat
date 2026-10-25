/**
 * RouteCard ??expandable card for a single bus route on the go_back page.
 *
 * API sources used:
 *   KMB stops:  /api/kmb-route?route=X&type=O|I   (kmb_eta_api_specification)
 *   CTB stops:  /api/ctb-route?route=X&mode=...   (ctb_bus_eta_api_specifications)
 *   NLB stops:  /api/nlb-route?routeId=X           (nlb_bus_eta_api)
 *   KMB ETA:    /api/kmb-eta?route=X&type=O|I&stops=...
 *   CTB ETA:    /api/ctb-eta?route=X&stops=...     (ctb_bus_eta_api_specifications)
 *   NLB ETA:    /api/nlb-eta?routeId=X&stops=...   (nlb_bus_eta_api)
 *   MTR Bus:    /api/mtr-bus-route?routeName=X     (MTR_BUS_API_Spec_v1.13)
 *               ??single POST returns both stops AND ETAs together
 */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StopEtaRow from "./StopEtaRow";
import BusStopModal from "./BusStopModal";
import type {
  BusRouteEntry,
  FavRouteStop,
  NormalisedStop,
  RouteEtaItem,
  SelectedStopInfo,
} from "@/shared/types";
import { getAllFavouriteRoutes } from "@/shared/util/favouriteLists";
import { useFavouriteLists } from "@/shared/hooks/useFavouriteLists";
import FavouriteListSelector from "@/shared/components/ui/FavouriteListSelector";
import { MTR_BUS_STOP_NAMES } from "@/shared/data/MTR_BUS_STOP_NAMES";
import { MTR_BUS_STOP_LOCATIONS } from "@/shared/data/MTR_BUS_STOP_LOCATIONS";
import { useLocale } from "@/shared/context/locale-context";
import classes from "./RouteCard.module.css";

const ETA_POLL_MS = 15_000;

const CO_PILL: Record<string, { bg: string; label: string; text: string }> = {
  KMB: { bg: "#D22F2F", label: "KMB", text: "#fff" },
  CTB: { bg: "#FFF12E", label: "CTB", text: "#1a1a1a" },
  NLB: { bg: "#009A44", label: "NLB", text: "#fff" },
  MTRBUS: { bg: "#0061A3", label: "MTR Bus", text: "#fff" },
};

interface RouteCardProps {
  entry: BusRouteEntry;
  initialStopId?: string;
}

// ?? KMB / CTB / NLB stop loading ????????????????????????????????

async function fetchStops(entry: BusRouteEntry): Promise<NormalisedStop[]> {
  if (entry.company === "KMB") {
    const res = await fetch(
      `/api/kmb-route?route=${entry.route}&type=${entry.dir}`,
    );
    if (!res.ok) return [];
    const json = await res.json();
    const stopIds: string[] = (json.stops ?? []).map(
      (s: Record<string, unknown>) => s.stop as string,
    );

    const details = await Promise.all(
      stopIds.map((id, i) =>
        fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${id}`, {
          next: { revalidate: 3600 },
        } as RequestInit)
          .then((r) => r.json())
          .then((j) => ({
            id,
            name_tc: (j.data?.name_tc as string) ?? id,
            name_en: (j.data?.name_en as string) ?? id,
            lat: j.data?.lat as string | undefined,
            long: j.data?.long as string | undefined,
            seq: i + 1,
          }))
          .catch(() => ({ id, name_tc: id, name_en: id, seq: i + 1 })),
      ),
    );
    return details;
  }

  if (entry.company === "CTB") {
    const mode = entry.dir === "O" ? "reverse" : "";
    const res = await fetch(`/api/ctb-route?route=${entry.route}&mode=${mode}`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.stops ?? []).map((s: Record<string, unknown>, i: number) => ({
      id: s.stop as string,
      name_tc: (s.name_tc as string) ?? "",
      name_en: (s.name_en as string) ?? "",
      lat: s.lat as string | undefined,
      long: s.long as string | undefined,
      seq: i + 1,
    }));
  }

  if (entry.company === "NLB") {
    const res = await fetch(`/api/nlb-route?routeId=${entry.routeId}`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.stops ?? []).map((s: Record<string, unknown>, i: number) => ({
      id: s.stopId as string,
      name_tc: (s.stopName_c as string) ?? "",
      name_en: (s.stopName_e as string) ?? "",
      lat: s.stopLatitude as string | undefined,
      long: s.stopLongitude as string | undefined,
      seq: i + 1,
    }));
  }

  return [];
}

// ?? KMB / CTB / NLB ETA loading ?????????????????????????????????

async function fetchEtas(
  entry: BusRouteEntry,
  stops: NormalisedStop[],
): Promise<Record<string, RouteEtaItem[]>> {
  if (stops.length === 0) return {};
  const ids = stops.map((s) => s.id).join(",");

  if (entry.company === "KMB") {
    const res = await fetch(
      `/api/kmb-eta?route=${entry.route}&type=${entry.dir}&stops=${ids}&serviceType=${entry.serviceType ?? "1"}`,
    );
    if (!res.ok) return {};
    const json = await res.json();
    return json.etas ?? {};
  }

  if (entry.company === "CTB") {
    const res = await fetch(`/api/ctb-eta?route=${entry.route}&stops=${ids}`);
    if (!res.ok) return {};
    const json = await res.json();
    return json.etas ?? {};
  }

  if (entry.company === "NLB") {
    const res = await fetch(
      `/api/nlb-eta?routeId=${entry.routeId}&stops=${ids}`,
    );
    if (!res.ok) return {};
    const json = await res.json();
    const raw: Record<string, Record<string, unknown>[]> = json.etas ?? {};
    const normalised: Record<string, RouteEtaItem[]> = {};
    for (const [sid, arr] of Object.entries(raw)) {
      normalised[sid] = arr.map((x) => ({
        eta: (x.estimatedArrivalTime as string) ?? null,
        rmk_tc: (x.remarks_tc as string) ?? "",
        rmk_en: (x.remarks_en as string) ?? "",
        dest_tc: (x.destinationName_c as string) ?? "",
        dest_en: (x.destinationName_e as string) ?? "",
      }));
    }
    return normalised;
  }

  return {};
}

// ?? MTR Bus: single call returns stops + ETAs together ???????????

interface MtrBusScheduleResult {
  stops: NormalisedStop[];
  etas: Record<string, RouteEtaItem[]>;
  isWorking: boolean;
}

async function fetchMtrBusSchedule(
  routeName: string,
): Promise<MtrBusScheduleResult> {
  const res = await fetch(
    `/api/mtr-bus-route?routeName=${encodeURIComponent(routeName)}&lang=zh`,
  );
  if (!res.ok) return { stops: [], etas: {}, isWorking: false };

  const json = await res.json();
  // MTR Bus API returns status "0" for normal service (not "1").
  // Determine working state from actual data instead of the status field.
  if (
    !json.busStop ||
    !Array.isArray(json.busStop) ||
    json.busStop.length === 0
  ) {
    return { stops: [], etas: {}, isWorking: false };
  }

  type MtrBusBus = {
    arrivalTimeInSecond: string;
    arrivalTimeText: string;
    isScheduled: string;
    isDelayed: string;
  };
  type MtrBusStop = {
    busStopId: string;
    isSuspended: string;
    bus: MtrBusBus[];
  };

  const busStops: MtrBusStop[] = json.busStop ?? [];

  // Look up real stop name from static MTR bus stop lookup table.
  function fmtStopName(busStopId: string, seq: number): string {
    const info = MTR_BUS_STOP_NAMES[busStopId];
    if (info?.zh) return info.zh;
    const dashIdx = busStopId.indexOf("-");
    const code = dashIdx >= 0 ? busStopId.slice(dashIdx + 1) : busStopId;
    return `站 ${seq} (${code})`;
  }

  const stops: NormalisedStop[] = busStops.map((s, i) => {
    const location = MTR_BUS_STOP_LOCATIONS[s.busStopId];
    return {
      id: s.busStopId,
      name_tc: fmtStopName(s.busStopId, i + 1),
      name_en: fmtStopName(s.busStopId, i + 1),
      lat: location?.lat.toString(),
      long: location?.lng.toString(),
      seq: i + 1,
    };
  });

  const etas: Record<string, RouteEtaItem[]> = {};
  for (const s of busStops) {
    etas[s.busStopId] = (s.bus ?? [])
      // Filter buses that have already departed or have sentinel/invalid arrival time.
      // MTR Bus uses 108000 (~30 hours) as a sentinel meaning "no arrival time" (origin stop).
      .filter((b) => {
        const secs = parseInt(b.arrivalTimeInSecond, 10);
        const text = (b.arrivalTimeText ?? "").toLowerCase();
        // Keep explicit arriving/about-to-arrive signals
        if (
          text.includes("arriving") ||
          text.includes("到") ||
          text.includes("正在")
        )
          return true;
        // Drop already-departed buses
        if (text.includes("departed") || text.includes("已離開")) return false;
        // Drop sentinel values ≥ 7200s (2 h) — origin stop placeholders e.g. 108000
        if (!Number.isNaN(secs) && secs >= 7200) return false;
        return !Number.isNaN(secs) && secs >= -30; // keep up to 30s past departure
      })
      .map((b) => {
        const parsed = parseInt(b.arrivalTimeInSecond, 10);
        return {
          eta: null,
          etaSeconds: Number.isNaN(parsed) ? null : parsed,
          etaText: b.arrivalTimeText ?? undefined,
          rmk_tc: b.isDelayed === "1" ? "延誤" : "",
          rmk_en: b.isDelayed === "1" ? "Delayed" : "",
          dest_tc: "",
          dest_en: "",
          isScheduled: b.isScheduled === "1",
        };
      });
  }

  const isWorking =
    busStops.length > 0 && busStops.some((s) => s.isSuspended !== "1");

  return { stops, etas, isWorking };
}

// ?? Component ?????????????????????????????????????????????????????

const RouteCard: React.FC<RouteCardProps> = ({ entry, initialStopId }) => {
  const { t } = useLocale();
  const { lists: favouriteLists, createList, addRoute } = useFavouriteLists();
  const [open, setOpen] = useState(false);
  const [stops, setStops] = useState<NormalisedStop[]>([]);
  const [etas, setEtas] = useState<Record<string, RouteEtaItem[]>>({});
  const [loadingStops, setLoadingStops] = useState(false);
  const [loadingEta, setLoadingEta] = useState(false);
  const [isWorking, setIsWorking] = useState<boolean | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [selectedStop, setSelectedStop] = useState<SelectedStopInfo | null>(
    null,
  );
  const [favKeys, setFavKeys] = useState<Set<string>>(new Set());
  const [routeForFavourite, setRouteForFavourite] =
    useState<FavRouteStop | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopsLoaded = useRef(false);
  const handledInitialStop = useRef<string | null>(null);

  useEffect(() => {
    setFavKeys(
      new Set(
        getAllFavouriteRoutes().map(
          (stop) => `${stop.stopId}|${stop.route}|${stop.company}`,
        ),
      ),
    );
  }, []);

  // Live clock ??ticks every second
  useEffect(() => {
    clockRef.current = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, []);

  // Load stops when first opened
  const loadStops = useCallback(async () => {
    if (stopsLoaded.current) return;
    setLoadingStops(true);
    try {
      if (entry.company === "MTRBUS") {
        // Single call gives both stops and initial ETAs
        const result = await fetchMtrBusSchedule(entry.route);
        setStops(result.stops);
        setEtas(result.etas);
        setIsWorking(result.isWorking);
        // Only mark as loaded if we actually got stops — allows retry on transient failure
        if (result.stops.length > 0) stopsLoaded.current = true;
      } else {
        const loaded = await fetchStops(entry);
        setStops(loaded);
        if (loaded.length > 0) {
          setIsWorking(true);
          stopsLoaded.current = true;
        } else {
          // Empty result could be a transient API failure — allow retry on next open
          setIsWorking(false);
        }
      }
    } catch {
      // stopsLoaded stays false → user can retry by closing and re-opening the card
      setIsWorking(false);
    } finally {
      setLoadingStops(false);
    }
  }, [entry]);

  // Poll ETAs while open
  const pollEtas = useCallback(async () => {
    if (stops.length === 0) return;
    setLoadingEta(true);
    try {
      if (entry.company === "MTRBUS") {
        const result = await fetchMtrBusSchedule(entry.route);
        setEtas(result.etas);
        setIsWorking(result.isWorking);
      } else {
        const fresh = await fetchEtas(entry, stops);
        setEtas(fresh);
      }
      setNow(Math.floor(Date.now() / 1000));
    } finally {
      setLoadingEta(false);
    }
  }, [entry, stops]);

  useEffect(() => {
    if (open) {
      loadStops();
    }
  }, [open, loadStops]);

  useEffect(() => {
    if (initialStopId) setOpen(true);
  }, [initialStopId]);

  useEffect(() => {
    if (!initialStopId || handledInitialStop.current === initialStopId) return;
    const stop = stops.find((item) => item.id === initialStopId);
    if (!stop) return;

    setSelectedStop({
      stopId: stop.id,
      name_tc: stop.name_tc,
      name_en: stop.name_en,
      lat: stop.lat,
      long: stop.long,
      etas: etas[stop.id] ?? [],
      company: entry.company,
      route: entry.route,
      dest_tc: entry.dest_tc,
    });
    handledInitialStop.current = initialStopId;
  }, [entry, etas, initialStopId, stops]);

  useEffect(() => {
    const stopId = selectedStop?.stopId;
    if (!stopId) return;
    const latestEtas = etas[stopId];
    if (!latestEtas) return;

    setSelectedStop((current) =>
      current && current.stopId === stopId && current.etas !== latestEtas
        ? { ...current, etas: latestEtas }
        : current,
    );
  }, [etas, selectedStop?.stopId]);

  useEffect(() => {
    if (open && stops.length > 0) {
      // For MTRBUS, initial etas already set in loadStops; still poll on interval
      if (entry.company !== "MTRBUS") {
        pollEtas();
      }
      intervalRef.current = setInterval(pollEtas, ETA_POLL_MS);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, stops.length, pollEtas, entry.company]);

  const pill = CO_PILL[entry.company] ?? {
    bg: "#555",
    label: entry.company,
    text: "#fff",
  };

  return (
    <>
      <motion.div
        layout
        className={classes.card}
      >
        {/* ?? Header / collapse toggle ??????????????? */}
        <motion.div
          whileTap={{ scale: 0.99 }}
          onClick={() => setOpen((p) => !p)}
          style={{
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            userSelect: "none",
            borderBottom: open ? "1px solid rgba(255,255,255,0.07)" : "none",
          }}
        >
          {/* Company pill */}
          <span
            style={{
              background: pill.bg,
              color: pill.text,
              borderRadius: "6px",
              padding: "3px 9px",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.06em",
              flexShrink: 0,
            }}
          >
            {entry.route}
          </span>

          {/* Route info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              className="display-7"
            >
              <span className="display-8">{t("common.towards")}</span> {entry.dest_tc}
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              className="display-8"
            >
              {entry.orig_tc} → {entry.dest_tc}
            </div>
          </div>

          {/* Company badge + status */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "4px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                background: pill.bg + "22",
                border: `1px solid ${pill.bg}55`,
                color: pill.bg,
                borderRadius: "9999px",
                padding: "2px 8px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {pill.label}
            </span>
            {isWorking !== null && (
              <span
                style={{
                  fontSize: "10px",
                  //   fontWeight: 600,
                  color: isWorking ? "#34C759" : "#FF453A",
                }}
              >
                {isWorking ? t("common.inService") : t("common.noService")}
              </span>
            )}
          </div>

          {/* Chevron */}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              color: "var(--text-secondary)",
              fontSize: "12px",
              flexShrink: 0,
            }}
          >
            ▼
          </motion.span>
        </motion.div>

        {/* ?? Expanded stop list ???????????????????? */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="stops"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "10px 12px 14px" }}>
                {/* ETA refresh indicator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t("bus.stopColHeader")}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    {loadingEta ? t("common.updating") : t("bus.etaColHeader")}
                  </span>
                </div>

                {/* Loading stops */}
                {loadingStops && (
                  <div style={{ padding: "20px 0", textAlign: "center" }}>
                    <LoadingDots />
                  </div>
                )}

                {/* Empty state */}
                {!loadingStops && stops.length === 0 && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                      fontSize: "13px",
                    }}
                  >
                    {t("bus.noStopData")}
                  </div>
                )}

                {/* Stop rows */}
                {stops.map((stop) => {
                  const favKey = `${stop.id}|${entry.route}|${entry.company}`;
                  return (
                    <StopEtaRow
                      key={stop.id}
                      seq={stop.seq}
                      stopId={stop.id}
                      name_tc={stop.name_tc}
                      name_en={stop.name_en}
                      lat={stop.lat}
                      long={stop.long}
                      etas={etas[stop.id] ?? []}
                      now={now}
                      company={entry.company}
                      route={entry.route}
                      dest_tc={entry.dest_tc}
                      onSelectStop={setSelectedStop}
                      isFav={favKeys.has(favKey)}
                      onToggleFav={() => {
                        setRouteForFavourite({
                          stopId: stop.id,
                          name_tc: stop.name_tc,
                          name_en: stop.name_en,
                          lat: stop.lat,
                          long: stop.long,
                          company: entry.company,
                          route: entry.route,
                          dir: entry.dir,
                          dest_tc: entry.dest_tc,
                          serviceType: entry.serviceType,
                          routeId: entry.routeId,
                        });
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ?? Stop detail modal ???????????????????????? */}
      <BusStopModal
        info={selectedStop}
        etaLoading={loadingEta}
        onClose={() => setSelectedStop(null)}
        stopList={stops.map((stop) => ({
          stopId: stop.id,
          name_tc: stop.name_tc,
          name_en: stop.name_en,
          lat: stop.lat,
          long: stop.long,
          etas: etas[stop.id] ?? [],
          company: entry.company,
          route: entry.route,
          dest_tc: entry.dest_tc,
        }))}
        onNavigate={setSelectedStop}
        routeDirection={entry.dir}
        routeId={entry.routeId}
        serviceType={entry.serviceType}
      />
      <FavouriteListSelector
        open={routeForFavourite !== null}
        lists={favouriteLists}
        route={routeForFavourite}
        onClose={() => setRouteForFavourite(null)}
        onCreate={createList}
        onAdd={(listId, route) => {
          addRoute(listId, route);
          setFavKeys((previous) => {
            const next = new Set(previous);
            next.add(`${route.stopId}|${route.route}|${route.company}`);
            return next;
          });
        }}
      />
    </>
  );
};

/** Simple 3-dot bounce loader */
const LoadingDots: React.FC = () => (
  <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "var(--text-secondary)",
          display: "inline-block",
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{
          repeat: Infinity,
          duration: 0.9,
          delay: i * 0.18,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export default RouteCard;
