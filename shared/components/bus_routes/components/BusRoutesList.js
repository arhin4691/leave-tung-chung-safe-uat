import { Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import BusRoutesItem from "./BusRoutesItem";
import BusRoutesNlbItem from "./BusRoutesNlbItem";

const BusRoutesList = (props) => {
  const [open, setOpen] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [searchedData, setSearchedData] = useState([]);
  const [searchedNlbData, setSearchedNlbData] = useState([]);
  useEffect(() => {
    setSearchedData(
      [...props.routes].filter(
        (x) =>
          x.busRoute.toUpperCase().includes(props.keyword.toUpperCase()) ||
          x.to.toString().toUpperCase().includes(props.keyword.toUpperCase()) ||
          x.routeStop
            .toString()
            .toUpperCase()
            .includes(props.keyword.toUpperCase())
      )
    );
    setSearchedNlbData(
      [...props.nlbRoutes].filter(
        (x) =>
          x.busRoute.toUpperCase().includes(props.keyword.toUpperCase()) ||
          x.to.toString().toUpperCase().includes(props.keyword.toUpperCase()) ||
          x.routeStop
            .toString()
            .toUpperCase()
            .includes(props.keyword.toUpperCase())
      )
    );
    if (props.keyword === "") {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [props.keyword]);

  const openHandler = () => {
    setOpen(!open);
    setOpenMap(false);
  };
  const mapHandler = () => {
    //window.open(props.location);
    setOpenMap(!openMap);
    setOpen(false);
  };

  return (
    <>
      {searchedData.length < 1 && searchedNlbData < 1 ? (
        <></>
      ) : (
        <div className="white-background m-1 mt-1 p-1">
          <div className="p-1 center white-background sticky">
            <Grid container spacing={0}>
              <Grid item xs={2}>
                <span
                  className="badge-secondary display-6"
                  onClick={openHandler}
                >
                  🚌
                </span>
              </Grid>
              <Grid item xs={8}>
                <span
                  className="banner badge-primary-super p-1 display-8 center ms-1"
                  onClick={openHandler}
                >
                  {props.stopName}
                </span>
              </Grid>
              <Grid item xs={2}>
                <span
                  className="badge-secondary display-6"
                  onClick={mapHandler}
                >
                  🗺️
                </span>
              </Grid>
            </Grid>
          </div>
          {open && (
            <div>
              <Grid container spacing={0}>
                {props.keyword === ""
                  ? props.nlbRoutes.map((x) => {
                      return (
                        <Grid item xs={12} md={6} lg={4} xl={3}>
                          <BusRoutesNlbItem data={x} key={x.busRoute} />
                        </Grid>
                      );
                    })
                  : searchedNlbData.map((x) => {
                      return (
                        <Grid item xs={12} md={6} lg={4} xl={3}>
                          <BusRoutesNlbItem data={x} key={x.busRoute} />
                        </Grid>
                      );
                    })}
                {props.keyword === ""
                  ? props.routes.map((x) => {
                      return (
                        <Grid item xs={12} md={6} lg={4} xl={3}>
                          <BusRoutesItem data={x} key={x.busRoute} />
                        </Grid>
                      );
                    })
                  : searchedData.map((x) => {
                      return (
                        <Grid item xs={12} md={6} lg={4} xl={3}>
                          <BusRoutesItem data={x} key={x.busRoute} />
                        </Grid>
                      );
                    })}
                {searchedData.length < 1 && searchedNlbData < 1 && (
                  <span className="badge-reverse center">
                    😨搵唔到相關巴士路線
                  </span>
                )}
              </Grid>
            </div>
          )}
          {openMap && (
            <div
              id="canvas-for-googlemap"
              style={{ height: "100%", width: "100%", maxWidth: "100%" }}
            >
              <iframe
                title={props.stopName}
                src={props.location}
                style={{ border: 0, width: "100%" }}
                allowfullscreen="false"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default BusRoutesList;
