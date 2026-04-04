"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BusEtaRouteCard from "./BusEtaRouteCard";
import type { StopEtaRow, StopEtaSlot, EtaEntry } from "@/shared/types";

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

type CompanyFilter = "全部" | string;

const REFRESH_SEC = 30;

const CO_COLORS: Record<string, string> = {
  KMB: "#D22F2F",
  LWB: "#D22F2F",
  CTB: "#ffe923",
  NWFB: "#ffe923",
  NLB: "#00A651",
};

const CO_LABELS: Record<string, string> = {
  KMB: "九龍巴士 KMB",
  LWB: "龍運巴士 LWB",
  CTB: "城巴 CTB",
  NWFB: "新世界第一 NWFB",
  NLB: "嶼巴 NLB",
  MTRBUS: "港鐵巴士 MTR Bus",
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

const MapPinIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BusStopEtaView: React.FC<BusStopEtaViewProps> = (props) => {
  const [rows, setRows] = useState<StopEtaRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [filter, setFilter] = useState<CompanyFilter>("全部");
  const [countdown, setCountdown] = useState(REFRESH_SEC);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEtas = useCallback(async () => {
    if (props.company === "nlb" || !props.stopId) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/stop-all-eta?stopId=${encodeURIComponent(props.stopId)}&company=${props.company}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const json = await res.json();
        setRows(json.rows ?? []);
        setLastRefresh(new Date());
        setNow(Math.floor(Date.now() / 1000));
        setCountdown(REFRESH_SEC);
      }
    } catch {
      // silent — keep stale data
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [props.stopId, props.company]);

  // Initial fetch + auto-refresh
  useEffect(() => {
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
    filter === "全部" ? rows : rows.filter((r) => r.co === filter);

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

  // ── Map link ─────────────────────────────────────────────────
  const mapUrl =
    props.lat && props.long
      ? `https://www.google.com/maps?q=${props.lat},${props.long}&z=17`
      : null;

  // ── Last-refresh label ────────────────────────────────────────
  const refreshLabel = lastRefresh
    ? `更新於 ${lastRefresh.toLocaleTimeString("zh-HK", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })}`
    : "正在載入…";

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
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="eta-map-btn"
              aria-label="在地圖上查看巴士站"
            >
              <MapPinIcon />
              地圖
            </a>
          )}
          <button
            className={`eta-refresh-btn${isLoading ? " eta-refresh-spinning" : ""}`}
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="立即更新班次"
            type="button"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* ── Countdown / last-refresh bar ───────────────────── */}
      <div className="eta-refresh-bar">
        <span className="eta-refresh-label">{refreshLabel}</span>
        <div className="eta-countdown-track">
          <div
            className="eta-countdown-fill"
            style={{ width: `${(countdown / REFRESH_SEC) * 100}%` }}
          />
        </div>
        <span className="eta-refresh-next">{countdown}秒</span>
      </div>

      {/* ── Company filter chips ────────────────────────────── */}
      {props.company !== "nlb" && presentCompanies.length > 0 && (
        <div className="eta-filter-row" role="group" aria-label="篩選巴士公司">
          {(["全部" as CompanyFilter, ...presentCompanies]).map((co) => {
            const count =
              co === "全部"
                ? rows.length
                : rows.filter((r) => r.co === co).length;
            const active = filter === co;
            return (
              <button
                key={co}
                type="button"
                className={`eta-filter-chip${active ? " eta-filter-chip-active" : ""}`}
                style={
                  active && co !== "全部"
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
                {co === "全部" ? "全部" : (CO_LABELS[co] ?? co)}
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
            <div className="eta-empty-title">暫無班次資料</div>
            <div className="eta-empty-sub">
              此站目前沒有班次，請稍後重試。
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
                {CO_LABELS[co] ?? co}
                <span className="eta-company-count">{coRows.length} 條路線</span>
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
