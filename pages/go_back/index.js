import axios from "axios";
import Head from "next/head";
import React from "react";
import BackRoutes from "../../shared/components/back_routes/BackRoutes";

const GoBack = (props) => {
  return (
    <>
      <Head>
        <title>東涌出行 - 巴士路線</title>
        <meta
          name="description"
          content="Welcome to Leave Tung Chung Safe App - Buses"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BackRoutes
        kmbData={props.kmbData}
        ctbData={props.ctbData}
        ctbDataRever={props.ctbDataRever}
        nlbData={props.nlbData}
        yellowData={props.yellowData}
      />
    </>
  );
};

export const getStaticProps = async () => {
  try {
    const nlbRes = await axios.get(
      `https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list`
    );
    
    const nlbData = nlbRes.data.routes;
    const kmbRes = await axios.get(
      `https://data.etabus.gov.hk/v1/transport/kmb/route/`
    );
    const kmbData = kmbRes.data.data.filter(x => x.service_type.toString() === "1");

    const ctbRes = await axios.get(
      `https://rt.data.gov.hk/v2/transport/citybus/route/ctb`
    );
    const ctbData = ctbRes.data.data;

    //YellowBus
    const yellowRes = await axios.get(`https://360-api.socif.co/api/setting/shk/pi`)
    const yellowData = yellowRes.data.data.display_routes

    return {
      props: {
        kmbData: kmbData,
        ctbData: ctbData,
        ctbDataRever: ctbData,
        nlbData: nlbData,
        yellowData: yellowData,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

export default GoBack;
