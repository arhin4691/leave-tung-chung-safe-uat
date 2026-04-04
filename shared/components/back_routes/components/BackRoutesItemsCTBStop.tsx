"use client";

import { Box, Grid, LinearProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import BackRoutesModal from "./BackRoutesModal";

interface BackRoutesItemsCTBStopProps {
  stop: any;
  route: string;
  type?: string;
  company?: string;
  terminus: any;
  mode?: string;
  site?: string;
  /** Pre-fetched ETA array from parent batch call */
  eta?: any[];
}

const BackRoutesItemsCTBStop: React.FC<BackRoutesItemsCTBStopProps> = (props) => {
  // Use parent-supplied ETA; track a local clock for countdown display
  const eta: any[] = props.eta ?? [];
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
  const [modal, setModal] = useState<boolean>(false);

  // Keep `now` in sync so countdown labels refresh every second
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // Coordinates are pre-fetched and available on stop object from parent
  const long: string = props.stop?.long ?? "";
  const lat: string = props.stop?.lat ?? "";

  return (
    <>
      <BackRoutesModal
        onClose={() => setModal(false)}
        stop={props.stop}
        route={props.route}
        terminus={props.site === "fav" ? props.terminus.data : props.terminus[0]?.data}
        eta={eta}
        mode="ctb"
        site={props.site}
        lat={lat}
        long={long}
        reverse={props.mode === "reverse"}
        show={modal}
        company="ctb"
      />
      <Grid container spacing={0} onClick={() => setModal(true)}>
        <Grid item xs={8}>
          <div className="badge-primary center display-75">
            {props.site === "fav" && (
              <span className="badge-secondary align-left">起點: </span>
            )}
            <span className={`${props.site === "fav" ? "display-7 p-1" : "display-75"}`}>
              {props.stop?.name_tc?.replace(",", "").split(" ")[0]}
            </span>
          </div>
        </Grid>
        {eta.length > 0 ? (
          <Grid item xs={4}>
            {Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) <= 0 ? (
              <span
                className={`badge-success-animate center ${props.site === "fav" ? "display-7" : "display-75"}`}
              >
                到達
                {props.site !== "fav" && props.mode === "reverse"
                  ? eta[0].dir === "I" && "回程車"
                  : eta[0].dir === "O" && "回程車"}
              </span>
            ) : eta.length > 0 &&
              Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) ? (
              <div
                className={`${
                  Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } center ${props.site === "fav" ? "p-1 display-7" : "display-75"}`}
              >
                <span>
                  {props.mode !== "reverse" ? (
                    <>
                      {props.site !== "fav" && eta[0].dir === "O" ? (
                        <span className="display-9">
                          {Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60)}{" "}
                          {"回程車"}
                        </span>
                      ) : (
                        Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60)
                      )}
                    </>
                  ) : (
                    <>
                      {props.site !== "fav" && eta[0].dir === "I" ? (
                        <span className="display-9">
                          {Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60)}{" "}
                          {"回程車"}
                        </span>
                      ) : (
                        Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60)
                      )}
                    </>
                  )}
                </span>
              </div>
            ) : (
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
            )}
          </Grid>
        ) : (
          <Grid item xs={4}>
            <span className="badge-danger center display-75">未有服務</span>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default BackRoutesItemsCTBStop;
