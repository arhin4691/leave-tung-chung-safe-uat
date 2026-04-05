"use client";

import { Grid } from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import { parseString } from "xml2js";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import RoadStatusItem from "./components/RoadStatusItem";
import { useLocale } from "@/shared/context/locale-context";
import type { RoadStatusMessage } from "@/shared/types";

const INITIAL: RoadStatusMessage[] = [{ ChinShort: ["正在載入交通消息…"] }];

interface RoadStatusProps {
  onToggle: () => void;
  isOpen: boolean;
}

const RoadStatus: React.FC<RoadStatusProps> = ({ onToggle, isOpen }) => {
  const { t } = useLocale();
  const [roadData, setRoadData] = useState<RoadStatusMessage[]>(INITIAL);
  const [refresh, setRefresh] = useState(0);
  const [quan, setQuan] = useState(3);

  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const response = await fetch(
        "https://resource.data.one.gov.hk/td/en/specialtrafficnews.xml",
        { signal },
      );
      const xml = await response.text();
      parseString(xml, (err, result) => {
        if (!err && result?.body?.message) {
          setRoadData(result.body.message as RoadStatusMessage[]);
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        setRoadData([
          {
            ChinShort: [`政府內部資料錯誤: ${error.message}`],
            ChinText: [`政府內部資料錯誤: ${error.message}`],
            ReferenceDate: [""],
          },
        ]);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, refresh]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => setRefresh((n) => n + 1), 600_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      style={{
        borderRadius: "var(--radius-md, 16px)",
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
        padding: "12px",
        margin: "4px",
      }}
    >
      {/* ── Section header ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: isOpen ? "10px" : 0,
          marginBottom: isOpen ? "8px" : 0,
          borderBottom: isOpen ? "1px solid rgba(255,255,255,0.07)" : "none",
          transition: "padding-bottom 0.2s, margin-bottom 0.2s",
        }}
      >
        {/* Left: dot + title + count badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#0A84FF",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: "14px",
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {t("home.roadStatus")}
          </span>
          {roadData.length > 0 &&
            roadData[0]?.ChinShort?.[0] !== "正在載入交通消息…" && (
              <span
                style={{
                  background: "rgba(10,132,255,0.15)",
                  border: "1px solid rgba(10,132,255,0.3)",
                  color: "#0A84FF",
                  borderRadius: "9999px",
                  padding: "1px 7px",
                  fontSize: "11px",
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {roadData.length}
              </span>
            )}
        </div>

        {/* Right: refresh + chevron toggle */}
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <button
            onClick={() => setRefresh((n) => n + 1)}
            aria-label="refresh"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              padding: "4px 8px",
              color: "rgba(255,255,255,0.45)",
              fontSize: "14px",
              lineHeight: 1,
              fontFamily: "inherit",
            }}
          >
            ↺
          </button>
          <button
            onClick={onToggle}
            aria-label={isOpen ? "collapse" : "expand"}
            style={{
              background: isOpen
                ? "rgba(10,132,255,0.15)"
                : "rgba(255,255,255,0.07)",
              border: isOpen
                ? "1px solid rgba(10,132,255,0.3)"
                : "1px solid transparent",
              borderRadius: "9999px",
              cursor: "pointer",
              padding: "4px 11px",
              color: isOpen ? "#0A84FF" : "rgba(255,255,255,0.45)",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
            }}
          >
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{ display: "inline-flex", lineHeight: 1 }}
            >
              ▾
            </motion.span>
          </button>
        </div>
      </div>

      {/* ── Collapsible content ─────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="road-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              <Grid container spacing={0}>
                {roadData.slice(0, quan).map(
                  (x, i) =>
                    x.ChinShort && (
                      <Grid
                        item
                        xs={12}
                        md={6}
                        xl={3}
                        key={(x.ChinShort[0] ?? "") + i}
                      >
                        <RoadStatusItem data={x} />
                      </Grid>
                    ),
                )}
              </Grid>
            </div>
            <div className="center" style={{ marginTop: "8px", gap: "8px" }}>
              <Button
                light
                disabled={quan >= roadData.length}
                onClick={() => setQuan((p) => p + 3)}
              >
                {t("common.more")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoadStatus;
