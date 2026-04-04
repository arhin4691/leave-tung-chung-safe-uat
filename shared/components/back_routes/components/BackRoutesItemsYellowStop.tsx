"use client";

import React, { useEffect, useState } from "react";
import BackRoutesYellowStopModal from "./BackRoutesYellowStopModal";
import { Box, Grid, LinearProgress } from "@mui/material";

interface BackRoutesItemsYellowStopProps {
  stopId: string | number;
  stopSeq: number;
  routeId: string | number;
  routeSeq: number;
  routeCode?: string;
  route?: string;
  termName?: string;
  orgName?: string;
  data?: any[];
  open?: boolean;
  site?: string;
  company?: string;
}

const BackRoutesItemsYellowStop: React.FC<BackRoutesItemsYellowStopProps> = (props) => {
  const [modal, setModal] = useState<boolean>(false);
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
  const [eta, setEta] = useState<any[]>([]);
  const [locate, setLocate] = useState<any>({});

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [etaRes, locateRes, stopsRes] = await Promise.all([
          fetch(`https://360-api.socif.co/api/eta/route-stop/${props.routeId}/${props.routeSeq}`),
          fetch(`https://360-api.socif.co/api/stop/${props.stopId}`),
          fetch(`https://360-api.socif.co/api/route-stop/${props.routeId}/${props.routeSeq}`),
        ]);
        const etaJson = await etaRes.json();
        const locateJson = await locateRes.json();
        const stopsJson = await stopsRes.json();
        setEta(etaJson.data.eta);
        setLocate(locateJson.data.coordinates.wgs84);
        setData(stopsJson.data.route_stops);
      } catch (error) {
        console.error("Yellow stop fetch error:", error);
      }
    };
    fetchAll();
    const interval = setInterval(() => {
      fetch(`https://360-api.socif.co/api/eta/route-stop/${props.routeId}/${props.routeSeq}`)
        .then((r) => r.json())
        .then((j) => {
          setEta(j.data.eta);
          setNow(Math.floor(Date.now() / 1000));
        })
        .catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const etaEntry = eta[props.stopSeq - 1];

  return (
    <>
      <BackRoutesYellowStopModal
        onClose={() => setModal(false)}
        stop={data[props.stopSeq - 1]?.name_tc}
        stopId={data[props.stopSeq - 1]?.stop_id}
        stopSeq={props.stopSeq}
        route={props.site === "fav" ? props.route : props.routeCode}
        routeId={props.routeId}
        routeSeq={props.routeSeq}
        termName={props.termName}
        orgName={props.orgName}
        eta={etaEntry}
        mode="yb"
        site={props.site}
        lat={locate.latitude}
        long={locate.longitude}
        show={modal}
        company="yb"
      />
      <Grid container spacing={0} onClick={() => setModal(true)}>
        <Grid item xs={8}>
          <div className="badge-primary center display-75">
            {props.site === "fav" && (
              <span className="badge-secondary align-left">起點: </span>
            )}
            <span className={`${props.site === "fav" ? "display-7 p-1" : "display-75"}`}>
              {data[props.stopSeq - 1]?.name_tc}
            </span>
          </div>
        </Grid>
        {etaEntry?.eta !== "" ? (
          <Grid item xs={4}>
            {Math.floor(
              (Date.parse(etaEntry?.eta[0]?.timestamp) / 1000 - now) / 60
            ) <= 0 ? (
              <span
                className={`badge-success-animate center ${props.site === "fav" ? "display-7 p-1" : "display-75"}`}
              >
                到達
              </span>
            ) : Math.floor(
                (Date.parse(etaEntry?.eta[0]?.timestamp) / 1000 - now) / 60
              ) ? (
              <div
                className={`${
                  Math.floor(
                    (Date.parse(etaEntry?.eta[0]?.timestamp) / 1000 - now) / 60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } center ${props.site === "fav" ? "display-7 p-1" : "display-75"}`}
              >
                {Math.floor(
                  (Date.parse(etaEntry?.eta[0]?.timestamp) / 1000 - now) / 60
                )}
              </div>
            ) : (
              <span
                className={`badge-danger center ${props.site === "fav" ? "display-7 p-1" : "display-75"}`}
              >
                未有服務
              </span>
            )}
          </Grid>
        ) : (
          <Grid item xs={4}>
            <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default BackRoutesItemsYellowStop;
