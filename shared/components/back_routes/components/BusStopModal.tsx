/**
 * BusStopModal — bottom-sheet detail panel for a single bus stop.
 *
 * Appears when a user taps a stop row inside a RouteCard.
 * Renders up to 3 ETA slots with large first-bus emphasis, company badge,
 * map deep-link, and close button.
 *
 * Supports KMB/CTB/NLB (ISO timestamp ETAs) and MTR Bus (seconds-delta /
 * display-text ETAs from MTR_BUS_API_Spec_v1.13).
 */
"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { SelectedStopInfo, RouteEtaItem, StopEtaRow } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";
import type { TranslationKey } from "@/shared/i18n/translations";

// ── Company branding ──────────────────────────────────────────────
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
const CO_LABEL_KEY: Record<string, TranslationKey> = {
  KMB: "company.KMB",
  CTB: "company.CTB",
  NLB: "company.NLB",
  MTRBUS: "company.MTRBUS",
};

// ── ETA helpers ───────────────────────────────────────────────────

function minsFromIso(etaStr: string | null, nowSec: number): number | null {
  if (!etaStr) return null;
  const ms = Date.parse(etaStr) - nowSec * 1000;
  if (isNaN(ms)) return null;
  return Math.floor(ms / 60000);
}

function minsFromSeconds(sec: number | null | undefined): number | null {
  if (sec == null) return null;
  return Math.floor(sec / 60);
}

interface EtaSlotProps {
  item: RouteEtaItem;
  nowSec: number;
  isFirst: boolean;
}

