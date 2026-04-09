/**
 * FavStopCard — displays a single favourite bus stop with live ETAs.
 *
 * Used on both the home page and the favourite page. Fetches ETAs from
 * the same per-route endpoints that RouteCard uses, but for just one stop.
 *
 * ETA auto-refreshes every 15 s. A heart button lets the user remove the
 * stop from favourites (calls `onRemove` so the parent can re-read localStorage).
 */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FavRouteStop, RouteEtaItem, NormalisedStop } from "@/shared/types";
import { removeFavStop } from "@/shared/util/favStops";
import BusStopModal from "./BusStopModal";
import type { SelectedStopInfo } from "@/shared/types";
import { MTR_BUS_STOP_NAMES } from "@/shared/data/MTR_BUS_STOP_NAMES";
import { useLocale } from "@/shared/context/locale-context";

const POLL_MS = 15_000;

const CO_COLOR: Record<string, string> = {
  KMB: "#D22F2F",
  CTB: "#FFF12E",
  NLB: "#009A44",
  MTRBUS: "#0061A3",
};
const CO_TEXT: Record<string, string> = {
  KMB: "#fff",
  CTB: "#1a1a1a",
  NLB: "#fff",
  MTRBUS: "#fff",
};
const CO_LABEL: Record<string, string> = {
  KMB: "KMB",
  CTB: "CTB",
  NLB: "NLB",
  MTRBUS: "MTR Bus",
};

// ── Route stop list fetcher (for prev/next navigation) ───────────

