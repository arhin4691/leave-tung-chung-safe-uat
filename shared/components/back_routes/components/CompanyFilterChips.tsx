/**
 * CompanyFilterChips — horizontal pill chips for KMB / CTB / NLB / All
 * Used by the revamped go_back bus page.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";

export type CompanyFilter = "ALL" | "KMB" | "CTB" | "NLB" | "MTRBUS";

const CHIPS: { label: string; value: CompanyFilter; color: string; textColor?: string }[] = [
  { label: "全部", value: "ALL", color: "rgba(255,255,255,0.18)" },
  { label: "KMB / LWB", value: "KMB", color: "#D22F2F" },
  { label: "CTB / NWFB", value: "CTB", color: "#FFF12E", textColor: "#1a1a1a" },
  { label: "NLB", value: "NLB", color: "#009A44" },
  { label: "MTR Bus", value: "MTRBUS", color: "#0061A3" },
];

interface CompanyFilterChipsProps {
  value: CompanyFilter;
  onChange: (v: CompanyFilter) => void;
}

const CompanyFilterChips: React.FC<CompanyFilterChipsProps> = ({ value, onChange }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        padding: "4px 2px 6px",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {CHIPS.map((chip) => {
        const active = value === chip.value;
        return (
          <motion.button
            key={chip.value}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(chip.value)}
            style={{
              flexShrink: 0,
              padding: "6px 16px",
              borderRadius: "9999px",
              border: `1.5px solid ${active ? chip.color : "var(--text-primary)"}`,
              background: active ? chip.color : "rgba(255,255,255,0.05)",
              color: active ? (chip.textColor ?? "#fff") : "var(--text-primary)",
              fontSize: "13px",
              fontWeight: active ? 700 : 400,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.15s",
              outline: "none",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
              boxShadow: active ? `0 2px 12px ${chip.color}55` : "none",
            }}
          >
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CompanyFilterChips;
