import { Grid } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";

const MtrItem = (props) => {
  const [fetchURL, setFetchURL] = useState({});
  const [result, setResult] = useState({
    sys_time: "-",
    data: {
      sys_time: "-",
      "TCL-TUC": { DOWN: undefined, curr_time: "-", sys_time: "-" },
    },
  });
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    setFetchURL(
      `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${props.line}&sta=${props.station}&lang=tc`
    );
  }, [now]);
  useEffect(() => {
    axios(fetchURL)
      .then((response) => setResult(response.data))
      .catch((error) => console.log(error));
  }, [fetchURL, now]);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 5000);

    return () => clearInterval(intervalID);
  }, [now]);

  const content =
    result.sys_time === "-" || result.sys_time === undefined ? (
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <span className="badge-warning-animate">
            由於港鐵系統錯誤, 預計到達時間暫停
          </span>
        </Grid>
      </Grid>
    ) : (
      <Grid container spacing={0}>
        <Grid item xs={8}>
          <div
            className={`${
              result.data["TCL-TUC"]["DOWN"][0].ttnt <= 5
                ? "badge-warning-animate"
                : "badge-primary"
            } ${
              result.data["TCL-TUC"]["DOWN"][0].ttnt === "0" &&
              "badge-success-animate"
            } display-7 center`}
          >
            <span>往 </span>
            <span className={`display-6 center`}>香港</span>
          </div>
          {result.data["TCL-TUC"]["DOWN"].length > 1 && (
            <div className="badge-primary display-75 center">
              <span>往 </span>
              <span className="display-7 center">香港</span>
            </div>
          )}
          {result.data["TCL-TUC"]["DOWN"].length > 2 && (
            <div className="badge-primary display-75 center">
              <span>往 </span>
              <span className="display-7 center">香港</span>
            </div>
          )}
          {result.data["TCL-TUC"]["DOWN"].length > 3 && (
            <div className="badge-primary display-75 center">
              <span>往 </span>
              <span className="display-7 center">香港</span>
            </div>
          )}
        </Grid>
        <Grid item xs={4}>
          <div>
            {result.data["TCL-TUC"]["DOWN"][0].ttnt === "0" ? (
              <div className="badge-success-animate display-6 center">開出</div>
            ) : (
              <div
                className={`${
                  result.data["TCL-TUC"]["DOWN"][0].ttnt <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } display-6 center`}
              >
                {result.data["TCL-TUC"]["DOWN"][0].ttnt}
              </div>
            )}
          </div>
          {result.data["TCL-TUC"]["DOWN"].length > 1 && (
            <div className="badge-primary display-7 center">
              {result.data["TCL-TUC"]["DOWN"][1].ttnt}
            </div>
          )}
          {result.data["TCL-TUC"]["DOWN"].length > 2 && (
            <div className="badge-primary display-7 center">
              {result.data["TCL-TUC"]["DOWN"][2].ttnt}
            </div>
          )}
          {result.data["TCL-TUC"]["DOWN"].length > 3 && (
            <div className="badge-primary display-7 center">
              {result.data["TCL-TUC"]["DOWN"][3].ttnt}
            </div>
          )}
        </Grid>
      </Grid>
    );
  return (
    <Grid container spacing={0}>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <div className="white-background m-2 p-2">
          <Grid container spacing={0}>
            <Grid item xs={3}>
              <div className="center display-6 badge-kmb">東涌</div>
              <div className="center display-75 badge-secondary">
                <span>🚇</span>MTR
              </div>
            </Grid>
            <Grid item xs={9}>
              {content}
            </Grid>
            <span className="badge-primary-outline display-9">
              星期一至日 0602 - 24:43
            </span>
          </Grid>
        </div>
      </Grid>
    </Grid>
  );
};

export default MtrItem;
