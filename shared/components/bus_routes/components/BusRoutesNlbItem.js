import { Grid } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import BusModal from "./BusModal";

const BusRoutesNlbItem = (props) => {
  const [fetchURL, setFetchURL] = useState({});
  const [result, setResult] = useState({ estimatedArrivals: "Loading" });
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    setFetchURL(
      `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&routeId=${props.data.routeId}&stopId=${props.data.busStop}&language=zh`
    );
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
      {result.estimatedArrivals.length > 0 && (
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
                <div className={`center display-6 badge-success-super`}>
                  {props.data.busRoute}
                </div>
                <div>
                  {props.data.to.map((x) => (
                    <div className="display-9 badge-success-outline">{x}</div>
                  ))}
                </div>
              </Grid>
              <Grid item xs={9}>
                <Grid container spacing={0}>
                  <Grid item xs={8}>
                    <div
                      className={`${
                        Math.floor(
                          (Date.parse(
                            result.estimatedArrivals[0].estimatedArrivalTime
                          ) /
                            1000 -
                            now) /
                            60
                        ) > 0 &&
                        Math.floor(
                          (Date.parse(
                            result.estimatedArrivals[0].estimatedArrivalTime
                          ) /
                            1000 -
                            now) /
                            60
                        ) <= 5
                          ? "badge-warning-animate"
                          : "badge-primary"
                      } ${
                        Math.floor(
                          (Date.parse(
                            result.estimatedArrivals[0].estimatedArrivalTime
                          ) /
                            1000 -
                            now) /
                            60
                        ) <= 0 && "badge-success-animate"
                      } center display-75`}
                    >
                      往{" "}
                      <span className="display-7 center">
                        {props.data.to[props.data.to.length - 1]}
                      </span>
                    </div>
                    {result.estimatedArrivals.length > 1 && (
                      <div className="badge-primary display-8 center">
                        往{" "}
                        <span className="display-75 center">
                          {props.data.to[props.data.to.length - 1]}
                        </span>
                      </div>
                    )}
                    {result.estimatedArrivals.length > 2 && (
                      <div className="badge-primary display-8 center">
                        往{" "}
                        <span className="display-75 center">
                          {props.data.to[props.data.to.length - 1]}
                        </span>
                      </div>
                    )}
                  </Grid>
                  <Grid item xs={4}>
                    <div>
                      {result.estimatedArrivals[0].eta === null ? (
                        <span className="badge-danger center display-7">
                          未開
                        </span>
                      ) : Math.floor(
                          (Date.parse(
                            result.estimatedArrivals[0].estimatedArrivalTime
                          ) /
                            1000 -
                            now) /
                            60
                        ) <= 0 ? (
                        <span className="badge-success-animate center display-7">
                          到達
                        </span>
                      ) : (
                        <div
                          className={`${
                            Math.floor(
                              (Date.parse(
                                result.estimatedArrivals[0].estimatedArrivalTime
                              ) /
                                1000 -
                                now) /
                                60
                            ) <= 5
                              ? "badge-warning-animate"
                              : "badge-primary"
                          } center display-7`}
                        >
                          {Math.floor(
                            (Date.parse(
                              result.estimatedArrivals[0].estimatedArrivalTime
                            ) /
                              1000 -
                              now) /
                              60
                          )}
                        </div>
                      )}
                    </div>
                    {result.estimatedArrivals.length > 1 && (
                      <div className="badge-primary center display-75">
                        {Math.floor(
                          (Date.parse(
                            result.estimatedArrivals[1].estimatedArrivalTime
                          ) /
                            1000 -
                            now) /
                            60
                        )}
                      </div>
                    )}
                    {result.estimatedArrivals.length > 2 && (
                      <div className="badge-primary center display-75">
                        {Math.floor(
                          (Date.parse(
                            result.estimatedArrivals[2].estimatedArrivalTime
                          ) /
                            1000 -
                            now) /
                            60
                        )}
                      </div>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              {props.data.spec.map((x) => (
                <span className="badge-primary-outline display-9">{x}</span>
              ))}
            </Grid>
          </div>
        </>
      )}

      {result.estimatedArrivals.length <= 0 && (
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
              <div className={`center display-6 badge-success-super`}>
                {props.data.busRoute}
              </div>
              <div>
                {props.data.to.map((x) => (
                  <div className="display-9 badge-success-outline">{x}</div>
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
              <span className="badge-primary-outline display-9">{x}</span>
            ))}
          </Grid>
        </div>
      )}
    </>
  );
};

export default BusRoutesNlbItem;
