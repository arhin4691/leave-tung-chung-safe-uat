"use client";

import { Grid } from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import { parseString } from "xml2js";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import RoadStatusItem from "./components/RoadStatusItem";
import { useLocale } from "@/shared/context/locale-context";
import type { RoadStatusMessage } from "@/shared/types";

const INITIAL: RoadStatusMessage[] = [{ ChinShort: ["正在載入交通消息…"] }];

const RoadStatus: React.FC = () => {
  const { t } = useLocale();
  const [roadData, setRoadData] = useState<RoadStatusMessage[]>(INITIAL);
  const [refresh, setRefresh] = useState(0);
  const [quan, setQuan] = useState(3);

  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const response = await fetch(
        "https://resource.data.one.gov.hk/td/en/specialtrafficnews.xml",
        { signal }
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
            ChinText:  [`政府內部資料錯誤: ${error.message}`],
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
        maxHeight: "350px",
        overflowY: "auto",
      }}
    >
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <div
            className="banner banner-primary center display-7"
            style={{ marginBottom: "8px" }}
          >
            {t("home.roadStatus")}
          </div>
        </Grid>
        {roadData.slice(0, quan).map(
          (x, i) =>
            x.ChinShort && (
              <Grid item xs={12} md={6} xl={3} key={(x.ChinShort[0] ?? "") + i}>
                <RoadStatusItem data={x} />
              </Grid>
            )
        )}
      </Grid>
      <div className="center" style={{ marginTop: "8px", gap: "8px" }}>
        <Button light disabled={quan >= roadData.length} onClick={() => setQuan((p) => p + 3)}>
          {t("common.more")}
        </Button>
        <Button outlineSecondary onClick={() => setRefresh((n) => n + 1)}>
          ↺
        </Button>
      </div>
    </motion.div>
  );
};

export default RoadStatus;
