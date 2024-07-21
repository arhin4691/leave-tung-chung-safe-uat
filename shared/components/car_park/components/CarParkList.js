import React from "react";
import CarParkItem from "./CarParkItem";
import { Grid } from "@mui/material";
import Image from "next/image";

const CarParkList = (props) => {
  const iconCarPark = "/files/images/carpark.png";
  return (
    <div className="mb-5">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <div className="white-background-static display-5 center ms-2 mt-2 me-2 ">
            <Image src={iconCarPark} width={50} height={50} alt="停車場" />
          </div>
        </Grid>
        {props.data.map((x) => (
          <Grid item xs={12} md={6} lg={4} xl={3} key={x.park_id}>
            <CarParkItem data={x}/>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default CarParkList;
