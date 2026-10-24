"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BusEtaRouteCard from "./BusEtaRouteCard";
import type { StopEtaRow, StopEtaSlot, EtaEntry } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";
import type { TranslationKey } from "@/shared/i18n/translations";
import StopMap from "@/shared/components/ui/StopMap";

interface BusStopEtaViewProps {
  /** KMB or CTB stop ID */
  stopId?: string;
  /** Display name (Traditional Chinese) */
  stopNameTc: string;
  /** Display name (English) */
  stopNameEn?: string;
  /** Bus operator */
  company: "kmb" | "ctb" | "nlb";
  lat?: string;
  long?: string;
  /** The route the user tapped on (highlighted first in the list) */
  currentRoute?: string;
  /** NLB: pass ETAs directly (no stop-level NLB endpoint) */
  nlbEtas?: EtaEntry[];
  nlbDest?: string;
  nlbDestEn?: string;
}

type CompanyFilter = "ALL" | string;

const REFRESH_SEC = 30;

const CO_COLORS: Record<string, string> = {
  KMB: "#D22F2F",
  LWB: "#D22F2F",
  CTB: "#ffe923",
  NWFB: "#ffe923",
  NLB: "#00A651",
};

const CO_LABEL_KEYS: Record<string, TranslationKey> = {
  KMB: "company.KMB",
  LWB: "company.LWB",
  CTB: "company.CTB",
  NWFB: "company.NWFB",
  NLB: "company.NLB",
  MTRBUS: "company.MTRBUS",
};

const RefreshIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const BusStopEtaView: React.FC<BusStopEtaViewProps> = (props) => {
  const { t } = useLocale();
  const [rows, setRows] = useState<StopEtaRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [now, setNow] = useState(0); // 0 on both server and client — avoids hydration mismatch
  const [filter, setFilter] = useState<CompanyFilter>("ALL");
  const [countdown, setCountdown] = useState(REFRESH_SEC);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Nearby KMB stop IDs discovered via proximity lookup.
  // Populated once on mount; reused on every ETA refresh.
  const nearbyKmbIdsRef = useRef<string[]>([]);

  // ── One-time proximity lookup ────────────────────────────────
  // In Hong Kong, KMB and CTB sometimes register separate stop IDs for
  // the same physical pole. A direct KMB query with a CTB stop ID would
  // miss those KMB routes. We search within 80 m at mount time and cache
  // the discovered KMB stop IDs for inclusion in every ETA refresh.
  useEffect(() => {
    if (
      props.company !== "ctb" || // only needed for CTB — KMB already gives full cross-operator data
      !props.stopId ||
      !props.lat ||
      !props.long
    )
      return;

    fetch(
      `/api/nearby-stops?lat=${props.lat}&lng=${props.long}&excludeStopId=${encodeURIComponent(props.stopId)}`
    )
      .then((r) => (r.ok ? r.json() : { stops: [] }))
      .then((j) => {
        const kmbIds = (j.stops ?? [])
          .filter((s: { company: string }) => s.company === "KMB")
          .map((s: { stopId: string }) => s.stopId);
        if (kmbIds.length > 0) {
          nearbyKmbIdsRef.current = kmbIds;
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.stopId, props.lat, props.long]);

  const fetchEtas = useCallback(async () => {
    if (props.company === "nlb" || !props.stopId) return;
    setIsLoading(true);
    try {
      // KMB and CTB share the same stop ID registry — always fetch both
      // regardless of which operator opened this view.
      const targets: string[] =
        props.company === "kmb" || props.company === "ctb"
          ? ["kmb", "ctb"]
          : [props.company];

      // Direct queries for this stop ID
      const directFetches = targets.map((co) =>
        fetch(
          `/api/stop-all-eta?stopId=${encodeURIComponent(props.stopId!)}&company=${co}`,
          { cache: "no-store" }
        )
          .then((r) => (r.ok ? r.json() : { rows: [] }))
          .catch(() => ({ rows: [] }))
      );

      // Proximity queries — fetch KMB+CTB for each nearby KMB stop ID.
      // These handle the case where the CTB pole has a different stop ID
      // than the adjacent KMB pole at the same physical location.
      const nearbyFetches = nearbyKmbIdsRef.current.flatMap((sid) =>
        ["kmb", "ctb"].map((co) =>
          fetch(
            `/api/stop-all-eta?stopId=${encodeURIComponent(sid)}&company=${co}`,
            { cache: "no-store" }
          )
            .then((r) => (r.ok ? r.json() : { rows: [] }))
            .catch(() => ({ rows: [] }))
        )
      );

      const allResponses = await Promise.all([...directFetches, ...nearbyFetches]);

      // Merge + deduplicate by (co|route|dir)
      const seen = new Set<string>();
      const merged: StopEtaRow[] = allResponses
        .flatMap((json: { rows?: StopEtaRow[] }) => json.rows ?? [])
        .filter((row: StopEtaRow) => {
          const key = `${row.co}|${row.route}|${row.dir}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      setRows(merged);
      setLastRefresh(new Date());
      setNow(Math.floor(Date.now() / 1000));
      setCountdown(REFRESH_SEC);
    } catch {
      // silent — keep stale data
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [props.stopId, props.company]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    // Initialize clock on client to avoid hydration mismatch (now starts at 0)
    setNow(Math.floor(Date.now() / 1000));

    fetchEtas();

    timerRef.current = setInterval(() => {
      fetchEtas();
    }, REFRESH_SEC * 1000);

    clockRef.current = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, [fetchEtas]);

  const handleRefresh = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(REFRESH_SEC);
    fetchEtas().then(() => {
      timerRef.current = setInterval(fetchEtas, REFRESH_SEC * 1000);
    });
  };

  // ── Derived state ────────────────────────────────────────────
  const presentCompanies = [...new Set(rows.map((r) => r.co))];

  const filteredRows =
    filter === "ALL" ? rows : rows.filter((r) => r.co === filter);

  // Put currentRoute first inside each company group
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (props.currentRoute) {
      const aMatch = a.route === props.currentRoute ? 0 : 1;
      const bMatch = b.route === props.currentRoute ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }
    return a.route.localeCompare(b.route, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  const groupedByCompany: Record<string, StopEtaRow[]> = {};
  for (const row of sortedRows) {
    (groupedByCompany[row.co] ??= []).push(row);
  }

  // ── NLB: build a synthetic StopEtaRow from props.nlbEtas ─────
  const nlbRow: StopEtaRow = {
    route: props.currentRoute ?? "",
    co: "NLB",
    dir: "O",
    dest_tc: props.nlbDest ?? "",
    dest_en: props.nlbDestEn ?? "",
    etas: (props.nlbEtas ?? []).map((e, i): StopEtaSlot => ({
      eta: e.estimatedArrivalTime ?? e.eta ?? null,
      eta_seq: i + 1,
      rmk_tc: "",
      rmk_en: "",
    })),
  };

  // ── Last-refresh label ────────────────────────────────────────
  const refreshLabel = lastRefresh
    ? `${t("bus.updatedAt")} ${lastRefresh.toLocaleTimeString("zh-HK", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })}`
    : t("common.loading");

  return (
    <div className="eta-stop-view">
      {/* ── Stop header ────────────────────────────────────── */}
      <div className="eta-stop-header">
        <div className="eta-stop-name-block">
          <div className="eta-stop-name-tc">{props.stopNameTc}</div>
          {props.stopNameEn && (
            <div className="eta-stop-name-en">{props.stopNameEn}</div>
          )}
        </div>
        <div className="eta-stop-actions">
          <button
            className={`eta-refresh-btn${isLoading ? " eta-refresh-spinning" : ""}`}
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh"
            type="button"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      <StopMap lat={props.lat} long={props.long} title={props.stopNameTc} />

      {/* ── Countdown / last-refresh bar ───────────────────── */}
      <div className="eta-refresh-bar">
        <span className="eta-refresh-label">{refreshLabel}</span>
        <div className="eta-countdown-track">
          <div
            className="eta-countdown-fill"
            style={{ width: `${(countdown / REFRESH_SEC) * 100}%` }}
          />
        </div>
        <span className="eta-refresh-next">{countdown}{t("common.sec")}</span>
      </div>

      {/* ── Company filter chips ────────────────────────────── */}
      {props.company !== "nlb" && presentCompanies.length > 0 && (
        <div className="eta-filter-row" role="group" aria-label={t("bus.filterAriaLabel" as TranslationKey) || "Filter"}>
          {(["ALL" as CompanyFilter, ...presentCompanies]).map((co) => {
            const count =
              co === "ALL"
                ? rows.length
                : rows.filter((r) => r.co === co).length;
            const active = filter === co;
            return (
              <button
                key={co}
                type="button"
                className={`eta-filter-chip${active ? " eta-filter-chip-active" : ""}`}
                style={
                  active && co !== "ALL"
                    ? {
                        borderColor: CO_COLORS[co] ?? undefined,
                        color: CO_COLORS[co] ?? undefined,
                        background:
                          `${CO_COLORS[co] ?? "#fff"}1a`,
                      }
                    : {}
                }
                onClick={() => setFilter(co)}
                aria-pressed={active}
              >
                {co === "ALL" ? t("common.all") : (t((CO_LABEL_KEYS[co] ?? co) as TranslationKey) ?? co)}
                <span className="eta-chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main content area ─────────────────────────────── */}
      <div className="eta-content-area">
        {/* NLB mode: single–route display */}
        {props.company === "nlb" && (
          <AnimatePresence initial={false}>
            <motion.div
              key="nlb-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <BusEtaRouteCard row={nlbRow} now={now} />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Loading skeleton (first load only) */}
        {props.company !== "nlb" && !hasFetched && (
          <div className="eta-loading-state" aria-busy="true" aria-label="正在載入班次資料">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="eta-skeleton-card">
                <div className="eta-skeleton-line eta-skel-short" />
                <div className="eta-skeleton-line eta-skel-long" />
                <div className="eta-skeleton-line eta-skel-medium" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {props.company !== "nlb" && hasFetched && filteredRows.length === 0 && (
          <div className="eta-empty-state">
            <div className="eta-empty-icon">🚌</div>
            <div className="eta-empty-title">{t("bus.noEtaTitle")}</div>
            <div className="eta-empty-sub">
              {t("bus.noEtaDesc")}
            </div>
          </div>
        )}

        {/* ETA cards grouped by company */}
        {props.company !== "nlb" &&
          Object.entries(groupedByCompany).map(([co, coRows]) => (
            <div key={co} className="eta-company-group">
              {/* Company section header */}
              <div
                className="eta-company-label"
                style={{ color: CO_COLORS[co] ?? "inherit" }}
              >
                <span
                  className="eta-company-dot"
                  style={{ background: CO_COLORS[co] ?? "#888" }}
                  aria-hidden="true"
                />
                {t((CO_LABEL_KEYS[co] ?? co) as TranslationKey) ?? co}
                <span className="eta-company-count">{coRows.length} {t("bus.routesSuffix")}</span>
              </div>

              <AnimatePresence initial={false}>
                {coRows.map((row, i) => (
                  <motion.div
                    key={`${row.co}-${row.route}-${row.dir}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.035, duration: 0.22 }}
                    layout
                  >
                    <BusEtaRouteCard
                      row={row}
                      now={now}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}
      </div>
    </div>
  );
};

export default BusStopEtaView;
