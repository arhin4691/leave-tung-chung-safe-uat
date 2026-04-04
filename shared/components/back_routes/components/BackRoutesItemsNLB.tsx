"use client";

import { Grid } from "@mui/material";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import BackRoutesItemsNLBStop from "./BackRoutesItemsNLBStop";
import Card from "../../ui/Card";

interface BackRoutesItemsNLBProps {
  routeId: string | number;
  route: string;
}

const BackRoutesItemsNLB: React.FC<BackRoutesItemsNLBProps> = (props) => {
  const LogoNLB = "/files/images/logo_nlb.png";
  const [stops, setStops] = useState<any[]>([]);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [etas, setEtas] = useState<Record<string, any[]>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Single call: load stop list + working status
  useEffect(() => {
    fetch(`/api/nlb-route?routeId=${props.routeId}`)
      .then((r) => r.json())
      .then((j) => {
        setStops(j.stops ?? []);
        setIsWorking(j.isWorking ?? false);
      })
      .catch(() => {});
  }, [props.routeId]);

  // Batch ETA fetch for all stops (single call)
  const fetchEtas = useCallback(() => {
    if (stops.length === 0) return;
    const stopIds = stops.map((s) => s.stopId).join(",");
    fetch(`/api/nlb-eta?routeId=${props.routeId}&stops=${stopIds}`)
      .then((r) => r.json())
      .then((j) => setEtas(j.etas ?? {}))
      .catch(() => {});
  }, [stops, props.routeId]);

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
      <Card classNames="p-1">
        <Grid container spacing={0} onClick={toggleHandler}>
          <Grid container spacing={0}>
            <Grid item xs={9}>
              <span className="display-75 badge-primary-super align-left">
                <span className="display-9">往　</span>
                {stops.length > 0 && stops[stops.length - 1].stopName_c}
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
            <span className="badge-success display-7 center">
              <Image src={LogoNLB} width={20} height={20} alt="NLB Logo" />
              {props.route}
            </span>
          </Grid>
          <Grid item xs={9}>
            <span className="badge-primary align-left">
              <span className="display-8"> ➤ 由</span>{" "}
              <span className="display-7">
                {stops.length > 0 && stops[0].stopName_c}{" "}
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
                {stops.length > 0 &&
                  stops.map((x, i) => (
                    <BackRoutesItemsNLBStop
                      stop={x}
                      route={props.route}
                      terminus={[stops[stops.length - 1]]}
                      routeId={props.routeId}
                      eta={etas[x.stopId] ?? []}
                      key={x.stopId ?? i}
                      mode="nlb"
                      company="nlb"
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

export default BackRoutesItemsNLB;
