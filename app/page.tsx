"use client";

import BusFavList from "@/shared/components/bus_routes/components/BusFavList";
import { UpdateContext } from "@/shared/context/update-context";
import { Grid } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import RoadStatus from "@/shared/components/home/RoadStatus";
import { useLocale } from "@/shared/context/locale-context";
import { getFavStops } from "@/shared/util/favStops";
import type { FavRouteStop } from "@/shared/types";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  // opacity starts at 1 so SSR/mobile sees content immediately;
  // y/scale still animate in after hydration.
  hidden: { opacity: 1, y: 18, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 360, damping: 26 },
  },
};

export default function Home() {
  const { t } = useLocale();
  const UPDATES = [
    { date: "2026-04-04", info: t("update.2026-04-04"), version: "1.01" },
    { date: "2026-04-04", info: t("update.2026-04-04-2"), version: "1.0" },
    { date: "2024-02-26", info: t("update.2024-02-26"), version: "0.1708934" },
  ];
  const [likedItem, setLikedItem] = useState("");
  const [likedBack, setLikedBack] = useState("");
  const [likedNlb, setLikedNlb] = useState("");
  const [likedRouteStop, setLikedRouteStop] = useState<FavRouteStop[]>([]);
  // mounted guard: keep SSR and client initial render identical so React
  // hydration never sees a mismatch from localStorage-populated state.
  const [mounted, setMounted] = useState(false);

  const refreshRouteStops = useCallback(() => {
    setLikedRouteStop(getFavStops());
  }, []);

  useEffect(() => {
    setLikedItem(localStorage.getItem("likedBus")?.replace(/,\s*$/, "") ?? "");
    setLikedBack(localStorage.getItem("likedBack")?.replace(/,\s*$/, "") ?? "");
    setLikedNlb(localStorage.getItem("likedNlb")?.replace(/,\s*$/, "") ?? "");
    setLikedRouteStop(getFavStops());
    setMounted(true);
  }, []);

  const safeParse = (raw: string) => {
    try {
      return JSON.parse("[" + raw + "]");
    } catch {
      return [];
    }
  };

  return (
    <UpdateContext.Provider
      value={{
        update: () =>
          setLikedItem(
            localStorage.getItem("likedBus")?.replace(/,\s*$/, "") ?? "",
          ),
        updateBack: () =>
          setLikedBack(
            localStorage.getItem("likedBack")?.replace(/,\s*$/, "") ?? "",
          ),
        updateNlb: () =>
          setLikedNlb(
            localStorage.getItem("likedNlb")?.replace(/,\s*$/, "") ?? "",
          ),
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: "12px 8px" }}
      >
        <Grid container spacing={1}>
          {/* ── Favourites ──────────────────────────── */}
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              {mounted ? (
                <BusFavList
                  data={safeParse(likedItem)}
                  backData={safeParse(likedBack)}
                  nlbData={safeParse(likedNlb)}
                  routeStopData={likedRouteStop}
                  onRouteStopRemoved={refreshRouteStops}
                  mode="home"
                />
              ) : (
                <BusFavList
                  data={[]}
                  backData={[]}
                  nlbData={[]}
                  routeStopData={[]}
                  mode="home"
                />
              )}
            </motion.div>
          </Grid>

          {/* ── Road Status ─────────────────────────── */}
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <RoadStatus />
            </motion.div>
          </Grid>

          {/* ── Changelog ───────────────────────────── */}
          <Grid item xs={12} md={6}>
            <motion.div
              variants={itemVariants}
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
              <div
                className="banner banner-primary center"
                style={{ marginBottom: "10px" }}
              >
                {t("home.updateLog")}
              </div>
              <Grid container spacing={1}>
                {UPDATES.map((x, i) => (
                  <Grid item xs={12} md={6} key={x.version}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.06 * i,
                        type: "spring",
                        stiffness: 300,
                      }}
                      style={{
                        borderRadius: "var(--radius-sm, 10px)",
                        background: "var(--glass-bg-hover)",
                        border: "1px solid var(--glass-border)",
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        className="display-75"
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: "4px",
                        }}
                      >
                        {x.info}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "4px",
                        }}
                      >
                        <span className="badge-secondary-outline display-8">
                          {t("about.version")}: {x.version}
                        </span>
                        <span className="badge-primary-super display-8">
                          {x.date}
                        </span>
                      </div>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </UpdateContext.Provider>
  );
}
