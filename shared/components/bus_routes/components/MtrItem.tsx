"use client";

import { Grid } from "@mui/material";
import React, { useState, useEffect } from "react";

interface MtrScheduleEntry {
  ttnt: number | string;
  time: string;
  dest: string;
  plat: string;
}

interface MtrResult {
  sys_time: string;
  data: {
    sys_time: string;
    "TCL-TUC": {
      DOWN: MtrScheduleEntry[];
      curr_time: string;
      sys_time: string;
    };
  };
}

interface MtrItemProps {
  line: string;
  station: string;
}

const defaultResult: MtrResult = {
  sys_time: "-",
  data: {
    sys_time: "-",
    "TCL-TUC": { DOWN: [], curr_time: "-", sys_time: "-" },
  },
};

const MtrItem: React.FC<MtrItemProps> = (props) => {
  const [fetchURL, setFetchURL] = useState<string>("");
  const [result, setResult] = useState<MtrResult>(defaultResult);
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  useEffect(() => {
    setFetchURL(
      `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${props.line}&sta=${props.station}&lang=tc`
    );
  }, [now, props.line, props.station]);

  useEffect(() => {
    if (!fetchURL) return;
    fetch(fetchURL)
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch((error) => console.error(error));
  }, [fetchURL, now]);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 5000);
    return () => clearInterval(intervalID);
  }, [now]);

  const down = result?.data?.["TCL-TUC"]?.["DOWN"];
  const firstTtnt = down?.[0]?.ttnt;

  const content =
    result.sys_time === "-" || result.sys_time === undefined || !down ? (
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
              (firstTtnt as number) <= 5 ? "badge-warning-animate" : "badge-primary"
            } ${firstTtnt === "0" && "badge-success-animate"} display-7 center`}
          >
            <span>往 </span>
            <span className="display-6 center">香港</span>
          </div>
          {down.length > 1 && (
            <div className="badge-primary display-75 center">
              <span>往 </span>
              <span className="display-7 center">香港</span>
            </div>
          )}
          {down.length > 2 && (
            <div className="badge-primary display-75 center">
              <span>往 </span>
              <span className="display-7 center">香港</span>
            </div>
          )}
          {down.length > 3 && (
            <div className="badge-primary display-75 center">
              <span>往 </span>
              <span className="display-7 center">香港</span>
            </div>
          )}
        </Grid>
        <Grid item xs={4}>
          <div>
            {firstTtnt === "0" ? (
              <div className="badge-success-animate display-6 center">開出</div>
            ) : (
              <div
                className={`${
                  (firstTtnt as number) <= 5 ? "badge-warning-animate" : "badge-primary"
                } display-6 center`}
              >
                {firstTtnt}
              </div>
            )}
          </div>
          {down.length > 1 && (
            <div className="badge-primary display-7 center">{down[1].ttnt}</div>
          )}
          {down.length > 2 && (
            <div className="badge-primary display-7 center">{down[2].ttnt}</div>
          )}
          {down.length > 3 && (
            <div className="badge-primary display-7 center">{down[3].ttnt}</div>
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
