import { Box, Grid, LinearProgress } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import BackRoutesItemsCTBStop from "./BackRoutesItemsCTBStop";
import Card from "../../ui/Card";

const BackRoutesItemsCTB = (props) => {
  const LogoCTB = "/files/images/logo_ctb.png";

  const [stops, setStops] = useState([]);
  const [onlyStops, setOnlyStops] = useState([]);
  const [routeStops, setRouteStops] = useState([]);

  const [open, setOpen] = useState(false);
  const toggleHandler = () => {
    setOpen(!open);
  };

  //Finished Marker
  const [isStopsLoaded, setIsStopsLoaded] = useState(false);
  const [isOnlyStopsLoaded, setIsOnlyStopsLoaded] = useState(false);

  //Get via stops
  useEffect(() => {
    stops.length < 1 &&
      setTimeout(async () => {
        const data = await axios.get(
          // `https://rt.data.gov.hk/v2/transport/citybus/route-stop/ctb/${props.route}/${props.type}`
          `https://rt.data.gov.hk/v2/transport/citybus/route-stop/ctb/${
            props.route
          }/${props.mode === "reverse" ? "outbound" : "inbound"}`
        );
        setStops(data.data.data);
      }, 0);
    stops.length > 1 && setIsStopsLoaded(true);
  }, [stops.length]);

  //Get only stop

  useEffect(() => {
    //let arr = [];
    //Keep only stop id
    const keep = ["stop"];
    const array = (arr) => arr.map((x) => x[keep]);
    if (isStopsLoaded) {
      // for (const stop of stops) {
      //   arr.push(stop.stop);
      // }
      // setOnlyStops(arr);

      //arr.length > 0 && setIsOnlyStopsLoaded(true);
      setOnlyStops(array(stops));
      setIsOnlyStopsLoaded(true);
    }
  }, [isStopsLoaded]);

  //Get stop chn name

  useEffect(() => {
    //Keep only stop id
    open &&
      setTimeout(async () => {
        let arr = [];
        for (let i = 0; i < onlyStops.length; i++) {
          const response = await axios.get(
            `https://rt.data.gov.hk/v2/transport/citybus/stop/${onlyStops[i]}`
          );
          arr.push(response);
        }
        setRouteStops(arr);
      }, 0);
  }, [isOnlyStopsLoaded, open]);

  //Check Start End
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState({ data: { stop: "0001" } });
  useEffect(() => {
    setTimeout(async () => {
      const responseStart = await axios.get(
        `https://rt.data.gov.hk/v2/transport/citybus/stop/${onlyStops[0]}`
      );
      setStart(responseStart.data.data.name_tc);
      const responseEnd = await axios.get(
        `https://rt.data.gov.hk/v2/transport/citybus/stop/${
          onlyStops[onlyStops.length - 1]
        }`
      );
      setEnd(responseEnd.data.data.name_tc);
      setStatus(responseEnd.data);
    }, 0);
  }, [isOnlyStopsLoaded]);

  //Check Status
  const [isWorking, setIsWorking] = useState(false);
  useEffect(() => {
    setTimeout(async () => {
      const data = await axios.get(
        `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/${status.data.stop}/${props.route}`
      );

      //Logic for  Direction
      if (props.mode === "reverse") {
        for (const i of data.data.data) {
          if (i.eta === "" || i.eta === null) {
            return;
          }
          if (i.dir === "O") {
            setIsWorking(true);
          }
        }
      } else {
        for (const i of data.data.data) {
          if (i.eta === "" || i.eta === null) {
            return;
          }
          if (i.dir === "I") {
            setIsWorking(true);
          }
        }
      }
    }, 0);
  }, [start, end]);
  return (
    <>
      {stops.length ? (
        <Card classNames={`p-1`}>
          <Grid container spacing={0} onClick={toggleHandler}>
            <Grid container spacing={0}>
              <Grid item xs={9}>
                <span className={`display-75 badge-primary-super align-left`}>
                  <span className="display-9">往　</span> {props.end}
                  {/* {routeStops.length > 0 &&
                  routeStops[routeStops.length - 1].data.data.name_tc} */}
                </span>
              </Grid>
              <Grid item xs={3}>
                <span
                  className={`${
                    isWorking ? "badge-success-animate" : "badge-danger"
                  } display-75 align-right`}
                >
                  {isWorking ? "提供服務" : "未有服務"}
                </span>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <span className={`badge-ctb display-7 center`}>
                <Image src={LogoCTB} width={20} height={20} alt="CTB Logo" />
                {props.route}
              </span>
            </Grid>
            <Grid item xs={9}>
              <span className={`badge-primary align-left`}>
                <span className="display-8"> ➤ 由 </span>
                <span className="display-7">
                  {props.start}
                  {/* {routeStops[0].data.data.name_tc} */}
                </span>
                <span className="display-8">開出</span>
              </span>
              <span
                className={"align-right text-primary display-6"}
                onClick={toggleHandler}
              >
                {open ? "△" : "▽"}
              </span>
            </Grid>
          </Grid>
          {open && (
            <>
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <Card disable classNames="p-2">
                    {routeStops.length > 0 ? (
                      routeStops.map((x) => (
                        <BackRoutesItemsCTBStop
                          stop={x.data.data}
                          route={props.route}
                          type={props.type}
                          terminus={routeStops.slice(-1)}
                          key={x}
                          mode={props.mode}
                        />
                      ))
                    ) : (
                      <Box>
                        <LinearProgress />
                        <span className="text-primary center">正在為你準備列表</span>
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </Card>
      ) : (
        ""
      )}
    </>
  );
};

export default BackRoutesItemsCTB;
