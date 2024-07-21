import Head from "next/head";
import React, { useState } from "react";
import MTRRoutes from "@/shared/components/mtr/MTRRoutes";

const MTR = (props) => {
  const [data, setData] = useState(props.data);
  const [stations, setStations] = useState(props.stations);
  return (
    <>
      <Head>
        <title>東涌出行 - 地鐵路線</title>
        <meta
          name="description"
          content="Welcome to Leave Tung Chung Safe App - Railway"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MTRRoutes
        data={data}
        stationList={stations}
        stationsName={props.stationsName}
      />
    </>
  );
};

export const getStaticProps = async () => {
  try {
    const STATIONS = ["HOK", "KOW", "OLY", "NAC", "LAK", "TSY", "SUN", "TUC"];
    const STATIONS_NAME = [
      "香港",
      "九龍",
      "奧運",
      "南昌",
      "荔景",
      "青衣",
      "欣澳",
      "東涌",
    ];

    return {
      props: {
        stations: STATIONS.reverse(),
        stationsName: STATIONS_NAME.reverse(),
      },
      revalidate: 30,
    };
  } catch (error) {
    console.log(error);
  }
};
export default MTR;
