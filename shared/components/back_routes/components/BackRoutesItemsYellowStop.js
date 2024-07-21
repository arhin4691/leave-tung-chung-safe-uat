import axios from "axios";
import React, { useEffect, useState } from "react";
import BackRoutesYellowStopModal from "./BackRoutesYellowStopModal";
import { Grid } from "@mui/material";

const BackRoutesItemsYellowStop = (props) => {
  const [modal, setModal] = useState(false);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  //Fetch eta
  const [eta, setEta] = useState([]);
  const [locate, setLocate] = useState([]);
  const fetchStopEta = async () => {
    try {
      const res = await axios.get(
        `https://360-api.socif.co/api/eta/route-stop/${props.routeId}/${props.routeSeq}`
      );
      setEta(res.data.data.eta);
      const locateRes = await axios.get(
        `https://360-api.socif.co/api/stop/${props.stopId}`
      );
      setLocate(locateRes.data.data.coordinates.wgs84);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchStopEta();
    const interval = setInterval(() => {
      fetchStopEta();
      setNow(Math.floor(Date.now() / 1000));
    }, 20000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  //Fetch Stop Seq
  const [data, setData] = useState([]);
  const fetchForFav = async () => {
    try {
      const res = await axios.get(
        `https://360-api.socif.co/api/route-stop/${props.routeId}/${props.routeSeq}`
      );
      setData(res.data.data.route_stops);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchForFav();
  }, []);
  return (
    <>
      <BackRoutesYellowStopModal
        onClose={() => setModal(false)}
        stop={data[props.stopSeq - 1]?.name_tc}
        stopId={data[props.stopSeq - 1]?.stop_id}
        stopSeq={props.stopSeq}
        route={props.site === "fav" ? props.route: props.routeCode}
        routeId={props.routeId}
        routeSeq={props.routeSeq}
        termName={props.termName}
        orgName={props.orgName}
        eta={eta[props.stopSeq - 1]}
        mode={"yb"}
        site={props.site}
        lat={locate.latitude}
        long={locate.longitude}
        show={modal}
        company={"yb"}
      />
      <Grid container spacing={0} onClick={() => setModal(true)}>
        <Grid item xs={8}>
          <div className="badge-primary center display-75">
            {props.site === "fav" && (
              <span className="badge-secondary align-left">起點: </span>
            )}

            <span
              className={`${
                props.site === "fav" ? "display-7 p-1" : "display-75"
              }`}
            >
              {data[props.stopSeq - 1]?.name_tc}
            </span>
          </div>
        </Grid>
        {eta[props.stopSeq - 1]?.eta !== "" ? (
          <Grid item xs={4}>
            {Math.floor(
              (Date.parse(eta[props.stopSeq - 1]?.eta[0].timestamp) / 1000 -
                now) /
                60
            ) <= 0 ? (
              <span
                className={`badge-success-animate center ${
                  props.site === "fav" ? "display-7 p-1" : "display-75"
                }`}
              >
                到達
              </span>
            ) : Math.floor(
                (Date.parse(eta[props.stopSeq - 1]?.eta[0].timestamp) / 1000 -
                  now) /
                  60
              ) ? (
              <div
                className={`${
                  Math.floor(
                    (Date.parse(eta[props.stopSeq - 1]?.eta[0].timestamp) /
                      1000 -
                      now) /
                      60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } center ${
                  props.site === "fav" ? "display-7 p-1" : "display-75"
                }`}
              >
                {Math.floor(
                  (Date.parse(eta[props.stopSeq - 1]?.eta[0].timestamp) / 1000 -
                    now) /
                    60
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
