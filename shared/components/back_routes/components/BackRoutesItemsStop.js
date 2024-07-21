import { Box, Grid, LinearProgress } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import BackRoutesModal from "./BackRoutesModal";

const BackRoutesItemsStop = (props) => {
  const [eta, setEta] = useState([{ eta: "" }]);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  const getEta = async () => {
    const data = await axios.get(
      `https://data.etabus.gov.hk/v1/transport/kmb/eta/${props.stop.stop}/${props.route}/1`
    );
    data.data.data[0] && setEta(data.data.data);
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
  }, [props.stop]);

  //Stop Modal
  const [modal, setModal] = useState(false);
  const openModalHandler = () => {
    setModal(true);
  };
  const closeModalHandler = () => {
    setModal(false);
  };

  //Get Bus Stop location
  const [long, setLong] = useState("");
  const [lat, setLat] = useState("");
  useEffect(() => {
    setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://data.etabus.gov.hk/v1/transport/kmb/stop/${props.stop.stop}`
        );
        setLong(res.data.data.long);
        setLat(res.data.data.lat);
      } catch (error) {}
    }, 0);
  }, [props.stop.stop]);
  return (
    <>
      <BackRoutesModal
        onClose={closeModalHandler}
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
              {props.stop.name_tc.replace(",", "").split(" ")[0]}
            </span>
          </div>
        </Grid>
        {eta[0].eta !== "" ? (
          <Grid item xs={4}>
            {Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) <= 0 ? (
              <span
                className={`badge-success-animate center ${
                  props.site === "fav" ? "display-7 p-1" : "display-75"
                }`}
              >
                到達
              </span>
            ) : Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) ? (
              <div
                className={`${
                  Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } center ${
                  props.site === "fav" ? "display-7 p-1" : "display-75"
                }`}
              >
                {Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60)}
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
