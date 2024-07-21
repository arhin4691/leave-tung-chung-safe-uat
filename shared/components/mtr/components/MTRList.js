import { Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import MTRItem from "./MTRItem";
import Card from "../../ui/Card";

const MTRList = (props) => {
  return (
    <>
      <Grid container spacing={0}>
        {props.data.map((x, index) => (
          <Grid item xs={12} md={6} lg={4} xl={3} key={index}>
            <Card>
              <Grid container spacing={0}>
                <Grid item xs={3}>
                  <div className="center display-6 badge-primary-super">
                    {props.stationsName[index]}
                  </div>
                  <div className="center display-75 badge-secondary">
                    <span>🚇</span>MTR
                  </div>
                  <div className="center display-7 badge-kmb">東涌線</div>
                </Grid>
                <Grid item xs={9}>
                  <MTRItem
                    data={x}
                    index={index}
                    station={props.stationList[index]}
                  />
                </Grid>
              </Grid>
              <span className="badge-primary-outline display-9">
                星期一至日 0602 - 24:43
              </span>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default MTRList;
