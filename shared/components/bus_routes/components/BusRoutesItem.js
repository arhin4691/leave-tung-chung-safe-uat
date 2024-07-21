import { Grid } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import BusModal from "./BusModal";

const BusRoutesItem = (props) => {
  const [fetchURL, setFetchURL] = useState({});
  const [result, setResult] = useState({ data: "Loading" });
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (props.data.type === "kmb") {
      setFetchURL(
        `https://data.etabus.gov.hk/v1/transport/kmb/eta/${props.data.busStop}/${props.data.busRoute}/1`
      );
    } else if (props.data.type === "ctb") {
      setFetchURL(
        `https://rt.data.gov.hk/v2/transport/citybus/eta/ctb/${props.data.busStop}/${props.data.busRoute}`
      );
    } else if (props.data.type === "nlb") {
      setFetchURL(
        `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&routeId=${props.data.routeId}&stopId=${props.data.busStop}&language=zh`
      );
    }
  }, [now]);

  useEffect(() => {
    axios(fetchURL)
      .then((response) => setResult(response.data))
      .catch((error) => {});
  }, [fetchURL, now]);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 5000);

    return () => clearInterval(intervalID);
  }, [now]);

  const [detailModal, setDetailModal] = useState(false);
  const detailModalHandler = () => {
    setDetailModal(!detailModal);
  };
  return (
    <>
      {detailModal && (
        <BusModal onClose={detailModalHandler} data={props.data} />
      )}
      {result.data.length > 0 && (
        <>
          <div
            className="white-background-animated m-2 p-2"
            onClick={detailModalHandler}
          >
            {props.site === "fav" && (
              <span className="badge-primary-super display-8">
                {props.data.routeStop[0]}
              </span>
            )}
            <Grid container spacing={0}>
              <Grid item xs={3}>
                <div
                  className={`center display-6 ${
                    result.data[0].co === "KMB" && "badge-kmb"
                  }
                ${result.data[0].co === "CTB" && "badge-ctb"}`}
                >
                  {result.data[0].route}
                </div>
                <div>
                  {props.data.to.map((x) => (
                    <div className="display-9 badge-success-outline" key={x.route}>{x}</div>
                  ))}
                </div>
              </Grid>
              <Grid item xs={9}>
                <Grid container spacing={0}>
                  <Grid item xs={8}>
                    <div
                      className={`${
                        Math.floor(
                          (Date.parse(result.data[0].eta) / 1000 - now) / 60
                        ) > 0 &&
                        Math.floor(
                          (Date.parse(result.data[0].eta) / 1000 - now) / 60
                        ) <= 5
                          ? "badge-warning-animate"
                          : "badge-primary"
                      } ${
                        Math.floor(
                          (Date.parse(result.data[0].eta) / 1000 - now) / 60
                        ) <= 0 && "badge-success-animate"
                      } center display-75`}
                    >
                      往{" "}
                      <span className="display-7 center">
                        {result.data[0].dest_tc}
                      </span>
                    </div>
                    {result.data.length > 1 && (
                      <div className="badge-primary display-8 center">
                        往{" "}
                        <span className="display-75 center">
                          {result.data[1].dest_tc}
                        </span>
                      </div>
                    )}
                    {result.data.length > 2 && (
                      <div className="badge-primary display-8 center">
                        往{" "}
                        <span className="display-75 center">
                          {result.data[2].dest_tc}
                        </span>
                      </div>
                    )}
                  </Grid>
                  <Grid item xs={4}>
                    <div>
                      {result.data[0].eta === null ? (
                        <span className="badge-danger center display-7">
                          未開
                        </span>
                      ) : Math.floor(
                          (Date.parse(result.data[0].eta) / 1000 - now) / 60
                        ) <= 0 ? (
                        <span className="badge-success-animate center display-7">
                          到達
                        </span>
                      ) : (
                        <div
                          className={`${
                            Math.floor(
                              (Date.parse(result.data[0].eta) / 1000 - now) / 60
                            ) <= 5
                              ? "badge-warning-animate"
                              : "badge-primary"
                          } center display-7`}
                        >
                          {Math.floor(
                            (Date.parse(result.data[0].eta) / 1000 - now) / 60
                          )}
                        </div>
                      )}
                    </div>
                    {result.data.length > 1 && (
                      <div className="badge-primary center display-75">
                        {Math.floor(
                          (Date.parse(result.data[1].eta) / 1000 - now) / 60
                        )}
                      </div>
                    )}
                    {result.data.length > 2 && (
                      <div className="badge-primary center display-75">
                        {Math.floor(
                          (Date.parse(result.data[2].eta) / 1000 - now) / 60
                        )}
                      </div>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              {props.data.spec.map((x) => (
                <span className="badge-primary-outline display-9" key={x.route}>{x}</span>
              ))}
            </Grid>
          </div>
        </>
      )}
      {result.data.length <= 0 && (
        <div
          className="white-background-animated m-2 p-2"
          onClick={detailModalHandler}
        >
          {props.site === "fav" && (
            <span className="badge-primary-super display-8">
              {props.data.routeStop[0]}
            </span>
          )}
          <Grid container spacing={0}>
            <Grid item xs={3}>
              <div
                className={`center display-6 ${
                  props.data.type === "kmb" && "badge-kmb"
                }
                ${props.data.type === "ctb" && "badge-ctb"}`}
              >
                {props.data.busRoute}
              </div>
              <div>
                {props.data.to.map((x) => (
                  <div className="display-9 badge-success-outline" key={x.route}>{x}</div>
                ))}
              </div>
            </Grid>
            <Grid item xs={9}>
              <Grid container spacing={0}>
                <Grid item xs={8}>
                  <div className="badge-primary center display-75">
                    往{" "}
                    <span className="display-7 center">
                      {props.data.to[props.data.to.length - 1]}
                    </span>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div>
                    <span className="badge-danger center display-7">未開</span>
                  </div>
                </Grid>
              </Grid>
            </Grid>
            {props.data.spec.map((x) => (
              <span className="badge-primary-outline display-9" key={x.route}>{x}</span>
            ))}
          </Grid>
        </div>
      )}
    </>
  );
};

export default BusRoutesItem;
