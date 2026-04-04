"use client";

import { Box, Grid, LinearProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import BackRoutesModal from "./BackRoutesModal";

interface BackRoutesItemsStopProps {
  stop: any;
  route: string;
  terminus: any[];
  site?: string;
  company?: string;
}

const BackRoutesItemsStop: React.FC<BackRoutesItemsStopProps> = (props) => {
  const [eta, setEta] = useState<any[]>([{ eta: "" }]);
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  const getEta = async () => {
    const data = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/eta/${props.stop.stop}/${props.route}/1`
    );
    const json = await data.json();
    if (json.data[0]) setEta(json.data);
  };

  useEffect(() => {
    if (props.stop) {
      getEta();
      const interval = setInterval(() => {
        getEta();
        setNow(Math.floor(Date.now() / 1000));
      }, 10000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.stop]);

  const [modal, setModal] = useState<boolean>(false);
  const [long, setLong] = useState<string>("");
  const [lat, setLat] = useState<string>("");

  useEffect(() => {
    fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${props.stop.stop}`)
      .then((r) => r.json())
      .then((j) => {
        setLong(j.data.long);
        setLat(j.data.lat);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.stop.stop]);

  return (
    <>
      <BackRoutesModal
        onClose={() => setModal(false)}
        stop={props.stop}
        route={props.route}
        terminus={props.terminus}
        eta={eta}
        mode="kmb"
        long={long}
        lat={lat}
        show={modal}
        company={props.company}
      />
      <Grid container spacing={0} onClick={() => setModal(true)}>
        <Grid item xs={8}>
          <div className="badge-primary center display-75">
            {props.site === "fav" && (
              <span className="badge-secondary align-left">起點: </span>
            )}
            <span className={`${props.site === "fav" ? "display-7 p-1" : "display-75"}`}>
              {props.stop.name_tc.replace(",", "").split(" ")[0]}
            </span>
          </div>
        </Grid>
        {eta[0].eta !== "" ? (
          <Grid item xs={4}>
            {Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) <= 0 ? (
              <span className={`badge-success-animate center ${props.site === "fav" ? "display-7 p-1" : "display-75"}`}>
                到達
              </span>
            ) : Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) ? (
              <div
                className={`${
                  Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } center ${props.site === "fav" ? "display-7 p-1" : "display-75"}`}
              >
                {Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60)}
              </div>
            ) : (
              <span className={`badge-danger center ${props.site === "fav" ? "display-7 p-1" : "display-75"}`}>
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

export default BackRoutesItemsStop;
