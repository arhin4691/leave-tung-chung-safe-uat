"use client";

import React, { useEffect, useState } from "react";
import Card from "../../ui/Card";
import { Box, Grid, LinearProgress } from "@mui/material";
import Image from "next/image";
import BackRoutesItemsYellowStop from "./BackRoutesItemsYellowStop";

interface BackRoutesItemsYellowProps {
  routeSeq: number;
  routeId: string | number;
  routeCode: string;
  directions: any;
}

const BackRoutesItemsYellow: React.FC<BackRoutesItemsYellowProps> = (props) => {
  const LogoYellow = "/files/images/logo_yellow.png";

  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [stopSeq, setStopSeq] = useState<any[]>([]);

  const checkIsWorking = async () => {
    try {
      const res = await fetch(
        `https://360-api.socif.co/api/eta/route-stop/${props.routeId}/${props.routeSeq}`
      );
      const json = await res.json();
      setIsWorking(json.data.eta[0]?.eta[0] !== "");
    } catch (error) {}
  };

  const fetchStopSeq = async () => {
    try {
      const res = await fetch(
        `https://360-api.socif.co/api/route-stop/${props.routeId}/${props.routeSeq}`
      );
      const json = await res.json();
      setStopSeq(json.data.route_stops);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStopSeq();
    checkIsWorking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card classNames="p-1">
      <Grid
        container
        spacing={0}
        onClick={() => (open ? setOpen(false) : setOpen(true))}
      >
        <Grid container spacing={0}>
          <Grid item xs={9}>
            <span className="display-75 badge-primary-super align-left">
              <span className="display-9">往　</span> {props.directions?.dest_tc}
            </span>
          </Grid>
          <Grid item xs={3}>
            <span
              className={`${isWorking ? "badge-success-animate" : "badge-danger"} display-75 align-right`}
            >
              {isWorking ? "提供服務" : "未有服務"}
            </span>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <span className="badge-reverse display-75 center">
            <Image src={LogoYellow} width={20} height={20} alt="Park Island Logo" />
            {props.routeCode}
          </span>
        </Grid>
        <Grid item xs={9}>
          <span className="badge-primary align-left">
            <span className="display-8"> ➤ 由 </span>
            <span className="display-7">{props.directions?.orig_tc}</span>
            <span className="display-8">開出</span>
          </span>
          <span
            className="align-right text-primary display-6"
            onClick={() => (open ? setOpen(false) : setOpen(true))}
          >
            {open ? "△" : "▽"}
          </span>
        </Grid>
      </Grid>
      {open && (
        <>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <Card disabled classNames="p-2">
                {stopSeq.length > 0 ? (
                  stopSeq.map((x) => (
                    <BackRoutesItemsYellowStop
                      key={x.stopSeq}
                      stopId={x.stop_id}
                      stopSeq={x.stop_seq}
                      routeId={props.routeId}
                      routeSeq={props.routeSeq}
                      routeCode={props.routeCode}
                      termName={props.directions?.dest_tc}
                      orgName={props.directions?.orig_tc}
                      data={stopSeq}
                      open={open}
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
  );
};

export default BackRoutesItemsYellow;