async function fetchRouteStopsForFav(stop: FavRouteStop): Promise<NormalisedStop[]> {
  if (stop.company === "KMB") {
    const res = await fetch(`/api/kmb-route?route=${stop.route}&type=${stop.dir}`);
    if (!res.ok) return [];
    const json = await res.json();
    const stopIds: string[] = (json.stops ?? []).map((s: Record<string, unknown>) => s.stop as string);
    return Promise.all(
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
  }
  if (stop.company === "CTB") {
    const mode = stop.dir === "O" ? "reverse" : "";
    const res = await fetch(`/api/ctb-route?route=${stop.route}&mode=${mode}`);
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
  if (stop.company === "NLB") {
    const res = await fetch(`/api/nlb-route?routeId=${stop.routeId}`);
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
  if (stop.company === "MTRBUS") {
    const res = await fetch(`/api/mtr-bus-route?routeName=${encodeURIComponent(stop.route)}&lang=zh`);
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.busStop || !Array.isArray(json.busStop)) return [];
    return (json.busStop as { busStopId: string }[]).map((s, i) => {
      const info = MTR_BUS_STOP_NAMES[s.busStopId];
      const dashIdx = s.busStopId.indexOf("-");
      const code = dashIdx >= 0 ? s.busStopId.slice(dashIdx + 1) : s.busStopId;
      const name = info?.zh || `站 ${i + 1} (${code})`;
      return { id: s.busStopId, name_tc: name, name_en: info?.en || name, seq: i + 1 };
    });
  }
  return [];
}

// ── ETA fetchers (mirrors RouteCard logic but for one stop) ───────

async function fetchSingleStopEtas(
  stop: FavRouteStop,
): Promise<RouteEtaItem[]> {
  const { company, route, dir, stopId, serviceType, routeId } = stop;

  if (company === "KMB") {
    const res = await fetch(
      `/api/kmb-eta?route=${route}&type=${dir}&stops=${stopId}&serviceType=${serviceType ?? "1"}`,
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.etas?.[stopId] ?? []) as RouteEtaItem[];
  }

  if (company === "CTB") {
    const res = await fetch(`/api/ctb-eta?route=${route}&stops=${stopId}`);
    if (!res.ok) return [];
    const json = await res.json();
    const raw = (json.etas?.[stopId] ?? []) as Record<string, unknown>[];
    return raw.map((x) => ({
      eta: (x.eta as string | null) ?? null,
      rmk_tc: (x.rmk_tc as string) ?? "",
      rmk_en: (x.rmk_en as string) ?? "",
      dest_tc: (x.dest_tc as string) ?? "",
      dest_en: (x.dest_en as string) ?? "",
    }));
  }

  if (company === "NLB") {
    const res = await fetch(`/api/nlb-eta?routeId=${routeId}&stops=${stopId}`);
    if (!res.ok) return [];
    const json = await res.json();
    const raw = (json.etas?.[stopId] ?? []) as Record<string, unknown>[];
    return raw.map((x) => ({
      eta: (x.estimatedArrivalTime as string) ?? null,
      rmk_tc: "",
      rmk_en: "",
      dest_tc: (x.destinationName_c as string) ?? "",
      dest_en: (x.destinationName_e as string) ?? "",
    }));
  }

  if (company === "MTRBUS") {
    const res = await fetch(
      `/api/mtr-bus-route?routeName=${encodeURIComponent(route)}&lang=zh`,
    );
    if (!res.ok) return [];
    const json = await res.json();
    // MTR Bus API returns status "0" for normal service (not "1")
    if (!json.busStop || !Array.isArray(json.busStop)) return [];
    type MtrBusStop = {
      busStopId: string;
      bus: {
        arrivalTimeInSecond: string;
        arrivalTimeText: string;
        isScheduled: string;
        isDelayed: string;
      }[];
    };
    const stopData = (json.busStop as MtrBusStop[]).find(
      (s) => s.busStopId === stopId,
    );
    if (!stopData) return [];
    return stopData.bus
      .filter((b) => {
        const secs = parseInt(b.arrivalTimeInSecond, 10);
        const text = (b.arrivalTimeText ?? "").toLowerCase();
        if (
          text.includes("arrived") ||
          text.includes("到") ||
          text.includes("正在")
        )
          return true;
        if (text.includes("departed") || text.includes("已離開")) return false;
        // Drop sentinel values ≥ 7200s (~2h) — origin/terminus placeholders e.g. 108000
        if (!Number.isNaN(secs) && secs >= 7200) return false;
        return !Number.isNaN(secs) && secs >= -30;
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

  return [];
}

// ── Mini ETA pill ─────────────────────────────────────────────────

function resolveMinutes(item: RouteEtaItem, now: number): number | null {
  if (item.etaText) {
    const lower = item.etaText.toLowerCase();
    if (
      lower.includes("arriving") ||
      lower.includes("到") ||
      lower.includes("正在")
    )
      return 0;
    if (lower.includes("departed") || lower.includes("已離開")) return null;
  }
  if (item.etaSeconds != null) return Math.floor(item.etaSeconds / 60);
  if (!item.eta) return null;
  const ms = Date.parse(item.eta) - now * 1000;
  return isNaN(ms) ? null : Math.floor(ms / 60000);
}

const EtaPill: React.FC<{
  item: RouteEtaItem;
  now: number;
  large?: boolean;
}> = ({ item, now, large = false }) => {
  const { t } = useLocale();
  const mins = resolveMinutes(item, now);
  if (mins === null) return null;

  const arriving = mins <= 0;
  const urgent = !arriving && mins <= 3;
  const warn = !urgent && mins <= 8;

  const color = arriving
    ? "#34C759"
    : urgent
      ? "#FF453A"
      : warn
        ? "#FFD60A"
        : "#0A84FF";
  const bg = arriving
    ? "rgba(52,199,89,0.18)"
    : urgent
      ? "rgba(255,69,58,0.15)"
      : warn
        ? "rgba(255,214,10,0.12)"
        : "rgba(10,132,255,0.12)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "2px",
        background: bg,
        border: `1px solid ${color}40`,
        borderRadius: "9999px",
        padding: large ? "3px 14px" : "1px 9px",
        color,
        fontWeight: large ? 800 : 600,
        fontSize: large ? "20px" : "12px",
        minWidth: large ? "52px" : "32px",
        textAlign: "center",
        lineHeight: 1.2,
        flexShrink: 0,
      }}
    >
      {arriving ? (
        <motion.span
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          {t("common.arriving")}
        </motion.span>
      ) : item.etaText && !/^\d/.test(item.etaText) ? (
        item.etaText
      ) : (
        <>
          {mins}
          <span style={{ fontSize: large ? "11px" : "9px", fontWeight: 500 }}>
            {t("common.min")}
          </span>
        </>
      )}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────

interface FavStopCardProps {
  stop: FavRouteStop;
  /** When true the heart/remove button is visible. Default: false. */
  showRemove?: boolean;
  /** Called after the stop is removed from favourites */
  onRemove: () => void;
}

const FavStopCard: React.FC<FavStopCardProps> = ({ stop, showRemove = false, onRemove }) => {
  const { t } = useLocale();
  const [etas, setEtas] = useState<RouteEtaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [modalOpen, setModalOpen] = useState(false);
  const [routeStops, setRouteStops] = useState<NormalisedStop[]>([]);
  const [currentModal, setCurrentModal] = useState<SelectedStopInfo | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopsLoadedRef = useRef(false);

  const fetchEtas = useCallback(async () => {
    try {
      const result = await fetchSingleStopEtas(stop);
      setEtas(result);
      setNow(Math.floor(Date.now() / 1000));
    } catch {
      // keep stale
    } finally {
      setLoading(false);
    }
  }, [stop]);

  useEffect(() => {
    fetchEtas();
    pollRef.current = setInterval(fetchEtas, POLL_MS);
    clockRef.current = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, [fetchEtas]);

  const color = CO_COLOR[stop.company] ?? "var(--text-primary)";
  const textColor = CO_TEXT[stop.company] ?? "var(--text-primary)";
  const label = CO_LABEL[stop.company] ?? stop.company;

  // For MTR Bus, look up real stop name from static table (overrides old "站 N (CODE)" format)
  const resolvedNameTc =
    stop.company === "MTRBUS"
      ? MTR_BUS_STOP_NAMES[stop.stopId]?.zh || stop.name_tc
      : stop.name_tc;
  const resolvedNameEn =
    stop.company === "MTRBUS"
      ? MTR_BUS_STOP_NAMES[stop.stopId]?.en || stop.name_en
      : stop.name_en;

  const validEtas = etas.filter((e) => resolveMinutes(e, now) !== null);
  const first = validEtas[0];
  const rest = validEtas.slice(1, 3);

  // Build the base SelectedStopInfo for the current fav stop
  const buildModalInfo = useCallback(
    (overrideEtas?: RouteEtaItem[]): SelectedStopInfo => ({
      stopId: stop.stopId,
      name_tc: resolvedNameTc,
      name_en: resolvedNameEn,
      lat: stop.lat,
      long: stop.long,
      etas: overrideEtas ?? etas,
      company: stop.company,
      route: stop.route,
      dest_tc: stop.dest_tc,
    }),
    [stop, resolvedNameTc, resolvedNameEn, etas],
  );

  // Open modal: set current stop info and lazy-load the route stop list
  const handleOpenModal = useCallback(async () => {
    setCurrentModal(buildModalInfo());
    setModalOpen(true);
    if (!stopsLoadedRef.current) {
      stopsLoadedRef.current = true;
      const loaded = await fetchRouteStopsForFav(stop);
      setRouteStops(loaded);
    }
  }, [buildModalInfo, stop]);

  // Navigate to an adjacent stop: update modal immediately then load its ETAs
  const handleNavigate = useCallback(
    async (info: SelectedStopInfo) => {
      setCurrentModal(info); // renders immediately with whatever etas it carries
      const newEtas = await fetchSingleStopEtas({ ...stop, stopId: info.stopId });
      setCurrentModal((prev) =>
        prev?.stopId === info.stopId ? { ...prev, etas: newEtas } : prev,
      );
    },
    [stop],
  );

  // Keep currentModal's ETAs in sync when etas poll updates the original stop
  useEffect(() => {
    if (currentModal?.stopId === stop.stopId) {
      setCurrentModal((prev) => (prev ? { ...prev, etas } : prev));
    }
  }, [etas, stop.stopId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build stop list for modal navigation bar (etas only populated for current displayed stop)
  const stopList: SelectedStopInfo[] = routeStops.map((s) => ({
    stopId: s.id,
    name_tc: s.name_tc,
    name_en: s.name_en,
    lat: s.lat,
    long: s.long,
    etas: s.id === (currentModal?.stopId ?? stop.stopId) ? (currentModal?.etas ?? []) : [],
    company: stop.company,
    route: stop.route,
    dest_tc: stop.dest_tc,
  }));

  const modalInfo: SelectedStopInfo = buildModalInfo();

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          borderRadius: "14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          padding: "12px 14px",
          marginBottom: "8px",
          cursor: "pointer",
        }}
        onClick={() => { void handleOpenModal(); }}
        whileTap={{ scale: 0.985 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Company badge */}
          <span
            style={{
              background: color,
              color: textColor,
              borderRadius: "6px",
              padding: "3px 9px",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.06em",
              flexShrink: 0,
            }}
          >
            {stop.route}
          </span>

          {/* Stop name + dest */}
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
              {resolvedNameTc}
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                marginTop: "2px",
              }}
              className="display-8"
            >
              <span
                style={{
                  background: color + "22",
                  border: `1px solid ${color}44`,
                  color,
                  borderRadius: "4px",
                  padding: "1px 5px",
                  fontSize: "10px",
                  fontWeight: 700,
                  marginRight: "5px",
                }}
              >
                {label}
              </span>
              <span className="display-8">{t("common.towards")}</span> {stop.dest_tc}
            </div>
          </div>

          {/* ETAs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "4px",
              flexShrink: 0,
            }}
          >
            {loading ? (
              <span
                style={{ fontSize: "11px", color: "var(--text-secondary)" }}
              >
                {t("common.loading")}
              </span>
            ) : validEtas.length === 0 ? (
              <span
                style={{ fontSize: "11px", color: "var(--text-secondary)" }}
              >
                {t("common.noEta")}
              </span>
            ) : (
              <>
                {first && <EtaPill item={first} now={now} large />}
                {rest.map((e, i) => (
                  <EtaPill key={i} item={e} now={now} />
                ))}
              </>
            )}
          </div>

          {/* Remove favourite — only visible in edit mode */}
          {showRemove && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                removeFavStop(stop.stopId, stop.route, stop.company);
                onRemove();
              }}
              whileTap={{ scale: 0.75 }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                flexShrink: 0,
                color: "#FF453A",
                fontSize: "16px",
                lineHeight: 1,
              }}
              aria-label={t("fav.removeStop")}
            >
              ♥
            </motion.button>
          )}
        </div>
      </motion.div>

      <BusStopModal
        info={modalOpen ? currentModal : null}
        onClose={() => {
          setModalOpen(false);
          setCurrentModal(null);
        }}
        stopList={stopList.length > 0 ? stopList : undefined}
        onNavigate={handleNavigate}
      />
    </>
  );
};

export default FavStopCard;
