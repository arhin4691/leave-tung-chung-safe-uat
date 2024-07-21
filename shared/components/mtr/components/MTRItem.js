import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";

const MTRItem = (props) => {
  return (
    <>
      <Grid container spacing={0}>
        {props.data[`TCL-${props.station}`]["DOWN"] && (
          <>
            <Grid item xs={8}>
              <div
                className={`${
                  props.data[`TCL-${props.station}`]["DOWN"][0].ttnt <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } ${
                  props.data[`TCL-${props.station}`]["DOWN"][0].ttnt === "0" &&
                  "badge-success-animate"
                } display-7 center`}
              >
                <span>往 </span>
                <span className={`display-6 center`}>香港</span>
              </div>
              {props.data[`TCL-${props.station}`]["DOWN"].length > 1 && (
                <div className="badge-primary display-75 center">
                  <span>往 </span>
                  <span className="display-7 center">香港</span>
                </div>
              )}
              {props.data[`TCL-${props.station}`]["DOWN"].length > 2 && (
                <div className="badge-primary display-75 center">
                  <span>往 </span>
                  <span className="display-7 center">香港</span>
                </div>
              )}
              {props.data[`TCL-${props.station}`]["DOWN"].length > 3 && (
                <div className="badge-primary display-75 center">
                  <span>往 </span>
                  <span className="display-7 center">香港</span>
                </div>
              )}
            </Grid>
            <Grid item xs={4}>
              <div>
                {props.data[`TCL-${props.station}`]["DOWN"][0].ttnt === "0" ? (
                  <div className="badge-success-animate display-6 center">
                    開出
                  </div>
                ) : (
                  <div
                    className={`${
                      props.data[`TCL-${props.station}`]["DOWN"][0].ttnt <= 5
                        ? "badge-warning-animate"
                        : "badge-primary"
                    } display-6 center`}
                  >
                    {props.data[`TCL-${props.station}`]["DOWN"][0].ttnt}
                  </div>
                )}
              </div>
              {props.data[`TCL-${props.station}`]["DOWN"].length > 1 && (
                <div className="badge-primary display-7 center">
                  {props.data[`TCL-${props.station}`]["DOWN"][1].ttnt}
                </div>
              )}
              {props.data[`TCL-${props.station}`]["DOWN"].length > 2 && (
                <div className="badge-primary display-7 center">
                  {props.data[`TCL-${props.station}`]["DOWN"][2].ttnt}
                </div>
              )}
              {props.data[`TCL-${props.station}`]["DOWN"].length > 3 && (
                <div className="badge-primary display-7 center">
                  {props.data[`TCL-${props.station}`]["DOWN"][3].ttnt}
                </div>
              )}
            </Grid>
          </>
        )}
        {props.data[`TCL-${props.station}`]["UP"] &&
          props.data[`TCL-${props.station}`]["DOWN"] && (
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
        {props.data[`TCL-${props.station}`]["UP"] && (
          <>
            <Grid item xs={8}>
              <div
                className={`${
                  props.data[`TCL-${props.station}`]["UP"][0].ttnt <= 5
                    ? "badge-warning-animate"
                    : "badge-primary"
                } ${
                  props.data[`TCL-${props.station}`]["UP"][0].ttnt === "0" &&
                  "badge-success-animate"
                } display-7 center`}
              >
                <span>往 </span>
                <span className={`display-6 center`}>東涌</span>
              </div>
              {props.data[`TCL-${props.station}`]["UP"].length > 1 && (
                <div className="badge-primary display-75 center">
                  <span>往 </span>
                  <span className="display-7 center">東涌</span>
                </div>
              )}
              {props.data[`TCL-${props.station}`]["UP"].length > 2 && (
                <div className="badge-primary display-75 center">
                  <span>往 </span>
                  <span className="display-7 center">東涌</span>
                </div>
              )}
              {props.data[`TCL-${props.station}`]["UP"].length > 3 && (
                <div className="badge-primary display-75 center">
                  <span>往 </span>
                  <span className="display-7 center">東涌</span>
                </div>
              )}
            </Grid>
            <Grid item xs={4}>
              <div>
                {props.data[`TCL-${props.station}`]["UP"][0].ttnt === "0" ? (
                  <div className="badge-success-animate display-6 center">
                    開出
                  </div>
                ) : (
                  <div
                    className={`${
                      props.data[`TCL-${props.station}`]["UP"][0].ttnt <= 5
                        ? "badge-warning-animate"
                        : "badge-primary"
                    } display-6 center`}
                  >
                    {props.data[`TCL-${props.station}`]["UP"][0].ttnt}
                  </div>
                )}
              </div>
              {props.data[`TCL-${props.station}`]["UP"].length > 1 && (
                <div className="badge-primary display-7 center">
                  {props.data[`TCL-${props.station}`]["UP"][1].ttnt}
                </div>
              )}
              {props.data[`TCL-${props.station}`]["UP"].length > 2 && (
                <div className="badge-primary display-7 center">
                  {props.data[`TCL-${props.station}`]["UP"][2].ttnt}
                </div>
              )}
              {props.data[`TCL-${props.station}`]["UP"].length > 3 && (
                <div className="badge-primary display-7 center">
                  {props.data[`TCL-${props.station}`]["UP"][3].ttnt}
                </div>
              )}
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default MTRItem;
