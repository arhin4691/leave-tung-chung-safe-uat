"use client";

import { Box, Grid, LinearProgress } from "@mui/material";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import BackRoutesItemsCTBStop from "./BackRoutesItemsCTBStop";
import Card from "../../ui/Card";
import { useLocale } from "@/shared/context/locale-context";

interface StopData {
  stop: string;
  name_en: string;
  name_tc: string;
  lat: string;
  long: string;
}

interface BackRoutesItemsCTBProps {
  route: string;
  type?: string;
  start?: string;
  end?: string;
  co?: string;
  mode?: string;
}

const BackRoutesItemsCTB: React.FC<BackRoutesItemsCTBProps> = (props) => {
  const { t } = useLocale();
  const LogoCTB = "/files/images/logo_ctb.png";

  const [stops, setStops] = useState<StopData[]>([]);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  // etas keyed by stopId
  const [etas, setEtas] = useState<Record<string, any[]>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Single call: load route stop list + stop details + working status
  useEffect(() => {
    fetch(`/api/ctb-route?route=${props.route}&mode=${props.mode ?? ""}`)
      .then((r) => r.json())
      .then((j) => {
        setStops(j.stops ?? []);
        setIsWorking(j.isWorking ?? false);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.route, props.mode]);

  // Batch ETA fetch for all stops (single call)
  const fetchEtas = useCallback(() => {
    if (stops.length === 0) return;
    const stopIds = stops.map((s) => s.stop).join(",");
    fetch(`/api/ctb-eta?route=${props.route}&stops=${stopIds}`)
      .then((r) => r.json())
      .then((j) => setEtas(j.etas ?? {}))
      .catch(() => {});
  }, [stops, props.route]);

  // Start/stop ETA polling when the stop list is opened
  useEffect(() => {
    if (open && stops.length > 0) {
      fetchEtas();
      intervalRef.current = setInterval(fetchEtas, 10000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, stops.length, fetchEtas]);

  const toggleHandler = () => setOpen((prev) => !prev);

  return (
    <>
      {stops.length ? (
        <Card classNames="p-1">
          <Grid container spacing={0} onClick={toggleHandler}>
            <Grid container spacing={0}>
              <Grid item xs={9}>
                <span className="display-75 badge-primary-super align-left">
                  <span className="display-9">{t("common.towards")}　</span> {props.end}
                </span>
              </Grid>
              <Grid item xs={3}>
                <span
                  className={`${isWorking ? "badge-success-animate" : "badge-danger"} display-75 align-right`}
                >
                  {isWorking ? t("common.inService") : t("common.noService")}
                </span>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <span className="badge-ctb display-7 center">
                <Image src={LogoCTB} width={20} height={20} alt="CTB Logo" />
                {props.route}
              </span>
            </Grid>
            <Grid item xs={9}>
              <span className="badge-primary align-left">
                <span className="display-8"> ➤ {t("route.from")} </span>
                <span className="display-7">{props.start}</span>
                <span className="display-8">{t("route.depart")}</span>
              </span>
              <span className="align-right text-primary display-6" onClick={toggleHandler}>
                {open ? "△" : "▽"}
              </span>
            </Grid>
          </Grid>
          {open && (
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Card disabled classNames="p-2">
                  {stops.length > 0 ? (
                    stops.map((stop, i) => (
                      <BackRoutesItemsCTBStop
                        stop={stop}
                        route={props.route}
                        type={props.type}
                        terminus={[stops[stops.length - 1]]}
                        eta={etas[stop.stop] ?? []}
                        key={stop.stop ?? i}
                        mode={props.mode}
                      />
                    ))
                  ) : (
                    <Box>
                      <LinearProgress />
                      <span className="text-primary center">{t("bus.preparing")}</span>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}
        </Card>
      ) : (
        ""
      )}
    </>
  );
};

export default BackRoutesItemsCTB;
