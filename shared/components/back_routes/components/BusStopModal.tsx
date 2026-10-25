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
  etaLoading?: boolean;
  onClose: () => void;
  /** Full ordered stop list for the route — enables ‹ / › navigation */
  stopList?: SelectedStopInfo[];
  /** Called when the user taps a navigation arrow */
  onNavigate?: (info: SelectedStopInfo) => void;
  routeDirection?: "I" | "O";
  routeId?: string;
  serviceType?: string;
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

interface SectionSwipe {
  pointerId: number;
  startX: number;
  startY: number;
  startOffset: number;
  startIndex: number;
  axis: "x" | "y" | null;
  lastX: number;
  lastAt: number;
}

type LoadStatus = "idle" | "loading" | "loaded" | "error";

interface KeyedLoadStatus {
  key: string;
  status: LoadStatus;
}

const SECTION_COUNT = 3;

const BusStopModalContent: React.FC<BusStopModalProps> = ({
  info,
  etaLoading = false,
  onClose,
  stopList,
  onNavigate,
  routeDirection,
  routeId,
  serviceType,
}) => {
  const { t } = useLocale();
  const router = useRouter();
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  const [otherRoutes, setOtherRoutes] = useState<OtherRoute[]>([]);
  const [otherRoutesKey, setOtherRoutesKey] = useState("");
  const [nearbyLoad, setNearbyLoad] = useState<KeyedLoadStatus>({
    key: "",
    status: "idle",
  });
  const [etaLoad, setEtaLoad] = useState<KeyedLoadStatus>({
    key: "",
    status: "idle",
  });
  const nearbyLoadedKeyRef = useRef<string | null>(null);
  const nearbyRequestKeyRef = useRef<string | null>(null);
  const etaLoadedKeyRef = useRef<string | null>(null);
  const etaRequestKeyRef = useRef<string | null>(null);
  const slidesRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const sectionIndexRef = useRef(0);
  const trackOffsetRef = useRef(0);
  const swipeRef = useRef<SectionSwipe | null>(null);
  const suppressClickRef = useRef(false);
  const currentStopId = info?.stopId ?? "";
  const currentCompany = info?.company ?? "";
  const currentRoute = info?.route ?? "";
  const currentLatitude = info?.lat;
  const currentLongitude = info?.long;
  const stopKey = info
    ? [
        currentCompany,
        currentStopId,
        currentRoute,
        currentLatitude ?? "",
        currentLongitude ?? "",
      ].join("|")
    : "";
  const currentOtherRoutes =
    otherRoutesKey === stopKey ? otherRoutes : [];
  const currentNearbyStatus =
    nearbyLoad.key === stopKey ? nearbyLoad.status : "idle";
  const currentEtaStatus = etaLoad.key === stopKey ? etaLoad.status : "idle";

  // Preserve the selected panel while resetting its content scroll on stop changes.
  useEffect(() => {
    if (!slidesRef.current) return;
    slidesRef.current
      .querySelectorAll<HTMLElement>("[data-stop-slide]")
      .forEach((slide) => {
        slide.scrollTop = 0;
      });
  }, [info?.stopId]);

  useEffect(() => {
    const track = slidesRef.current;
    const viewport = track?.parentElement;
    if (!track || !viewport) return;

    const alignTrack = () => {
      const width = viewport.clientWidth;
      if (!width) return;
      const offset = -sectionIndexRef.current * width;
      trackOffsetRef.current = offset;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    alignTrack();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", alignTrack);
      return () => window.removeEventListener("resize", alignTrack);
    }

    const observer = new ResizeObserver(alignTrack);
    observer.observe(viewport);
    return () => observer.disconnect();
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

  // Load route numbers only when the same-stop routes panel is opened.
  useEffect(() => {
    if (!stopKey || activeSection !== 2) return;
    if (
      nearbyLoadedKeyRef.current === stopKey ||
      nearbyRequestKeyRef.current === stopKey
    ) {
      return;
    }

    const requestKey = stopKey;
    const controller = new AbortController();
    let cancelled = false;
    nearbyRequestKeyRef.current = requestKey;
    setOtherRoutesKey(requestKey);
    setOtherRoutes([]);
    setNearbyLoad({ key: requestKey, status: "loading" });
    setEtaLoad({ key: requestKey, status: "idle" });

    async function load() {
      try {
        let routeRows: OtherRoute[] = [];
        const hasCoords =
          currentLatitude !== undefined &&
          currentLongitude !== undefined &&
          currentLatitude !== "" &&
          currentLongitude !== "";

        if (hasCoords) {
          const params = new URLSearchParams({
            lat: String(currentLatitude),
            lng: String(currentLongitude),
          });
          const response = await fetch(`/api/nearby-stops?${params}`, {
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`Nearby-stop lookup returned ${response.status}`);
          }
          const json = (await response.json()) as { stops?: NearbyStop[] };
          routeRows = (json.stops ?? []).flatMap((stop) =>
            stop.routes.map((route) => ({
              route: route.route,
              co: route.company,
              dir: route.dir,
              dest_tc: route.dest_tc,
              dest_en: route.dest_en,
              etas: [],
              stopId: stop.stopId,
              lat: String(stop.lat),
              long: String(stop.lng),
              routeId: route.routeId,
              serviceType: route.serviceType,
            })),
          );
        } else if (
          currentCompany === "KMB" ||
          currentCompany === "NLB"
        ) {
          const response = await fetch(
            `/api/stop-all-eta?stopId=${encodeURIComponent(currentStopId)}&company=${currentCompany.toLowerCase()}`,
            { signal: controller.signal },
          );
          if (!response.ok) {
            throw new Error(
              `Same-stop route lookup returned ${response.status}`,
            );
          }
          const json = (await response.json()) as { rows?: StopEtaRow[] };
          routeRows = (json.rows ?? []).map((row) => ({
            ...row,
            stopId: currentStopId,
            lat: currentLatitude,
            long: currentLongitude,
          }));
          etaLoadedKeyRef.current = requestKey;
          setEtaLoad({ key: requestKey, status: "loaded" });
        }

        if (cancelled) return;

        const deduplicated = new Map<string, OtherRoute>();
        for (const row of routeRows) {
          const key = `${row.co.toUpperCase()}|${row.route}|${row.dir}`;
          if (
            row.co.toUpperCase() === currentCompany &&
            row.route === currentRoute
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
        setOtherRoutesKey(requestKey);
        nearbyLoadedKeyRef.current = requestKey;
        setNearbyLoad({ key: requestKey, status: "loaded" });
      } catch (error) {
        if (cancelled) return;
        console.error("[BusStopModal] Cross-operator route lookup failed:", error);
        nearbyLoadedKeyRef.current = requestKey;
        setNearbyLoad({ key: requestKey, status: "error" });
      } finally {
        if (
          !cancelled &&
          nearbyRequestKeyRef.current === requestKey
        ) {
          nearbyRequestKeyRef.current = null;
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
      if (nearbyRequestKeyRef.current === requestKey) {
        nearbyRequestKeyRef.current = null;
      }
    };
  }, [
    activeSection,
    currentCompany,
    currentLatitude,
    currentLongitude,
    currentRoute,
    currentStopId,
    stopKey,
  ]);

  // ETA requests start only after the route-number list has been rendered.
  useEffect(() => {
    if (
      activeSection !== 2 ||
      !stopKey ||
      otherRoutesKey !== stopKey ||
      currentOtherRoutes.length === 0 ||
      etaLoadedKeyRef.current === stopKey ||
      etaRequestKeyRef.current === stopKey
    ) {
      return;
    }

    const groups = new Map<string, OtherRoute[]>();
    for (const row of currentOtherRoutes) {
      if (row.co.toUpperCase() === "MTRBUS") continue;
      const key = `${row.co.toUpperCase()}|${row.stopId}`;
      const group = groups.get(key) ?? [];
      group.push(row);
      groups.set(key, group);
    }

    if (groups.size === 0) {
      etaLoadedKeyRef.current = stopKey;
      setEtaLoad({ key: stopKey, status: "loaded" });
      return;
    }

    const requestKey = stopKey;
    const controller = new AbortController();
    let cancelled = false;
    etaRequestKeyRef.current = requestKey;
    setEtaLoad({ key: requestKey, status: "loading" });

    const loadEtas = async () => {
      const results = await Promise.allSettled(
        [...groups.entries()].map(async ([groupKey, rows]) => {
          const company = rows[0].co.toLowerCase();
          const params = new URLSearchParams({
            stopId: rows[0].stopId,
            company,
          });
          if (company === "ctb") {
            const routes = [...new Set(rows.map((row) => row.route))].slice(
              0,
              40,
            );
            if (routes.length > 0) params.set("routes", routes.join(","));
          } else if (company === "nlb") {
            const routeIds = [
              ...new Set(
                rows
                  .map((row) => row.routeId)
                  .filter((id): id is string => !!id),
              ),
            ].slice(0, 40);
            if (routeIds.length > 0) {
              params.set("routeIds", routeIds.join(","));
            }
          }

          const response = await fetch(`/api/stop-all-eta?${params}`, {
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`Nearby ETA lookup returned ${response.status}`);
          }
          const json = (await response.json()) as { rows?: StopEtaRow[] };
          return { groupKey, rows: json.rows ?? [] };
        }),
      );

      if (cancelled) return;

      const etasByRoute = new Map<string, StopEtaRow>();
      let hasError = false;
      for (const result of results) {
        if (result.status === "rejected") {
          hasError = true;
          console.error(
            "[BusStopModal] Nearby ETA lookup failed:",
            result.reason,
          );
          continue;
        }

        for (const row of result.value.rows) {
          etasByRoute.set(
            `${result.value.groupKey}|${row.route}|${row.dir}`,
            row,
          );
        }
      }

      setOtherRoutes((rows) =>
        rows.map((row) => {
          const live = etasByRoute.get(
            `${row.co.toUpperCase()}|${row.stopId}|${row.route}|${row.dir}`,
          );
          return live
            ? {
                ...row,
                etas: live.etas,
                routeId: row.routeId ?? live.routeId,
                serviceType: row.serviceType ?? live.serviceType,
              }
            : row;
        }),
      );
      etaLoadedKeyRef.current = requestKey;
      etaRequestKeyRef.current = null;
      setEtaLoad({ key: requestKey, status: hasError ? "error" : "loaded" });
    };

    void loadEtas();
    return () => {
      cancelled = true;
      controller.abort();
      if (etaRequestKeyRef.current === requestKey) {
        etaRequestKeyRef.current = null;
        setEtaLoad((current) =>
          current.key === requestKey && current.status === "loading"
            ? { key: requestKey, status: "idle" }
            : current,
        );
      }
    };
  }, [
    activeSection,
    currentOtherRoutes,
    otherRoutesKey,
    stopKey,
  ]);

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

  const moveToSection = (requestedIndex: number) => {
    const track = slidesRef.current;
    if (!track) return;
    const width = track.parentElement?.clientWidth ?? track.clientWidth;
    if (width === 0) return;

    const index = Math.max(0, Math.min(SECTION_COUNT - 1, requestedIndex));
    const offset = -index * width;
    track.classList.remove(classes.slideTrackDragging);
    track.style.transition = "";
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
    trackOffsetRef.current = offset;
    sectionIndexRef.current = index;
    setActiveSection(index);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }
    if (
      event.target instanceof Element &&
      event.target.closest("[data-map-gesture]")
    ) {
      swipeRef.current = null;
      return;
    }
    swipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: trackOffsetRef.current,
      startIndex: sectionIndexRef.current,
      axis: null,
      lastX: event.clientX,
      lastAt: performance.now(),
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current;
    const track = event.currentTarget;
    if (!swipe || swipe.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;
    if (!swipe.axis) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        swipe.axis = "y";
        return;
      }
      swipe.axis = "x";
      track.classList.add(classes.slideTrackDragging);
      track.setPointerCapture(event.pointerId);
    }
    if (swipe.axis !== "x") return;

    event.preventDefault();
    const width = track.parentElement?.clientWidth ?? track.clientWidth;
    if (width === 0) return;
    const minOffset = -(SECTION_COUNT - 1) * width;
    const offset = Math.max(minOffset, Math.min(0, swipe.startOffset + deltaX));
    trackOffsetRef.current = offset;
    track.style.transform = `translate3d(${offset}px, 0, 0)`;

    const now = performance.now();
    if (now - swipe.lastAt > 0) {
      swipe.lastX = event.clientX;
      swipe.lastAt = now;
    }
  };

  const finishPointerGesture = (
    event: React.PointerEvent<HTMLDivElement>,
    allowVelocity: boolean,
  ) => {
    const swipe = swipeRef.current;
    const track = event.currentTarget;
    if (!swipe || swipe.pointerId !== event.pointerId) return;

    if (swipe.axis === "x") {
      const width = track.parentElement?.clientWidth ?? track.clientWidth;
      const displacement = trackOffsetRef.current - swipe.startOffset;
      const elapsed = performance.now() - swipe.lastAt;
      const velocity =
        allowVelocity && elapsed > 0
          ? (event.clientX - swipe.lastX) / elapsed
          : 0;
      const threshold = Math.max(36, width * 0.18);
      let index = swipe.startIndex;

      if (Math.abs(displacement) >= threshold || Math.abs(velocity) > 0.45) {
        index += displacement < 0 || velocity < 0 ? 1 : -1;
      }

      suppressClickRef.current = true;
      requestAnimationFrame(() => {
        suppressClickRef.current = false;
      });
      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
      moveToSection(index);
    }

    swipeRef.current = null;
  };

  const navigateToSection = (index: number) => {
    moveToSection(index);
  };
  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
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

          <div className={classes.slideViewport} aria-label={t("bus.stopDetailsSections")}>
            <div
              ref={slidesRef}
              className={classes.slideTrack}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => finishPointerGesture(event, true)}
              onPointerCancel={(event) => finishPointerGesture(event, false)}
              onClickCapture={handleClickCapture}
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
                  role={etaLoading ? "status" : undefined}
                  aria-live={etaLoading ? "polite" : undefined}
                  style={{
                    textAlign: "center",
                    padding: "28px 0",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "14px",
                  }}
                >
                  {etaLoading ? t("common.updating") : t("bus.noEtaData")}
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
                route={info.route}
                company={info.company}
                direction={routeDirection}
                routeId={routeId}
                serviceType={serviceType}
                destination={info.dest_tc}
                currentStopId={info.stopId}
                routeStops={stopList}
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
                {currentNearbyStatus === "loading" && (
                  <div
                    role="status"
                    aria-live="polite"
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    {t("bus.nearbyRoutesLoading")}
                  </div>
                )}
                {currentNearbyStatus === "error" && (
                  <div
                    role="status"
                    aria-live="polite"
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    {t("bus.nearbyRoutesError")}
                  </div>
                )}
                {currentNearbyStatus === "loaded" &&
                  currentOtherRoutes.length === 0 && (
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
                {currentEtaStatus === "loading" &&
                  currentOtherRoutes.length > 0 && (
                    <div
                      role="status"
                      aria-live="polite"
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        fontSize: "12px",
                        marginBottom: "10px",
                      }}
                    >
                      {t("bus.nearbyEtaLoading")}
                    </div>
                  )}
                {currentEtaStatus === "error" && (
                  <div
                    role="status"
                    aria-live="polite"
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    {t("bus.nearbyEtaError")}
                  </div>
                )}
                {currentOtherRoutes.map((row, idx) => {
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
        </div>
      </motion.div>
    </motion.div>
  );
};

const BusStopModal: React.FC<BusStopModalProps> = ({
  info,
  etaLoading,
  onClose,
  stopList,
  onNavigate,
  routeDirection,
  routeId,
  serviceType,
}) => {
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
          etaLoading={etaLoading}
          onClose={onClose}
          stopList={stopList}
          onNavigate={onNavigate}
          routeDirection={routeDirection}
          routeId={routeId}
          serviceType={serviceType}
        />
      )}
    </AnimatePresence>,
    el,
  );
};

export default BusStopModal;