const EtaSlot: React.FC<EtaSlotProps> = memo(({ item, nowSec, isFirst }) => {
  const { t } = useLocale();
  // MTR Bus: use etaText + etaSeconds
  // KMB/CTB/NLB: compute from ISO timestamp
  let mins: number | null = null;
  let displayText: string | null = null;

  if (item.etaText) {
    // MTR Bus display text
    displayText = item.etaText;
    if (item.etaSeconds != null) {
      mins = minsFromSeconds(item.etaSeconds);
    }
  } else if (item.eta) {
    mins = minsFromIso(item.eta, nowSec);
  }

  const hasArrived = mins !== null && mins <= 0;
  const isUrgent = mins !== null && mins > 0 && mins <= 3;
  const isWarn = mins !== null && mins > 3 && mins <= 8;

  const accentColor = hasArrived
    ? "#34C759"
    : isUrgent
      ? "#FF453A"
      : isWarn
        ? "#FFD60A"
        : "#0A84FF";

  const rmk = item.rmk_tc || item.rmk_en;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: isFirst ? "16px 18px" : "10px 18px",
        background: isFirst
          ? `${accentColor}12`
          : "rgba(255,255,255,0.03)",
        borderRadius: "14px",
        border: `1px solid ${isFirst ? accentColor + "30" : "rgba(255,255,255,0.07)"}`,
        marginBottom: "8px",
      }}
    >
      {/* Sequence dot */}
      <div
        style={{
          width: isFirst ? "36px" : "26px",
          height: isFirst ? "36px" : "26px",
          borderRadius: "50%",
          background: `${accentColor}22`,
          border: `1.5px solid ${accentColor}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: accentColor,
          fontWeight: 800,
          fontSize: isFirst ? "14px" : "10px",
        }}
      >
        {isFirst ? "🚌" : "▸"}
      </div>

      {/* ETA value */}
      <div style={{ flex: 1 }}>
        {displayText ? (
          <div
            style={{
              fontSize: isFirst ? "20px" : "14px",
              fontWeight: isFirst ? 800 : 600,
              color: accentColor,
              lineHeight: 1.1,
            }}
          >
            {displayText}
          </div>
        ) : mins === null ? (
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
            --
          </div>
        ) : hasArrived ? (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{
              fontSize: isFirst ? "22px" : "15px",
              fontWeight: 800,
              color: "#34C759",
            }}
          >
            {t("common.arriving")}
          </motion.div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "3px",
            }}
          >
            <span
              style={{
                fontSize: isFirst ? "36px" : "20px",
                fontWeight: 800,
                color: accentColor,
                lineHeight: 1,
              }}
            >
              {mins}
            </span>
            <span
              style={{
                fontSize: isFirst ? "14px" : "11px",
                fontWeight: 500,
                color: accentColor,
                opacity: 0.8,
              }}
            >
              {t("common.minutes")}
            </span>
          </div>
        )}
        {rmk && (
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "2px",
              fontStyle: "italic",
            }}
          >
            {rmk}
          </div>
        )}
      </div>

      {/* Scheduled badge */}
      {item.isScheduled !== undefined && (
        <span
          style={{
            fontSize: "9px",
            fontWeight: 600,
            color: item.isScheduled
              ? "rgba(255,255,255,0.3)"
              : "rgba(52,199,89,0.7)",
            background: item.isScheduled
              ? "rgba(255,255,255,0.06)"
              : "rgba(52,199,89,0.1)",
            border: `1px solid ${item.isScheduled ? "rgba(255,255,255,0.1)" : "rgba(52,199,89,0.25)"}`,
            borderRadius: "6px",
            padding: "2px 6px",
            flexShrink: 0,
          }}
        >
          {item.isScheduled ? t("bus.timetable") : t("bus.realtime")}
        </span>
      )}
    </div>
  );
}) as React.FC<EtaSlotProps>;

// ── Main modal ────────────────────────────────────────────────────

interface BusStopModalProps {
  info: SelectedStopInfo | null;
  onClose: () => void;
  /** Full ordered stop list for the route — enables ‹ / › navigation */
  stopList?: SelectedStopInfo[];
  /** Called when the user taps a navigation arrow */
  onNavigate?: (info: SelectedStopInfo) => void;
}

const BusStopModalContent: React.FC<BusStopModalProps> = ({ info, onClose, stopList, onNavigate }) => {
  const { t } = useLocale();
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  const [otherRoutes, setOtherRoutes] = useState<StopEtaRow[]>([]);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Reset scroll to top whenever the displayed stop changes
  useEffect(() => {
    if (sheetRef.current) sheetRef.current.scrollTop = 0;
  }, [info?.stopId]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch other routes at the same stop.
  //
  // Layer 1 — same stop ID registry:
  //   KMB and CTB share the same stop IDs, so querying both always works
  //   regardless of which company the current stop belongs to.
  //
  // Layer 2 — NLB (own numeric IDs):
  //   When viewing an NLB stop, also query the NLB stop-all-eta endpoint.
  //
  // Layer 3 — proximity cross-operator lookup (requires lat/long):
  //   /api/nearby-stops returns KMB stop IDs and MTR Bus stop IDs within
  //   ~80 m of the current stop coordinates.  This finds:
  //     • KMB/CTB routes when viewing an NLB or MTR Bus stop
  //     • MTR Bus routes when viewing any stop with coordinates
  //   KMB stop IDs discovered this way ARE the same IDs used for CTB queries.
  useEffect(() => {
    if (!info) return;
    setOtherRoutes([]);
    let cancelled = false;
    const stopId = info.stopId;
    const isNlb = info.company === "NLB";
    const hasCoords = !!info.lat && !!info.long;

    async function load() {
      try {
        // ── Layer 1+2: same-ID-registry queries ──────────────────
        const sameIdFetches: Promise<StopEtaRow[]>[] = [
          // KMB stop-all-eta
          fetch(`/api/stop-all-eta?stopId=${encodeURIComponent(stopId)}&company=kmb`)
            .then((r) => (r.ok ? r.json() : { rows: [] }))
            .then((j) => (j.rows ?? []) as StopEtaRow[])
            .catch(() => []),
          // CTB stop-all-eta (same stop IDs as KMB)
          fetch(`/api/stop-all-eta?stopId=${encodeURIComponent(stopId)}&company=ctb`)
            .then((r) => (r.ok ? r.json() : { rows: [] }))
            .then((j) => (j.rows ?? []) as StopEtaRow[])
            .catch(() => []),
        ];
        if (isNlb) {
          sameIdFetches.push(
            fetch(`/api/stop-all-eta?stopId=${encodeURIComponent(stopId)}&company=nlb`)
              .then((r) => (r.ok ? r.json() : { rows: [] }))
              .then((j) => (j.rows ?? []) as StopEtaRow[])
              .catch(() => []),
          );
        }

        // ── Layer 3: proximity lookup ──────────────────────────────
        // Fetch in parallel with Layer 1+2
        type NearbyStop = { stopId: string; company: "KMB" | "MTRBUS"; name_tc: string };
        const nearbyFetch: Promise<NearbyStop[]> = hasCoords
          ? fetch(
              `/api/nearby-stops?lat=${info.lat}&lng=${info.long}&excludeStopId=${encodeURIComponent(stopId)}`,
            )
              .then((r) => (r.ok ? r.json() : { stops: [] }))
              .then((j) => (j.stops ?? []) as NearbyStop[])
              .catch(() => [])
          : Promise.resolve([]);

        const [sameIdRows, nearbyStops] = await Promise.all([
          Promise.all(sameIdFetches).then((r) => r.flat()),
          nearbyFetch,
        ]);

        if (cancelled) return;

        // Deduplicate nearby stops by stopId+company; then fetch their ETAs
        const nearbyKmbIds = [
          ...new Set(
            nearbyStops.filter((s) => s.company === "KMB").map((s) => s.stopId),
          ),
        ];
        const nearbyMtrIds = [
          ...new Set(
            nearbyStops.filter((s) => s.company === "MTRBUS").map((s) => s.stopId),
          ),
        ];

        // KMB stops found nearby → also valid for CTB (shared registry)
        const nearbyKmbCtbFetches: Promise<StopEtaRow[]>[] = nearbyKmbIds.flatMap((sid) =>
          ["kmb", "ctb"].map((co) =>
            fetch(`/api/stop-all-eta?stopId=${encodeURIComponent(sid)}&company=${co}`)
              .then((r) => (r.ok ? r.json() : { rows: [] }))
              .then((j) => (j.rows ?? []) as StopEtaRow[])
              .catch(() => []),
          ),
        );

        // MTR Bus nearby stops — query their ETAs via mtr-bus-route
        // Group by routeName so we only fetch each route once
        const { MTR_BUS_ROUTES_BY_STOP } = await import("@/shared/data/MTR_BUS_ROUTES_BY_STOP");
        const mtrRouteNames = [
          ...new Set(nearbyMtrIds.flatMap((sid) => MTR_BUS_ROUTES_BY_STOP[sid] ?? [])),
        ];
        const mtrFetches: Promise<StopEtaRow[]>[] = mtrRouteNames.map((routeName) =>
          fetch(`/api/mtr-bus-route?routeName=${encodeURIComponent(routeName)}&lang=zh`)
            .then((r) => (r.ok ? r.json() : {}))
            .then((json: Record<string, unknown>) => {
              if (!json.busStop || !Array.isArray(json.busStop)) return [];
              type MtrStop = {
                busStopId: string;
                bus: { arrivalTimeInSecond: string; arrivalTimeText: string; isDelayed: string }[];
              };
              // Only include stops that are in our nearby list
              const nearbyIdSet = new Set(nearbyMtrIds);
              const rows: StopEtaRow[] = [];
              for (const s of json.busStop as MtrStop[]) {
                if (!nearbyIdSet.has(s.busStopId)) continue;
                const nearbyInfo = nearbyStops.find((n) => n.stopId === s.busStopId);
                const firstBus = (s.bus ?? []).find((b) => {
                  const secs = parseInt(b.arrivalTimeInSecond, 10);
                  const text = (b.arrivalTimeText ?? "").toLowerCase();
                  if (text.includes("departed") || text.includes("已離開")) return false;
                  if (!Number.isNaN(secs) && secs >= 7200) return false;
                  return !Number.isNaN(secs) && secs >= -30;
                });
                if (!firstBus) continue;
                rows.push({
                  route: routeName,
                  co: "MTRBUS",
                  dir: "O",
                  dest_tc: nearbyInfo?.name_tc ?? routeName,
                  dest_en: routeName,
                  etas: [
                    {
                      // MTR Bus doesn't use ISO timestamps — encode seconds as a synthetic timestamp
                      eta: null,
                      eta_seq: 1,
                      rmk_tc: firstBus.isDelayed === "1" ? "延誤" : "",
                      rmk_en: firstBus.isDelayed === "1" ? "Delayed" : "",
                    },
                  ],
                });
              }
              return rows;
            })
            .catch(() => []),
        );

        const [nearbyKmbCtbRows, mtrRows] = await Promise.all([
          Promise.all(nearbyKmbCtbFetches).then((r) => r.flat()),
          Promise.all(mtrFetches).then((r) => r.flat()),
        ]);

        if (cancelled) return;

        // Merge all rows and deduplicate
        const allRows = [...sameIdRows, ...nearbyKmbCtbRows, ...mtrRows];
        const seen = new Set<string>();
        const filtered = allRows.filter((row) => {
          const key = `${row.co.toUpperCase()}|${row.route}|${row.dir}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return !(row.co.toUpperCase() === info!.company && row.route === info!.route);
        });
        setOtherRoutes(filtered);
      } catch {
        // ignore
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [info?.stopId, info?.company, info?.route, info?.lat, info?.long]);

  if (!info) return null;

  const validEtas = info.etas.filter(
    (e) => e.eta || e.etaSeconds != null || e.etaText,
  );
  const color = CO_COLOR[info.company] ?? "#555";
  const labelKey = CO_LABEL_KEY[info.company];
  const label = labelKey ? t(labelKey) : info.company;

  const mapUrl =
    info.lat && info.long
      ? `https://maps.google.com/maps?q=${info.lat},${info.long}`
      : null;

  // Single motion root → AnimatePresence tracks exactly one child, no "multiple children" warning.
  // Scrim is a plain div (no motion exit needed — it fades with the parent).
  // Sheet uses its own enter slide but no exit prop, so only the root opacity exit fires.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Scrim — plain div, no motion (parent handles exit) */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Sheet — slides in on open; disappears with parent fade-out on close */}
      <motion.div
        ref={sheetRef}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(14,18,30,0.97)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px 24px 0 0",
          maxHeight: "60vh",
          minHeight: "60vh",
          overflowY: "auto",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          willChange: "transform",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: "40px",
            height: "4px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.18)",
            margin: "12px auto 0",
          }}
        />

        <div style={{ padding: "16px 20px 24px" }}>
          {/* ── Stop header ─────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            {/* Company colour bar */}
            <div
              style={{
                width: "4px",
                minHeight: "48px",
                borderRadius: "9999px",
                background: color,
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: color,
                  marginBottom: "3px",
                  textTransform: "uppercase",
                }}
              >
                {label} &nbsp;·&nbsp; {info.route}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.93)",
                  lineHeight: 1.2,
                }}
              >
                {info.name_tc}
              </div>
              {info.name_en && info.name_en !== info.stopId && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.38)",
                    marginTop: "3px",
                  }}
                >
                  {info.name_en}
                </div>
              )}
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.25)",
                  marginTop: "4px",
                }}
              >
                {t("common.towards")} {info.dest_tc} &nbsp;·&nbsp; ID: {info.stopId}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                fontSize: "16px",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* ── Stop navigation ──────────────────────── */}
          {stopList && stopList.length > 1 && (() => {
            const currentIndex = stopList.findIndex((s) => s.stopId === info.stopId);
            const hasPrev = currentIndex > 0;
            const hasNext = currentIndex < stopList.length - 1;
            const navBtnStyle = (active: boolean): React.CSSProperties => ({
              background: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: "10px",
              width: "44px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: active ? "pointer" : "default",
              color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
              fontSize: "20px",
              flexShrink: 0,
              padding: 0,
            });
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  gap: "8px",
                }}
              >
                <button
                  style={navBtnStyle(hasPrev)}
                  onClick={() => hasPrev && onNavigate?.(stopList[currentIndex - 1])}
                  aria-label="Previous stop"
                >
                  ‹
                </button>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>
                    {currentIndex + 1} / {stopList.length}
                  </div>
                  {hasPrev && (
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      ← {stopList[currentIndex - 1].name_tc}
                    </div>
                  )}
                  {hasNext && (
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: hasPrev ? "0" : "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {stopList[currentIndex + 1].name_tc} →
                    </div>
                  )}
                </div>
                <button
                  style={navBtnStyle(hasNext)}
                  onClick={() => hasNext && onNavigate?.(stopList[currentIndex + 1])}
                  aria-label="Next stop"
                >
                  ›
                </button>
              </div>
            );
          })()}

          {/* ── ETA section ─────────────────────────── */}
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            {t("bus.etaSectionTitle")}
          </div>

          {validEtas.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "28px 0",
                color: "rgba(255,255,255,0.3)",
                fontSize: "14px",
              }}
            >
              {t("bus.noEtaData")}
            </div>
          ) : (
            validEtas.slice(0, 3).map((item, i) => (
              <EtaSlot key={i} item={item} nowSec={nowSec} isFirst={i === 0} />
            ))
          )}

          {/* ── Map button ──────────────────────────── */}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "16px",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(10,132,255,0.1)",
                border: "1px solid rgba(10,132,255,0.25)",
                color: "#0A84FF",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              📍 {t("bus.viewOnMap")}
            </a>
          )}

          {/* ── Other routes at this stop ────────── */}
          {otherRoutes.length > 0 && (
            <div style={{ marginTop: "22px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                }}
              >
                {t("bus.otherRoutesTitle")}
              </div>
              {otherRoutes.map((row, idx) => {
                const coColor = CO_COLOR[row.co.toUpperCase()] ?? "#555";
                const coText = CO_TEXT[row.co.toUpperCase()] ?? "#fff";
                const isMtrBus = row.co.toUpperCase() === "MTRBUS";
                const firstEta = row.etas.find((e) => e.eta);
                let etaMins: number | null = null;
                if (firstEta?.eta) {
                  const ms = Date.parse(firstEta.eta) - nowSec * 1000;
                  if (!isNaN(ms)) etaMins = Math.floor(ms / 60000);
                }
                const arrived = etaMins !== null && etaMins <= 0;
                const etaColor =
                  arrived
                    ? "#34C759"
                    : etaMins !== null
                      ? etaMins <= 3
                        ? "#FF453A"
                        : etaMins <= 8
                          ? "#FFD60A"
                          : "#0A84FF"
                      : "rgba(255,255,255,0.3)";
                return (
                  <div
                    key={`${row.co}|${row.route}|${row.dir}|${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 12px",
                      borderRadius: "11px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      marginBottom: "7px",
                    }}
                  >
                    {/* Route badge */}
                    <span
                      style={{
                        background: coColor,
                        color: coText,
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontSize: "12px",
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                        minWidth: "38px",
                        textAlign: "center",
                      }}
                    >
                      {row.route}
                    </span>
                    {/* Destination */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.82)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t("common.towards")} {row.dest_tc}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.3)",
                          marginTop: "1px",
                        }}
                      >
                        {row.co.toUpperCase()}
                      </div>
                    </div>
                    {/* Next ETA — MTR Bus proximity rows have no ISO timestamps */}
                    {isMtrBus ? (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: coColor,
                          background: `${coColor}18`,
                          border: `1px solid ${coColor}40`,
                          borderRadius: "6px",
                          padding: "2px 7px",
                          flexShrink: 0,
                        }}
                      >
                        {t("bus.nearby")}
                      </span>
                    ) : etaMins === null ? (
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>--</span>
                    ) : arrived ? (
                      <span style={{ fontSize: "13px", fontWeight: 800, color: etaColor }}>{t("common.arriving")}</span>
                    ) : (
                      <span style={{ fontSize: "14px", fontWeight: 800, color: etaColor, flexShrink: 0 }}>
                        {etaMins}
                        <span style={{ fontSize: "10px", fontWeight: 500 }}> {t("common.min")}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const BusStopModal: React.FC<BusStopModalProps> = ({ info, onClose, stopList, onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const el =
    typeof document !== "undefined"
      ? document.getElementById("modal-hook")
      : null;
  if (!el) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {info && (
        <BusStopModalContent
          key="content"
          info={info}
          onClose={onClose}
          stopList={stopList}
          onNavigate={onNavigate}
        />
      )}
    </AnimatePresence>,
    el,
  );
};

export default BusStopModal;
