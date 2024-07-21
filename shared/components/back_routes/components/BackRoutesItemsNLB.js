import { Grid } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import BackRoutesItemsNLBStop from "./BackRoutesItemsNLBStop";
import Card from "../../ui/Card";

const BackRoutesItemsNLB = (props) => {
  const LogoNLB = "/files/images/logo_nlb.png";
  const [stops, setStops] = useState([{ stopId: "111" }]);
  const [open, setOpen] = useState(false);
  const toggleHandler = () => {
    setOpen(!open);
  };

  //Finished Marker
  const [isStopsLoaded, setIsStopsLoaded] = useState(false);
  const [isOnlyStopsLoaded, setIsOnlyStopsLoaded] = useState(false);

  //Get via stops
  useEffect(() => {
    stops.length < 2 &&
      setTimeout(async () => {
        const data = await axios.get(
          `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=list&routeId=${props.routeId}`
        );
        setStops(data.data.stops);
      }, 0);
    stops.length > 2 && setIsStopsLoaded(true);
  }, [stops]);

  //Check Status
  const [isWorking, setIsWorking] = useState(false);
  useEffect(() => {
    setTimeout(async () => {
      const data = await axios.get(
        `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&routeId=${
          props.routeId
        }&stopId=${stops[stops.length - 1].stopId}&language=zh`
      );
      if (data.data.estimatedArrivals) {
        if (data.data.estimatedArrivals.length > 0) {
          setIsWorking(true);
        }
      }
    }, 0);
  }, [isStopsLoaded]);

  return (
    <>
      <Card classNames="p-1">
        <Grid container spacing={0} onClick={toggleHandler}>
          <Grid container spacing={0}>
            <Grid item xs={9}>
              <span className={`display-75 badge-primary-super align-left`}>
                <span className="display-9">往　</span>{" "}
                {stops.length > 0 && stops[stops.length - 1].stopName_c}
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
            <span className={`badge-success display-7 center`}>
              <Image src={LogoNLB} width={20} height={20} alt="NLB Logo" />
              {props.route}
            </span>
          </Grid>
          <Grid item xs={9}>
            <span className={`badge-primary align-left`}>
              <span className="display-8"> ➤ 由</span>{" "}
              <span className="display-7">
                {stops.length > 0 && stops[0].stopName_c}{" "}
              </span>
              <span className="display-8">開出</span>
            </span>
            <span className={"align-right text-primary display-6"}>
              {open ? "△" : "▽"}
            </span>
          </Grid>
        </Grid>
        {open && (
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <Card disable classNames="p-2">
                {stops.length > 0 &&
                  stops.map((x) => (
                    <BackRoutesItemsNLBStop
                      stop={x}
                      route={props.route}
                      terminus={stops.slice(-1)}
                      routeId={props.routeId}
                      key={x}
                      mode={"nlb"}
                      company="nlb"
                    />
                  ))}
              </Card>
            </Grid>
          </Grid>
        )}
      </Card>
    </>
  );
};

export default BackRoutesItemsNLB;
