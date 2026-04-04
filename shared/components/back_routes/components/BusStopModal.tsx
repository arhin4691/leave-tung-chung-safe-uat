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

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { SelectedStopInfo, RouteEtaItem, StopEtaRow } from "@/shared/types";

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
const CO_LABEL: Record<string, string> = {
  KMB: "九龍巴士 KMB",
  CTB: "城巴 CTB",
  NLB: "嶼巴 NLB",
  MTRBUS: "港鐵巴士 MTR Bus",
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

const EtaSlot: React.FC<EtaSlotProps> = ({ item, nowSec, isFirst }) => {
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
            到達
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
              分鐘
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
          {item.isScheduled ? "時刻表" : "實時"}
        </span>
      )}
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────

interface BusStopModalProps {
  info: SelectedStopInfo | null;
  onClose: () => void;
}

const BusStopModalContent: React.FC<BusStopModalProps> = ({ info, onClose }) => {
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  const [otherRoutes, setOtherRoutes] = useState<StopEtaRow[]>([]);

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
  // KMB/CTB: query both operators (share the same stop ID registry).
  // NLB: query NLB stop-all-eta (uses server-side static reverse lookup).
  // MTRBUS: each stop serves exactly one route — skip.
  useEffect(() => {
    if (!info) return;
    if (info.company === "MTRBUS") {
      setOtherRoutes([]);
      return;
    }
    setOtherRoutes([]);
    let cancelled = false;
    const stopId = info.stopId;

    async function load() {
      try {
        let rows: StopEtaRow[] = [];

        if (info!.company === "NLB") {
          const res = await fetch(
            `/api/stop-all-eta?stopId=${encodeURIComponent(stopId)}&company=nlb`
          );
          const json = res.ok ? await res.json() : { rows: [] };
          rows = (json.rows ?? []) as StopEtaRow[];
        } else {
          // KMB or CTB: query both operators' stop-eta endpoints
          const companies = ["kmb", "ctb"];
          const results = await Promise.all(
            companies.map((co) =>
              fetch(`/api/stop-all-eta?stopId=${encodeURIComponent(stopId)}&company=${co}`)
                .then((r) => (r.ok ? r.json() : { rows: [] }))
                .then((j) => (j.rows ?? []) as StopEtaRow[])
                .catch(() => [] as StopEtaRow[]),
            ),
          );
          rows = results.flat();
        }

        if (cancelled) return;
        // Remove the route already shown in the primary ETA section
        const filtered = rows.filter(
          (row) => !(row.co.toUpperCase() === info!.company && row.route === info!.route),
        );
        setOtherRoutes(filtered);
      } catch {
        // ignore
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [info?.stopId, info?.company, info?.route]);

  if (!info) return null;

  const validEtas = info.etas.filter(
    (e) => e.eta || e.etaSeconds != null || e.etaText,
  );
  const color = CO_COLOR[info.company] ?? "#555";
  const label = CO_LABEL[info.company] ?? info.company;

  const mapUrl =
    info.lat && info.long
      ? `https://maps.google.com/maps?q=${info.lat},${info.long}`
      : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Scrim */}
      <motion.div
        key="scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.62)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(14,18,30,0.97)",
          backdropFilter: "blur(40px) saturate(160%)",
          WebkitBackdropFilter: "blur(40px) saturate(160%)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px 24px 0 0",
          maxHeight: "82vh",
          overflowY: "auto",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
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
                往 {info.dest_tc} &nbsp;·&nbsp; ID: {info.stopId}
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
            預計到達時間
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
              目前沒有班次資料
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
              📍 在地圖上查看
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
                同站其他路線
              </div>
              {otherRoutes.map((row, idx) => {
                const coColor = CO_COLOR[row.co.toUpperCase()] ?? "#555";
                const coText = CO_TEXT[row.co.toUpperCase()] ?? "#fff";
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
                        往 {row.dest_tc}
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
                    {/* Next ETA */}
                    {etaMins === null ? (
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>--</span>
                    ) : arrived ? (
                      <span style={{ fontSize: "13px", fontWeight: 800, color: etaColor }}>到達</span>
                    ) : (
                      <span style={{ fontSize: "14px", fontWeight: 800, color: etaColor, flexShrink: 0 }}>
                        {etaMins}
                        <span style={{ fontSize: "10px", fontWeight: 500 }}> 分</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const BusStopModal: React.FC<BusStopModalProps> = ({ info, onClose }) => {
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
      {info && <BusStopModalContent key="content" info={info} onClose={onClose} />}
    </AnimatePresence>,
    el,
  );
};

export default BusStopModal;
