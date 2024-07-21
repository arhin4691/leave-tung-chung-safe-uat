import CarPark from "@/shared/components/car_park/CarPark";
import axios from "axios";
import Head from "next/head";
import React, { useState } from "react";

const index = (props) => {
  return (
    <>
      <Head>
        <title>東涌出行 - 停車場</title>
        <meta
          name="description"
          content="Welcome to Leave Tung Chung Safe App - Favourite"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CarPark data={props.carpark} />
    </>
  );
};

export const getStaticProps = async () => {
  try {
    const carPark = await axios.get(
      `https://resource.data.one.gov.hk/td/carpark/basic_info_all.json`
    );
    const carParkData = carPark.data.car_park;
    return {
      props: {
        carpark: carParkData.filter((x) =>
          x.displayAddress_tc.includes("東涌")
        ),
      },
      revalidate: 600000,
    };
  } catch (error) {}
};
export default index;
