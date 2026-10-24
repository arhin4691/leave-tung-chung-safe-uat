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
import { useRouter } from "next/navigation";
import type { SelectedStopInfo, RouteEtaItem, StopEtaRow } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";
import type { TranslationKey } from "@/shared/i18n/translations";
import StopMap from "@/shared/components/ui/StopMap";
import classes from "./BusStopModal.module.css";

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

interface NearbyRoute {
  route: string;
  company: "KMB" | "CTB" | "NLB" | "MTRBUS";
  dir: "I" | "O";
  dest_tc: string;
  dest_en: string;
  routeId?: string;
  serviceType?: string;
}

interface NearbyStop {
  stopId: string;
  company: "KMB" | "CTB" | "NLB" | "MTRBUS";
  lat: number;
  lng: number;
  name_tc: string;
  name_en: string;
  routes: NearbyRoute[];
}

type OtherRoute = StopEtaRow & {
  stopId: string;
  lat?: string;
  long?: string;
  serviceType?: string;
};

const BusStopModalContent: React.FC<BusStopModalProps> = ({ info, onClose, stopList, onNavigate }) => {
  const { t } = useLocale();
  const router = useRouter();
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  const [otherRoutes, setOtherRoutes] = useState<OtherRoute[]>([]);
  const [nearbyError, setNearbyError] = useState(false);
  const slidesRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  // Reset the pager and each panel's vertical scroll whenever the stop changes.
  useEffect(() => {
    setActiveSection(0);
    if (!slidesRef.current) return;
    slidesRef.current.scrollLeft = 0;
    slidesRef.current
      .querySelectorAll<HTMLElement>("[data-stop-slide]")
      .forEach((slide) => {
        slide.scrollTop = 0;
      });
  }, [info?.stopId]);

  useEffect(() => {
    const track = slidesRef.current;
    if (!track) return;

    let touchStart: { x: number; y: number; scrollLeft: number } | null = null;
    let isHorizontalSwipe = false;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        touchStart = null;
        isHorizontalSwipe = false;
        return;
      }

      const touch = event.touches[0];
      touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        scrollLeft: track.scrollLeft,
      };
      isHorizontalSwipe = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStart || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      if (
        !isHorizontalSwipe &&
        Math.abs(deltaX) > 10 &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        isHorizontalSwipe = true;
      }
      if (!isHorizontalSwipe) return;

      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
      track.scrollLeft = touchStart.scrollLeft - deltaX;
    };

    const finishTouch = () => {
      if (isHorizontalSwipe && track.clientWidth > 0) {
        const index = Math.max(
          0,
          Math.min(
            2,
            Math.round(track.scrollLeft / track.clientWidth),
          ),
        );
        setActiveSection(index);
        track.scrollTo({
          left: index * track.clientWidth,
          behavior: "smooth",
        });
      }
      touchStart = null;
      isHorizontalSwipe = false;
    };

    track.addEventListener("touchstart", handleTouchStart, {
      capture: true,
      passive: true,
    });
    track.addEventListener("touchmove", handleTouchMove, {
      capture: true,
      passive: false,
    });
    track.addEventListener("touchend", finishTouch, {
      capture: true,
      passive: true,
    });
    track.addEventListener("touchcancel", finishTouch, {
      capture: true,
      passive: true,
    });

    return () => {
      track.removeEventListener("touchstart", handleTouchStart, true);
      track.removeEventListener("touchmove", handleTouchMove, true);
      track.removeEventListener("touchend", finishTouch, true);
      track.removeEventListener("touchcancel", finishTouch, true);
    };
  }, []);

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

  // Use the daily cross-operator stop map to find routes even when operators
  // assign different IDs to the same physical stop.
  useEffect(() => {
    if (!info) return;
    setOtherRoutes([]);
    setNearbyError(false);
    let cancelled = false;

    async function load() {
      try {
        const company = info.company.toLowerCase();
        const directRowsPromise: Promise<OtherRoute[]> =
          company === "mtrbus"
            ? Promise.resolve([])
            : fetch(
                `/api/stop-all-eta?stopId=${encodeURIComponent(info.stopId)}&company=${company}`,
              )
                .then((response) =>
                  response.ok ? response.json() : { rows: [] },
                )
                .then((json) =>
                  ((json.rows ?? []) as StopEtaRow[]).map((row) => ({
                    ...row,
                    stopId: info.stopId,
                    lat: info.lat,
                    long: info.long,
                  })),
                )
                .catch(() => []);

        const hasCoords = info.lat !== undefined && info.long !== undefined;
        let nearbyStops: NearbyStop[] = [];
        if (hasCoords) {
          const params = new URLSearchParams({
            lat: info.lat!,
            lng: info.long!,
            excludeStopId: info.stopId,
            excludeCompany: info.company,
          });
          const response = await fetch(`/api/nearby-stops?${params}`);
          if (!response.ok) {
            throw new Error(`Nearby-stop lookup returned ${response.status}`);
          }
          const json = (await response.json()) as { stops?: NearbyStop[] };
          nearbyStops = json.stops ?? [];
        }

        const [sameIdRows, nearbyRows] = await Promise.all([
          directRowsPromise,
          Promise.all(
            nearbyStops.map(async (stop) => {
              let liveRows: StopEtaRow[] = [];
              if (stop.company !== "MTRBUS") {
                const operator = stop.company.toLowerCase();
                const routeIds = stop.routes
                  .map((route) => route.routeId)
                  .filter((routeId): routeId is string => !!routeId);
                const params = new URLSearchParams({
                  stopId: stop.stopId,
                  company: operator,
                });
                if (operator === "nlb" && routeIds.length > 0) {
                  params.set("routeIds", [...new Set(routeIds)].join(","));
                }
                const response = await fetch(`/api/stop-all-eta?${params}`);
                if (response.ok) {
                  const json = (await response.json()) as {
                    rows?: StopEtaRow[];
                  };
                  liveRows = json.rows ?? [];
                }
              }

              return stop.routes.map((route) => {
                const live = liveRows.find(
                  (row) =>
                    row.co.toUpperCase() === route.company &&
                    row.route === route.route &&
                    row.dir === route.dir,
                );
                return {
                  route: route.route,
                  co: route.company,
                  dir: route.dir,
                  dest_tc: route.dest_tc || live?.dest_tc || "",
                  dest_en: route.dest_en || live?.dest_en || "",
                  etas: live?.etas ?? [],
                  stopId: stop.stopId,
                  lat: String(stop.lat),
                  long: String(stop.lng),
                  routeId: route.routeId ?? live?.routeId,
                  serviceType: route.serviceType ?? live?.serviceType,
                };
              });
            }),
          ).then((rows) => rows.flat()),
        ]);

        if (cancelled) return;

        const deduplicated = new Map<string, OtherRoute>();
        for (const row of [...sameIdRows, ...nearbyRows]) {
          const key = `${row.co.toUpperCase()}|${row.route}|${row.dir}`;
          if (
            row.co.toUpperCase() === info.company &&
            row.route === info.route
          ) {
            continue;
          }
          const existing = deduplicated.get(key);
          if (!existing || (existing.etas.length === 0 && row.etas.length > 0)) {
            deduplicated.set(key, row);
          }
        }
        setOtherRoutes(
          [...deduplicated.values()].sort((a, b) =>
            a.route.localeCompare(b.route, undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          ),
        );
      } catch (error) {
        console.error("[BusStopModal] Cross-operator lookup failed:", error);
        if (!cancelled) setNearbyError(true);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [info?.stopId, info?.company, info?.route, info?.lat, info?.long]);

  if (!info) return null;

  const sectionLabels = [
    t("bus.etaSectionTitle"),
    t("bus.mapSectionTitle"),
    t("bus.otherRoutesTitle"),
  ];
  const validEtas = info.etas.filter(
    (e) => e.eta || e.etaSeconds != null || e.etaText,
  );
  const color = CO_COLOR[info.company] ?? "#555";
  const labelKey = CO_LABEL_KEY[info.company];
  const label = labelKey ? t(labelKey) : info.company;
  const openOtherRoute = (row: OtherRoute) => {
    const params = new URLSearchParams({
      company: row.co.toUpperCase(),
      route: row.route,
      dir: row.dir,
      stopId: row.stopId,
    });
    if (row.routeId) params.set("routeId", row.routeId);
    if (row.serviceType) params.set("serviceType", row.serviceType);
    router.push(`/go_back?${params.toString()}`);
  };
  const handleSectionScroll = () => {
    const track = slidesRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveSection(Math.max(0, Math.min(sectionLabels.length - 1, index)));
  };
  const navigateToSection = (index: number) => {
    const track = slidesRef.current;
    if (!track) return;
    setActiveSection(index);
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

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
        className={classes.sheet}
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
          height: "60vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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

        <div className={classes.sheetContent}>
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

          <div className={classes.sectionPager}>
            <div className={classes.sectionDots}>
              {sectionLabels.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={classes.sectionDot}
                  aria-label={label}
                  aria-pressed={activeSection === index}
                  aria-controls={`stop-section-${index}`}
                  onClick={() => navigateToSection(index)}
                >
                  <span
                    aria-hidden="true"
                    className={classes.sectionDotIndicator}
                  />
                </button>
              ))}
            </div>
            <div className={classes.sectionLabel} aria-live="polite">
              {sectionLabels[activeSection]}
            </div>
          </div>

          <div
            ref={slidesRef}
            className={classes.slideTrack}
            onScroll={handleSectionScroll}
            aria-label={t("bus.stopDetailsSections")}
          >
            <section
              id="stop-section-0"
              className={classes.slide}
              data-stop-slide
              aria-label={sectionLabels[0]}
            >
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
                  <EtaSlot
                    key={i}
                    item={item}
                    nowSec={nowSec}
                    isFirst={i === 0}
                  />
                ))
              )}
            </section>

            <section
              id="stop-section-1"
              className={classes.slide}
              data-stop-slide
              aria-label={sectionLabels[1]}
            >
              <StopMap
                lat={info.lat}
                long={info.long}
                title={info.name_tc}
                active={activeSection === 1}
              />
            </section>

            <section
              id="stop-section-2"
              className={classes.slide}
              data-stop-slide
              aria-label={sectionLabels[2]}
            >
              <div style={{ marginTop: "4px" }}>
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
                {nearbyError && (
                  <div
                    role="status"
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    {t("bus.nearbyRoutesError" as TranslationKey)}
                  </div>
                )}
                {otherRoutes.length === 0 && !nearbyError && (
                  <div
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "13px",
                      padding: "18px 0",
                      textAlign: "center",
                    }}
                  >
                    {t("bus.noOtherRoutes")}
                  </div>
                )}
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
                    <button
                      type="button"
                      key={`${row.co}|${row.route}|${row.dir}|${idx}`}
                      onClick={() => openOtherRoute(row)}
                      aria-label={`${row.co} ${row.route}, ${row.dest_tc}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "11px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        marginBottom: "7px",
                        width: "100%",
                        color: "inherit",
                        font: "inherit",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
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
                        <span
                          style={{
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.3)",
                          }}
                        >
                          --
                        </span>
                      ) : arrived ? (
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: etaColor,
                          }}
                        >
                          {t("common.arriving")}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: etaColor,
                            flexShrink: 0,
                          }}
                        >
                          {etaMins}
                          <span style={{ fontSize: "10px", fontWeight: 500 }}>
                            {" "}
                            {t("common.min")}
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
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
