"use client";

import React from "react";
import type { StopEtaRow, StopEtaSlot } from "@/shared/types";

interface BusEtaRouteCardProps {
  row: StopEtaRow;
  now: number;
}

const CO_CONFIG: Record<
  string,
  { accentColor: string; badgeClass: string; label: string }
> = {
  KMB: { accentColor: "#D22F2F", badgeClass: "badge-kmb", label: "KMB" },
  LWB: { accentColor: "#D22F2F", badgeClass: "badge-kmb", label: "LWB" },
  CTB: { accentColor: "#fff12e", badgeClass: "badge-ctb-green", label: "CTB" },
  NWFB: { accentColor: "#fff12e", badgeClass: "badge-ctb-green", label: "NWFB" },
  NLB: { accentColor: "#00A651", badgeClass: "badge-nlb", label: "NLB" },
};

function calcMin(etaStr: string, now: number): number {
  return Math.floor((Date.parse(etaStr) / 1000 - now) / 60);
}

function renderEtaPill(slot: StopEtaSlot, now: number, isFirst: boolean) {
  if (!slot.eta) return null;
  const min = calcMin(slot.eta, now);
  const isArriving = min <= 0;
  const isUrgent = min > 0 && min <= 3;

  return (
    <div
      key={slot.eta_seq}
      className={[
        "eta-time-pill",
        isFirst ? "eta-pill-first" : "eta-pill-next",
        isArriving
          ? "eta-pill-arriving"
          : isUrgent
          ? "eta-pill-urgent"
          : "eta-pill-normal",
      ].join(" ")}
    >
      {isArriving ? (
        <span className="eta-pill-label">到達</span>
      ) : (
        <>
          <span className="eta-pill-minutes">{min}</span>
          <span className="eta-pill-unit">分</span>
        </>
      )}
      {slot.rmk_tc && (
        <span className="eta-pill-rmk" title={slot.rmk_en}>
          {slot.rmk_tc}
        </span>
      )}
    </div>
  );
}

const BusEtaRouteCard: React.FC<BusEtaRouteCardProps> = ({ row, now }) => {
  const cfg = CO_CONFIG[row.co] ?? {
    accentColor: "#888",
    badgeClass: "badge-secondary",
    label: row.co,
  };

  const validSlots = row.etas.filter((e) => e.eta);

  return (
    <div className="eta-route-card">
      {/* Left company colour accent */}
      <div
        className="eta-route-accent"
        style={{ backgroundColor: cfg.accentColor }}
        aria-hidden="true"
      />

      <div className="eta-route-main">
        {/* Top row: route badge + destination */}
        <div className="eta-route-header">
          <span className={`${cfg.badgeClass} eta-route-number`}>
            {row.route}
          </span>
          <div className="eta-route-dest">
            <span className="eta-dest-tc">{row.dest_tc}</span>
            {row.dest_en && (
              <span className="eta-dest-en">{row.dest_en}</span>
            )}
          </div>
        </div>

        {/* ETA pills row */}
        {validSlots.length === 0 ? (
          <div className="eta-no-service">
            <span className="badge-danger">暫停服務</span>
          </div>
        ) : (
          <div className="eta-times-row">
            {validSlots.map((slot, i) =>
              renderEtaPill(slot, now, i === 0)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusEtaRouteCard;
