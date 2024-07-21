import { Grid } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import BackRoutesItemsStop from "./BackRoutesItemsStop";
import BackRoutesModal from "./BackRoutesModal";
import Card from "../../ui/Card";

const BackRoutesItems = (props) => {
  const LogoLWB = "/files/images/logo_lwb.png";
  const [stops, setStops] = useState([]);
  const [onlyStops, setOnlyStops] = useState([]);
  const [routeStops, setRouteStops] = useState([]);

  //Keep only stop id
  const keep = ["stop"];
  const array = (arr) => arr.map((x) => x[keep]);

  //Get kmb via stops
  useEffect(() => {
    stops.length < 1 &&
      setTimeout(async () => {
        const data = await axios.get(
          // `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${props.route}/${props.type}/1`
          `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${
            props.route
          }/${props.type === "O" ? "outbound" : "inbound"}/1`
        );
        setStops(data.data.data);
      }, 0);
    if (stops.length > 0) {
      setOnlyStops(array(stops));
    }
  }, [stops, props.fullList]);

  //Pair with kmb full List
  useEffect(() => {
    if (onlyStops.length > 0 && props.fullList.length > 0) {
      for (const onlyStop of onlyStops) {
        if (routeStops.length < onlyStops.length) {
          setRouteStops((arr) => [
            ...arr,
            props.fullList.filter((x) => x.stop === onlyStop)[0],
          ]);
        }
      }
    }
  }, [onlyStops]);

  //kmb ETA
  const [open, setOpen] = useState(false);
  const toggleHandler = () => {
    setOpen(!open);
  };

  //Check Service
  const [services, setServices] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const type = props.type === "outbound" ? "O" : "I";
  useEffect(() => {
    setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://data.etabus.gov.hk/v1/transport/kmb/route-eta/${props.route}/1`
        );
        setServices(res.data.data.filter((x) => x.dir === type));
      } catch (error) {}
    }, 0);
  }, [props.route]);

  useEffect(() => {
    for (const i of services) {
      if (i.eta) {
        setIsWorking(true);
        break;
      } else {
        setIsWorking(false);
      }
    }
  }, [services]);

  //New Logic
  //Stop Modal
  const [modal, setModal] = useState(false);
  const openModalHandler = () => {
    setModal(true);
  };
  const closeModalHandler = () => {
    setModal(false);
  };

  //New Timetable
  const [timeTable, setTimeTable] = useState([]);
  const fetchTT = async () => {
    try {
      const res = await axios.get(
        `https://search.kmb.hk/KMBWebSite/Function/FunctionRequest.ashx?action=getSpecialRoute&route=${
          props.route
        }&bound=${props.type === "O" ? 1 : 2}`
      );
      setTimeTable(res.data.data.routes);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchTT();
  }, [props.route]);
  return (
    <>
      <Card classNames="p-1">
        <Grid container spacing={0} onClick={toggleHandler}>
          <Grid container spacing={0}>
            <Grid item xs={9}>
              <span className={`display-75 badge-primary-super align-left`}>
                <span className="display-9">往　</span>{" "}
                {routeStops.length > 0 &&
                  routeStops[routeStops.length - 1]?.name_tc}
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
            <span
              className={`badge-kmb
              display-7 center`}
            >
              <Image src={LogoLWB} width={20} height={20} alt="LWB Logo" />
              {props.route}
            </span>
          </Grid>
          <Grid item xs={9}>
            <span className={`badge-primary align-left`}>
              <span className="display-8"> ➤ 由</span>{" "}
              <span className="display-7">
                {routeStops.length > 0 && routeStops[0]?.name_tc}{" "}
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
              <Card disabled classNames="p-2">
                <span className="badge-secondary">時刻表</span>
                <span className="badge-primary-outline display-9 center">
                  星期一至五{timeTable[0]?.Desc_CHI && timeTable[0]?.Desc_CHI}:{" "}
                  {timeTable[0]?.From_weekday} - {timeTable[0]?.To_weekday}
                </span>
                <span className="badge-primary-outline display-9 center">
                  星期六{timeTable[0]?.Desc_CHI && timeTable[0]?.Desc_CHI}:{" "}
                  {timeTable[0]?.From_saturday} - {timeTable[0]?.To_saturday}
                </span>
                <span className="badge-primary-outline display-9 center">
                  星期日及公眾假期
                  {timeTable[0]?.Desc_CHI && timeTable[0]?.Desc_CHI}:{" "}
                  {timeTable[0]?.From_holiday} - {timeTable[0]?.To_holiday}
                </span>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card disable classNames="p-2">
                {routeStops.length > 0 &&
                  routeStops.map((x) => (
                    <BackRoutesItemsStop
                      stop={x}
                      route={props.route}
                      terminus={routeStops.slice(-1)}
                      key={x.stop}
                      company="kmb"
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

export default BackRoutesItems;
