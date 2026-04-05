"use client";

import { Grid } from "@mui/material";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../ui/Card";
import type { RoadStatusMessage } from "@/shared/types";

interface RoadStatusItemProps {
  data: RoadStatusMessage;
}

const RoadStatusItem: React.FC<RoadStatusItemProps> = (props) => {
  const [expanded, setExpanded] = useState(false);
  const all: string[] = props.data.ChinText?.[0]?.split("。") ?? [];

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        {/* Compact header card */}
        <Card classNames="p-2" onClick={() => setExpanded((e) => !e)}>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div className="banner banner-white display-75" style={{ flex: 1, minWidth: 0 }}>
                  {(props.data.ChinShort?.[0] ?? "").substring(0, 40)} ...
                </div>
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", flexShrink: 0 }}
                >
                  ▾
                </motion.span>
              </div>
              <div className="badge-primary-super display-8 mt-1 align-right">
                {props.data.ReferenceDate?.[0]}
              </div>
            </Grid>
          </Grid>
        </Card>

        {/* Inline expanded detail — FavStopCard glass style */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  padding: "12px 14px",
                  marginTop: "4px",
                  marginBottom: "4px",
                }}
              >
                {all.slice(0, -1).map((x, i) => (
                  <div
                    className="text-primary display-7"
                    key={i}
                    style={{ marginBottom: "6px" }}
                  >
                    {x}。
                  </div>
                ))}
                <div style={{ textAlign: "right", marginTop: "8px" }}>
                  <span className="display-8 badge-secondary">
                    {props.data.ReferenceDate?.[0]}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Grid>
    </Grid>
  );
};

export default RoadStatusItem;
