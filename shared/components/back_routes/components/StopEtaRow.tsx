/**
 * StopEtaRow — displays one bus stop with up to 3 ETA timers.
 *
 * Tapping the row calls `onSelectStop` to open the BusStopModal with full
 * stop details. Supports KMB/CTB/NLB (ISO timestamp ETAs) and MTR Bus
 * (seconds-delta / display-text ETAs per MTR_BUS_API_Spec_v1.13).
 *
 * ETA countdown recalculates every second using a parent-provided `now`
 * timestamp (epoch seconds) to avoid hundreds of independent setInterval calls.
 */
"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import type { RouteEtaItem, SelectedStopInfo } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";

interface StopEtaRowProps {
  seq: number;
  stopId: string;
  name_tc: string;
  name_en: string;
  lat?: string;
  long?: string;
  etas: RouteEtaItem[];
  /** Current epoch seconds (updated by parent every second) */
  now: number;
  /** Bus company — used to build SelectedStopInfo for the modal */
  company: "KMB" | "CTB" | "NLB" | "MTRBUS";
  /** Route number — used in SelectedStopInfo */
  route: string;
  /** Destination TC name — used in SelectedStopInfo */
  dest_tc: string;
  /** Called when row is tapped; parent opens the modal */
  onSelectStop: (info: SelectedStopInfo) => void;
  /** Whether this stop is currently in favourites */
  isFav?: boolean;
  /** Called when the heart button is tapped */
  onToggleFav?: () => void;
}

function minsUntil(etaStr: string | null, now: number): number | null {
  if (!etaStr) return null;
  const ms = Date.parse(etaStr) - now * 1000;
  if (isNaN(ms)) return null;
  return Math.floor(ms / 60000);
}

/**
 * Compute display minutes for a RouteEtaItem.
 * Returns null if there is no valid ETA.
 */
function resolveMinutes(item: RouteEtaItem, now: number): number | null {
  // MTR Bus: etaText overrides everything for special states
  if (item.etaText) {
    const lower = item.etaText.toLowerCase();
    if (lower.includes("arriving") || lower.includes("到達")) return 0;
    if (lower.includes("departed") || lower.includes("已離開")) return null;
  }
  // MTR Bus: seconds-delta
  if (item.etaSeconds != null) {
    return Math.floor(item.etaSeconds / 60);
  }
  // KMB / CTB / NLB: ISO timestamp
  return minsUntil(item.eta, now);
}

const EtaBadge: React.FC<{ item: RouteEtaItem; now: number; rank: number }> = memo(({
  item,
  now,
  rank,
}) => {
  const { t } = useLocale();
  const rmk = item.rmk_tc || item.rmk_en;
  const mins = resolveMinutes(item, now);

  if (mins === null) {
    if (rmk) {
      return (
        <span
          style={{
            fontSize: rank === 0 ? "11px" : "10px",
            color: "rgba(255,255,255,0.45)",
            fontStyle: "italic",
          }}
        >
          {rmk}
        </span>
      );
    }
    return null;
  }

  if (mins <= 0) {
    return (
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(52,199,89,0.22)",
          border: "1px solid rgba(52,199,89,0.5)",
          borderRadius: "9999px",
          color: "#34C759",
          fontWeight: 800,
          fontSize: rank === 0 ? "16px" : "12px",
          padding: rank === 0 ? "2px 12px" : "1px 8px",
          minWidth: rank === 0 ? "52px" : "40px",
          textAlign: "center",
        }}
      >
        {t("common.arriving")}
      </motion.span>
    );
  }

  const urgent = mins <= 3;
  const warn = mins <= 8;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "2px",
        background: urgent
          ? "rgba(255,69,58,0.18)"
          : warn
            ? "rgba(255,214,10,0.15)"
            : "rgba(10,132,255,0.14)",
        border: `1px solid ${urgent ? "rgba(255,69,58,0.4)" : warn ? "rgba(255,214,10,0.35)" : "rgba(10,132,255,0.3)"}`,
        borderRadius: "9999px",
        padding: rank === 0 ? "3px 14px" : "1px 9px",
        color: urgent ? "#FF453A" : warn ? "#FFD60A" : "#0A84FF",
        fontWeight: rank === 0 ? 800 : 600,
        fontSize: rank === 0 ? "22px" : "12px",
        minWidth: rank === 0 ? "56px" : "36px",
        textAlign: "center",
        lineHeight: 1.1,
        boxShadow: urgent ? "0 0 10px rgba(255,69,58,0.3)" : "none",
      }}
    >
      {mins}
      <span style={{ fontSize: rank === 0 ? "11px" : "9px", fontWeight: 500 }}>{t("common.min")}</span>
    </span>
  );
}) as React.FC<{ item: RouteEtaItem; now: number; rank: number }>;

const StopEtaRow: React.FC<StopEtaRowProps> = memo(({
  seq,
  stopId,
  name_tc,
  name_en,
  lat,
  long,
  etas,
  now,
  company,
  route,
  dest_tc,
  onSelectStop,
  isFav = false,
  onToggleFav,
}) => {
  const { t } = useLocale();
  // Filter out departed/empty ETAs for inline display
  const displayEtas = etas.filter((e) => resolveMinutes(e, now) !== null || (e.rmk_tc || e.rmk_en));
  const first = displayEtas[0] ?? null;
  const rest = displayEtas.slice(1, 3);

  const handleClick = () => {
    onSelectStop({
      stopId,
      name_tc,
      name_en,
      lat,
      long,
      etas,
      company,
      route,
      dest_tc,
    });
  };

  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        marginBottom: "6px",
        userSelect: "none",
      }}
    >
      {/* Sequence number */}
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: 700,
          color: "var(--text-secondary)",
          flexShrink: 0,
        }}
      >
        {seq}
      </div>

      {/* Stop name — tapping opens the modal */}
      <motion.div
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        onClick={handleClick}
        whileTap={{ scale: 0.985 }}
      >
        <div
          style={{
            fontWeight: 600,
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          className="display-75"
        >
          {name_tc}
        </div>
        {name_en && name_en !== stopId && (
          <div
            style={{
              color: "var(--text-secondary)",
              marginTop: "1px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            className="display-8"
          >
            {name_en}
          </div>
        )}
      </motion.div>

      {/* ETA display — tapping also opens modal */}
      <motion.div
        onClick={handleClick}
        whileTap={{ scale: 0.985 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "4px",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        {displayEtas.length === 0 ? (
          <span className="display-8" style={{ color: "var(--text-secondary)" }}>
            {t("common.noEta")}
          </span>
        ) : (
          <>
            {first && <EtaBadge item={first} now={now} rank={0} />}
            {rest.map((e, i) => (
              <EtaBadge key={i} item={e} now={now} rank={i + 1} />
            ))}
          </>
        )}
      </motion.div>

      {/* Favourite heart button */}
      {onToggleFav && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
          whileTap={{ scale: 0.8 }}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isFav ? "#FF453A" : "var(--text-secondary)",
            fontSize: "16px",
            lineHeight: 1,
            transition: "color 0.15s",
          }}
          aria-label={isFav ? t("fav.removeStop") : t("fav.addStop")}
          aria-pressed={isFav}
        >
          {isFav ? "♥" : "♡"}
        </motion.button>
      )}
    </motion.div>
  );
}) as React.FC<StopEtaRowProps>;

export default StopEtaRow;
