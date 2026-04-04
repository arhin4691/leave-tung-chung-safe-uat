"use client";

import { Grid } from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import BackRoutesItemsStop from "./BackRoutesItemsStop";
import Card from "../../ui/Card";

interface BackRoutesItemsProps {
  fullList: any[];
  route: string;
  type: string;
}

const BackRoutesItems: React.FC<BackRoutesItemsProps> = (props) => {
  const LogoLWB = "/files/images/logo_lwb.png";
  const [routeStops, setRouteStops]   = useState<any[]>([]);
  const [isWorking, setIsWorking]     = useState<boolean>(false);
  const [timeTable, setTimeTable]     = useState<any[]>([]);
  const [open, setOpen]               = useState<boolean>(false);

  /**
   * Single API call to /api/kmb-route replaces the previous 3 separate fetches:
   *   1. route-stop list  2. route-eta (for isWorking)  3. timetable
   */
  const loadRouteDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/kmb-route?route=${props.route}&type=${props.type === "O" ? "O" : "I"}`);
      if (!res.ok) return;
      const json = await res.json();

      // Resolve stop details from the fullList prop (all stops pre-fetched by parent)
      const stops: string[] = (json.stops ?? []).map((s: any) => s.stop);
      const resolved = stops.map((id: string) =>
        props.fullList.find((x: any) => x.stop === id)
      ).filter(Boolean);
      setRouteStops(resolved);

      // Check if any ETA entry has a non-null eta value → service is running
      const type = props.type === "O" ? "O" : "I";
      const working = (json.eta ?? []).some((e: any) => e.dir === type && e.eta);
      setIsWorking(working);

      setTimeTable(json.timetable ?? []);
    } catch (err) {
      console.error("BackRoutesItems detail fetch error:", err);
    }
  }, [props.route, props.type, props.fullList]);

  useEffect(() => {
    if (props.fullList.length > 0) {
      loadRouteDetail();
    }
  }, [loadRouteDetail, props.fullList]);

  return (
    <>
      <Card classNames="p-1">
        <Grid container spacing={0} onClick={() => setOpen(!open)}>
          <Grid container spacing={0}>
            <Grid item xs={9}>
              <span className="display-75 badge-primary-super align-left">
                <span className="display-9">往　</span>
                {routeStops.length > 0 && routeStops[routeStops.length - 1]?.name_tc}
              </span>
            </Grid>
            <Grid item xs={3}>
              <span
                className={`${isWorking ? "badge-success-animate" : "badge-danger"} display-75 align-right`}
              >
                {isWorking ? "提供服務" : "未有服務"}
              </span>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <span className="badge-kmb display-7 center">
              <Image src={LogoLWB} width={20} height={20} alt="LWB Logo" />
              {props.route}
            </span>
          </Grid>
          <Grid item xs={9}>
            <span className="badge-primary align-left">
              <span className="display-8"> ➤ 由</span>{" "}
              <span className="display-7">
                {routeStops.length > 0 && routeStops[0]?.name_tc}{" "}
              </span>
              <span className="display-8">開出</span>
            </span>
            <span className="align-right text-primary display-6">
              {open ? "△" : "▽"}
            </span>
          </Grid>
        </Grid>

        {open && (
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <Card disabled classNames="p-2">
                <span className="badge-secondary">時刻表</span>
                {timeTable[0] && (
                  <>
                    <span className="badge-primary-outline display-9 center">
                      星期一至五{timeTable[0].Desc_CHI}: {timeTable[0].From_weekday} - {timeTable[0].To_weekday}
                    </span>
                    <span className="badge-primary-outline display-9 center">
                      星期六{timeTable[0].Desc_CHI}: {timeTable[0].From_saturday} - {timeTable[0].To_saturday}
                    </span>
                    <span className="badge-primary-outline display-9 center">
                      星期日及公眾假期{timeTable[0].Desc_CHI}: {timeTable[0].From_holiday} - {timeTable[0].To_holiday}
                    </span>
                  </>
                )}
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card disabled classNames="p-2">
                {routeStops.map((x) => (
                  <BackRoutesItemsStop
                    stop={x}
                    route={props.route}
                    terminus={routeStops.slice(-1)}
                    key={x.stop}
                    company="kmb"
                  />
                ))}
              </Card>
            </Grid>
          </Grid>
        )}
      </Card>
    </>
  );
};

export default BackRoutesItems;
