"use client";

import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import BackRoutesModal from "./BackRoutesModal";
import { useLocale } from "@/shared/context/locale-context";

interface BackRoutesItemsNLBStopProps {
  stop: any;
  route: string;
  routeId: string | number;
  terminus: any[];
  mode?: string;
  site?: string;
  company?: string;
  /** Pre-fetched ETA array from parent batch call */
  eta?: any[];
}

const BackRoutesItemsNLBStop: React.FC<BackRoutesItemsNLBStopProps> = (props) => {
  const { t } = useLocale();
  // Use parent-supplied ETA; keep a local clock for countdown labels
  const eta: any[] = props.eta ?? [];
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
  const [modal, setModal] = useState<boolean>(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <BackRoutesModal
        onClose={() => setModal(false)}
        stop={props.stop}
        route={props.route}
        routeId={props.routeId}
        terminus={props.terminus}
        eta={eta}
        mode="nlb"
        long={props.stop.longitude}
        lat={props.stop.latitude}
        show={modal}
        company={props.company}
      />
      <Grid container spacing={0} onClick={() => setModal(true)}>
        <Grid item xs={8}>
          <div className="badge-primary center display-75">
            {props.site === "fav" && (
              <span className="badge-secondary align-left">{t("bus.startStop")}</span>
            )}
            <span className={`${props.site === "fav" ? "display-7 p-1" : "display-75"}`}>
              {props.stop.stopName_c.replace(",", "").split(" ")[0]}
            </span>
          </div>
        </Grid>
        {eta.length > 0 && eta[0].estimatedArrivalTime ? (
          <Grid item xs={4}>
            {Math.floor((Date.parse(eta[0].estimatedArrivalTime) / 1000 - now) / 60) <= 0 ? (
              <span className={`badge-success-animate center ${props.site === "fav" ? "p-1 display-7" : "display-75"}`}>
                {t("common.arriving")}
              </span>
            ) : Math.floor((Date.parse(eta[0].estimatedArrivalTime) / 1000 - now) / 60) ? (
              <div
                className={`${
                  Math.floor((Date.parse(eta[0].estimatedArrivalTime) / 1000 - now) / 60) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } center ${props.site === "fav" ? "display-7 p-1" : "display-75"}`}
              >
                {Math.floor((Date.parse(eta[0].estimatedArrivalTime) / 1000 - now) / 60)}
              </div>
            ) : (
              <span className={`badge-danger center ${props.site === "fav" ? "display-7 p-1" : "display-75"}`}>
                {t("common.noService")}
              </span>
            )}
          </Grid>
        ) : (
          <Grid item xs={4}>
            <span className="badge-danger center display-75">{t("common.noService")}</span>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default BackRoutesItemsNLBStop;
