import { Box, LinearProgress } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import MTRList from "./components/MTRList";
import Card from "../ui/Card";

const MTR = (props) => {
  const iconMTR = "/files/images/icon_mtr.png";

  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [data, setData] = useState([]);
  const getEta = async () => {
    try {
      let arr = [];

      for (let i = 0; i < props.stationList.length; i++) {
        const res = await axios.get(
          `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=TCL&sta=${props.stationList[i]}&lang=tc`
        );
        arr.push(res.data.data);
      }
      setData(arr);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (props.stationList) {
      getEta();
      const interval = setInterval(() => {
        getEta();
        setNow(Math.floor(Date.now() / 1000));
      }, 20000);

      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  return (
    <>
      <Card classNames="center">
        <Image src={iconMTR} width={50} height={50} alt="地鐵路線" />
      </Card>
      {data.length > 0 ? (
        <MTRList
          data={data}
          stationList={props.stationList}
          stationsName={props.stationsName}
        />
      ) : (
        <Box sx={{ width: "100%" }}>
          <span className="mt-5">
            <LinearProgress />
          </span>
        </Box>
      )}
    </>
  );
};

export default MTR;
