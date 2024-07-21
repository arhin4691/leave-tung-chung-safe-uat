import { Box, Grid, LinearProgress } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import BackRoutesModal from "./BackRoutesModal";

const BackRoutesItemsNLBStop = (props) => {
  const [eta, setEta] = useState([{ estimatedArrivalTime: "" }]);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const getEta = async () => {
    const data = await axios.get(
      `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&routeId=${props.routeId}&stopId=${props.stop.stopId}&language=zh`
    );

    if (!data.data.estimatedArrivals) {
      return;
    }
    setEta(data.data.estimatedArrivals);
  };

  useEffect(() => {
    if (props.stop) {
      getEta();
      const interval = setInterval(() => {
        getEta();
        setNow(Math.floor(Date.now() / 1000));
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  //Stop Modal
  const [modal, setModal] = useState(false);
  const openModalHandler = () => {
    setModal(true);
  };
  const closeModalHandler = () => {
    setModal(false);
  };

  return (
    <>
      <BackRoutesModal
        onClose={closeModalHandler}
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
      <Grid container spacing={0} onClick={openModalHandler}>
        <Grid item xs={8}>
          <div
            className={`${
              props.site === "fav" ? "badge-primary" : "badge-primary"
            } center display-75`}
          >
            {props.site === "fav" && (
              <span className="badge-secondary align-left">起點: </span>
            )}
            <span
              className={`${
                props.site === "fav" ? "display-7 p-1" : "display-75"
              }`}
            >
              {props.stop.stopName_c.replace(",", "").split(" ")[0]}
            </span>
          </div>
        </Grid>
        {eta.length > 0 && eta[0].estimatedArrivalTime ? (
          <Grid item xs={4}>
            {Math.floor(
              (Date.parse(eta[0].estimatedArrivalTime) / 1000 - now) / 60
            ) <= 0 ? (
              <span
                className={`badge-success-animate center ${
                  props.site === "fav" ? "p-1 display-7" : "display-75"
                }`}
              >
                到達
              </span>
            ) : Math.floor(
                (Date.parse(eta[0].estimatedArrivalTime) / 1000 - now) / 60
              ) ? (
              <div
                className={`${
                  Math.floor(
                    (Date.parse(eta[0].estimatedArrivalTime) / 1000 - now) / 60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } center ${
                  props.site === "fav" ? "display-7 p-1" : "display-75"
                }`}
              >
                {Math.floor(
                  (Date.parse(eta[0].estimatedArrivalTime) / 1000 - now) / 60
                )}
              </div>
            ) : (
              <span
                className={`badge-danger center ${
                  props.site === "fav" ? "display-7 p-1" : "display-75"
                }`}
              >
                未有服務
              </span>
            )}
          </Grid>
        ) : (
          <Grid item xs={4}>
            {/* <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box> */}
            <span className="badge-danger center display-75">未有服務</span>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default BackRoutesItemsNLBStop;
