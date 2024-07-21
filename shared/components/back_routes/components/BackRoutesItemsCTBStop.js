import { Box, Grid, LinearProgress } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import BackRoutesModal from "./BackRoutesModal";

const BackRoutesItemsCTBStop = (props) => {
  const [eta, setEta] = useState([{ eta: "" }]);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  const getEta = async () => {
    const data = await axios.get(
      `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/${props.stop.stop}/${props.route}`
    );
    setEta(data.data.data);
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

  //Get Bus Stop location
  const [long, setLong] = useState("");
  const [lat, setLat] = useState("");
  useEffect(() => {
    setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://rt.data.gov.hk/v2/transport/citybus/stop/${props.stop.stop}`
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
        terminus={
          props.site === "fav" ? props.terminus.data : props.terminus[0].data
        }
        eta={eta}
        mode={"ctb"}
        site={props.site}
        lat={lat}
        long={long}
        reverse={props.mode === "reverse"}
        show={modal}
        company={"ctb"}
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
              {props.stop?.name_tc?.replace(",", "").split(" ")[0]}
            </span>
          </div>
        </Grid>
        {eta.length > 0 ? (
          <Grid item xs={4}>
            {Math.floor((Date.parse(eta[0].eta) / 1000 - now) / 60) <= 0 ? (
              <span
                className={`badge-success-animate center ${
                  props.site === "fav" ? "display-7" : "display-75"
                }`}
              >
                到達
                {/* {props.site !== "fav" && props.mode === "reverse"
                  ? eta[0].dir === "O" && props.route !== "E22S" && "回程車"
                  : eta[0].dir === "I" && props.route !== "E22S" && "回程車"} */}
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
                } center ${
                  props.site === "fav" ? "p-1 display-7" : "display-75"
                }`}
              >
                <span>
                  {props.mode !== "reverse" ? (
                    <>
                      {props.site !== "fav" && eta[0].dir === "O" ? (
                        <span className="display-9">
                          {Math.floor(
                            (Date.parse(eta[0].eta) / 1000 - now) / 60
                          )}{" "}
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
                          {Math.floor(
                            (Date.parse(eta[0].eta) / 1000 - now) / 60
                          )}{" "}
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
