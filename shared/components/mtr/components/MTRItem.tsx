"use client";

import { Grid } from "@mui/material";
import React from "react";

interface MTRItemProps {
  data: any;
  index: number;
  station: string;
}

const MTRItem: React.FC<MTRItemProps> = (props) => {
  const stationData = props.data[`TCL-${props.station}`];
  const down = stationData?.["DOWN"];
  const up = stationData?.["UP"];

  return (
    <>
      <Grid container spacing={0}>
        {down && (
          <>
            <Grid item xs={8}>
              <div
                className={`${down[0].ttnt <= 5 ? "badge-warning-animate" : "badge-primary"} ${
                  down[0].ttnt === "0" ? "badge-success-animate" : ""
                } display-7 center`}
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
                {down[0].ttnt === "0" ? (
                  <div className="badge-success-animate display-6 center">開出</div>
                ) : (
                  <div
                    className={`${down[0].ttnt <= 5 ? "badge-warning-animate" : "badge-primary"} display-6 center`}
                  >
                    {down[0].ttnt}
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
          </>
        )}
        {up && down && (
          <Grid item xs={12}>
            <Grid container spacing={0}>
              <Grid item xs={5}>
                <hr />
              </Grid>
              <Grid item xs={2}>
                <span className="center">
                  <hr />
                </span>
              </Grid>
              <Grid item xs={5}>
                <hr />
              </Grid>
            </Grid>
          </Grid>
        )}
        {up && (
          <>
            <Grid item xs={8}>
              <div
                className={`${up[0].ttnt <= 5 ? "badge-warning-animate" : "badge-primary"} ${
                  up[0].ttnt === "0" ? "badge-success-animate" : ""
                } display-7 center`}
              >
                <span>往 </span>
                <span className="display-6 center">東涌</span>
              </div>
              {up.length > 1 && (
                <div className="badge-primary display-75 center">
                  <span>往 </span>
                  <span className="display-7 center">東涌</span>
                </div>
              )}
              {up.length > 2 && (
                <div className="badge-primary display-75 center">
                  <span>往 </span>
                  <span className="display-7 center">東涌</span>
                </div>
              )}
              {up.length > 3 && (
                <div className="badge-primary display-75 center">
                  <span>往 </span>
                  <span className="display-7 center">東涌</span>
                </div>
              )}
            </Grid>
            <Grid item xs={4}>
              <div>
                {up[0].ttnt === "0" ? (
                  <div className="badge-success-animate display-6 center">開出</div>
                ) : (
                  <div
                    className={`${up[0].ttnt <= 5 ? "badge-warning-animate" : "badge-primary"} display-6 center`}
                  >
                    {up[0].ttnt}
                  </div>
                )}
              </div>
              {up.length > 1 && (
                <div className="badge-primary display-7 center">{up[1].ttnt}</div>
              )}
              {up.length > 2 && (
                <div className="badge-primary display-7 center">{up[2].ttnt}</div>
              )}
              {up.length > 3 && (
                <div className="badge-primary display-7 center">{up[3].ttnt}</div>
              )}
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default MTRItem;
