import React, { useEffect, useState } from "react";
import Card from "../../ui/Card";
import { Grid } from "@mui/material";
import Image from "next/image";
import axios from "axios";
import BackRoutesItemsYellowStop from "./BackRoutesItemsYellowStop";

const BackRoutesItemsYellow = (props) => {
  const LogoYellow = "/files/images/logo_yellow.png";

  //Is Working?
  const [isWorking, setIsWorking] = useState(false);
  const checkIsWorking = async () => {
    try {
      const res = await axios.get(
        `https://360-api.socif.co/api/eta/route-stop/${props.routeId}/${props.routeSeq}`
      );
      setIsWorking(res.data.data.eta[0]?.eta[0] !== "");
    } catch (error) {}
  };

  //Toggle Handler
  const [open, setOpen] = useState(false);

  //Fetch Stop Seq
  const [stopSeq, setStopSeq] = useState([]);
  const fetchStopSeq = async () => {
    try {
      const res = await axios.get(
        `https://360-api.socif.co/api/route-stop/${props.routeId}/${props.routeSeq}`
      );
      setStopSeq(res.data.data.route_stops);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchStopSeq();
    checkIsWorking();
  }, []);
  return (
    <Card classNames={`p-1`}>
      <Grid
        container
        spacing={0}
        onClick={() => (open ? setOpen(false) : setOpen(true))}
      >
        <Grid container spacing={0}>
          <Grid item xs={9}>
            <span className={`display-75 badge-primary-super align-left`}>
              <span className="display-9">往　</span> {props.directions.dest_tc}
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
          <span className={`badge-reverse display-75 center`}>
            <Image
              src={LogoYellow}
              width={20}
              height={20}
              alt="Park Island Logo"
            />
            {props.routeCode}
          </span>
        </Grid>
        <Grid item xs={9}>
          <span className={`badge-primary align-left`}>
            <span className="display-8"> ➤ 由 </span>
            <span className="display-7">
              {props.directions.orig_tc}
              {/* {routeStops[0].data.data.name_tc} */}
            </span>
            <span className="display-8">開出</span>
          </span>
          <span
            className={"align-right text-primary display-6"}
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
              <Card disable classNames="p-2">
                {stopSeq.length > 0 ? (
                  stopSeq.map((x) => (
                    <BackRoutesItemsYellowStop
                      key={x.stopSeq}
                      stopId={x.stop_id}
                      stopSeq={x.stop_seq}
                      routeId={props.routeId}
                      routeSeq={props.routeSeq}
                      routeCode={props.routeCode}
                      termName={props.directions.dest_tc}
                      orgName={props.directions.orig_tc}
                      data={stopSeq}
                      open={open}
                    />
                  ))
                ) : (
                  <Box>
                    <LinearProgress />
                    <span className="text-primary center">
                      正在為你準備列表
                    </span>
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
