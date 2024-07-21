import BusRoutes from "@/shared/components/bus_routes/BusRoutes";
import Head from "next/head";
import React from "react";
import { BUS_ROUTES_YINGHEI_KMBCTB } from "@/shared/data/BUS_ROUTES_YINGHEI_KMBCTB";
import { BUS_ROUTES_YINGHEI_NLB } from "@/shared/data/BUS_ROUTES_YINGHEI_NLB";
import { BUS_ROUTES_SEAVIEW_KMBCTB } from "@/shared/data/BUS_ROUTES_SEAVIEW_KMBCTB";
import { BUS_ROUTES_SEAVIEW_NLB } from "@/shared/data/BUS_ROUTES_SEAVIEW_NLB";
import { BUS_ROUTES_SEAVIEW_S_NLB } from "@/shared/data/BUS_ROUTES_SEAVIEW_S_NLB";
import { BUS_ROUTES_SEAVIEW_S_KMBCTB } from "@/shared/data/BUS_ROUTES_SEAVIEW_S_KMBCTB";
import { BUS_ROUTES_CITYGATE_KMBCTB } from "@/shared/data/BUS_ROUTES_CITYGATE_KMBCTB";
import { BUS_ROUTES_FUTONG_KMBCTB } from "@/shared/data/BUS_ROUTES_FUTONG_KMBCTB";
import { BUS_ROUTES_TUNGCHUNG_NLB } from "@/shared/data/BUS_ROUTES_TUNGCHUNG_NLB";
import { BUS_ROUTES_TUNGCHUNG_KMBCTB } from "@/shared/data/BUS_ROUTES_TUNGCHUNG_KMBCTB";
import { BUS_ROUTES_TATTUNG_NLB } from "@/shared/data/BUS_ROUTES_TATTUNG_NLB";
import { BUS_ROUTES_YUNGA_NLB } from "@/shared/data/BUS_ROUTES_YUNGA_NLB";

const GoOut = (props) => {
  return (
    <>
      <Head>
        <title>東涌出行 - 離開東涌(即將停用)</title>
        <meta
          name="description"
          content="Welcome to Leave Tung Chung Safe App - Leave"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BusRoutes
        kmbCtbYinghei={props.kmbCtbYinghei}
        nlbYinghei={props.nlbYinghei}
        kmbCtbSeaview={props.kmbCtbSeaview}
        nlbSeaview={props.nlbSeaview}
        kmbCtbSeaview2={props.kmbCtbSeaview2}
        nlbSeaview2={props.nlbSeaview2}
        kmbCtbCitygate={props.kmbCtbCitygate}
        kmbCtbFutong={props.kmbCtbFutong}
        nlbTungchung={props.nlbTungchung}
        kmbCtbTungchung={props.kmbCtbTungchung}
        nlbTattung={props.nlbTattung}
        nlbYunga={props.nlbYunga}
      />
    </>
  );
};

export const getStaticProps = () => {
  const kmbCtbYinghei = BUS_ROUTES_YINGHEI_KMBCTB;
  const nlbYinghei = BUS_ROUTES_YINGHEI_NLB;
  const kmbCtbSeaview = BUS_ROUTES_SEAVIEW_KMBCTB;
  const nlbSeaview = BUS_ROUTES_SEAVIEW_NLB;
  const kmbCtbSeaview2 = BUS_ROUTES_SEAVIEW_S_KMBCTB;
  const nlbSeaview2 = BUS_ROUTES_SEAVIEW_S_NLB;
  const kmbCtbCitygate = BUS_ROUTES_CITYGATE_KMBCTB;
  const kmbCtbFutong = BUS_ROUTES_FUTONG_KMBCTB;
  const nlbTungchung = BUS_ROUTES_TUNGCHUNG_NLB;
  const kmbCtbTungchung = BUS_ROUTES_TUNGCHUNG_KMBCTB;
  const nlbTattung = BUS_ROUTES_TATTUNG_NLB;
  const nlbYunga = BUS_ROUTES_YUNGA_NLB;
  return {
    props: {
      kmbCtbYinghei: kmbCtbYinghei,
      nlbYinghei: nlbYinghei,
      kmbCtbSeaview: kmbCtbSeaview,
      nlbSeaview: nlbSeaview,
      kmbCtbSeaview2: kmbCtbSeaview2,
      nlbSeaview2: nlbSeaview2,
      kmbCtbCitygate: kmbCtbCitygate,
      kmbCtbFutong: kmbCtbFutong,
      nlbTungchung: nlbTungchung,
      kmbCtbTungchung: kmbCtbTungchung,
      nlbTattung: nlbTattung,
      nlbYunga: nlbYunga,
    },
    revalidate: 600000,
  };
};
export default GoOut;
