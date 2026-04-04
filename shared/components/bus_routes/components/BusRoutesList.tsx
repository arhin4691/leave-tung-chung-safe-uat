"use client";

import { Grid } from "@mui/material";
import React, { useState, useEffect, useCallback, useRef } from "react";
import BusRoutesItem from "./BusRoutesItem";
import BusRoutesNlbItem from "./BusRoutesNlbItem";
import type { EtaItemNormalized } from "./BusRoutesItem";
import type { BusRoute } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";

interface BusRoutesListProps {
  keyword: string;
  routes: BusRoute[];
  nlbRoutes: BusRoute[];
  stopName: string;
  location: string;
}

const BusRoutesList: React.FC<BusRoutesListProps> = (props) => {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [searchedData, setSearchedData] = useState<BusRoute[]>([]);
  const [searchedNlbData, setSearchedNlbData] = useState<BusRoute[]>([]);

  // One ETA map for ALL routes in this stop: key ??normalized ETA list
  const [etaMap, setEtaMap] = useState<Record<string, EtaItemNormalized[]>>({});
  const [etaLoading, setEtaLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Search filter ────────────────────────────────────
  useEffect(() => {
    setSearchedData(
      [...props.routes].filter(
        (x) =>
          x.busRoute.toUpperCase().includes(props.keyword.toUpperCase()) ||
          x.to.toString().toUpperCase().includes(props.keyword.toUpperCase()) ||
          x.routeStop.toString().toUpperCase().includes(props.keyword.toUpperCase())
      )
    );
    setSearchedNlbData(
      [...props.nlbRoutes].filter(
        (x) =>
          x.busRoute.toUpperCase().includes(props.keyword.toUpperCase()) ||
          x.to.toString().toUpperCase().includes(props.keyword.toUpperCase()) ||
          x.routeStop.toString().toUpperCase().includes(props.keyword.toUpperCase())
      )
    );
    setOpen(props.keyword !== "");
  }, [props.keyword, props.routes, props.nlbRoutes]);

  // ── Single batched ETA fetch for the whole stop section ──
  const fetchAllEtas = useCallback(async () => {
    const allRoutes = [...props.routes, ...props.nlbRoutes];
    if (allRoutes.length === 0) return;

    const queries = allRoutes.map((r) => ({
      id: `${r.type}:${r.busRoute}:${r.busStop}`,
      type: r.type as "kmb" | "ctb" | "nlb",
      route: r.type !== "nlb" ? r.busRoute : undefined,
      routeId: r.type === "nlb" ? r.routeId : undefined,
      stop: r.busStop,
    }));

    setEtaLoading(true);
    try {
      const res = await fetch("/api/bus-stop-eta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routes: queries }),
      });
      if (!res.ok) return;
      const json = await res.json();
      setEtaMap(json.results ?? {});
    } catch {
      // silently fail ??items fall back to empty state
    } finally {
      setEtaLoading(false);
    }
  }, [props.routes, props.nlbRoutes]);

  // ── Trigger fetch when section opens; refresh every 30 s ──
  useEffect(() => {
    if (!open) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    fetchAllEtas();
    intervalRef.current = setInterval(fetchAllEtas, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, fetchAllEtas]);

  const openHandler = () => {
    setOpen(!open);
    setOpenMap(false);
  };
  const mapHandler = () => {
    setOpenMap(!openMap);
    setOpen(false);
  };

  const getEta = (r: BusRoute) =>
    etaMap[`${r.type}:${r.busRoute}:${r.busStop}`];

  const displayNlb = props.keyword === "" ? props.nlbRoutes : searchedNlbData;
  const displayRoutes = props.keyword === "" ? props.routes : searchedData;

  if (searchedData.length < 1 && searchedNlbData.length < 1) return null;

  return (
    <div className="white-background m-1 mt-1 p-1">
      <div className="p-1 center white-background sticky">
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <span className="badge-secondary display-6" onClick={openHandler}>
              🚌
            </span>
          </Grid>
          <Grid item xs={8}>
            <span
              className="banner badge-primary-super p-1 display-8 center ms-1"
              onClick={openHandler}
            >
              {props.stopName}
              {etaLoading && (
                <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 10 }}>
                  ↻
                </span>
              )}
            </span>
          </Grid>
          <Grid item xs={2}>
            <span className="badge-secondary display-6" onClick={mapHandler}>
              🗺️
            </span>
          </Grid>
        </Grid>
      </div>

      {open && (
        <div>
          <Grid container spacing={0}>
            {displayNlb.map((x) => (
              <Grid item xs={12} md={6} lg={4} xl={3} key={x.busRoute}>
                <BusRoutesNlbItem data={x} externalEta={getEta(x)} />
              </Grid>
            ))}
            {displayRoutes.map((x) => (
              <Grid item xs={12} md={6} lg={4} xl={3} key={x.busRoute}>
                <BusRoutesItem data={x} externalEta={getEta(x)} />
              </Grid>
            ))}
            {displayRoutes.length < 1 && displayNlb.length < 1 && (
              <span className="badge-reverse center">
                {t("common.noResult")}
              </span>
            )}
          </Grid>
        </div>
      )}

      {openMap && (
        <div
          id="canvas-for-googlemap"
          style={{ height: "300px", width: "100%", maxWidth: "100%" }}
        >
          <iframe
            title={props.stopName}
            src={props.location}
            style={{ border: 0, width: "100%", height: "300px" }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
};

export default BusRoutesList;
