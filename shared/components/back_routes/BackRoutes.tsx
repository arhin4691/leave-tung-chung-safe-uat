"use client";

import React, { useEffect, useState } from "react";
import BackRoutesLists from "./components/BackRoutesLists";
import type { KmbRoute, CtbRoute, NlbRoute, YellowRoute } from "@/shared/types";

interface BackRoutesProps {
  kmbData: KmbRoute[];
  ctbData: CtbRoute[];
  nlbData: NlbRoute[];
  yellowData: string[];
}

const BackRoutes: React.FC<BackRoutesProps> = (props) => {
  const [yellowList, setYellowList] = useState<YellowRoute[]>([]);

  useEffect(() => {
    if (props.yellowData.length === 0) return;
    Promise.all(
      props.yellowData.map((item) =>
        fetch(`https://360-api.socif.co/api/route/${item}`)
          .then((r) => r.json())
          .then((j) => j.data?.[0])
      )
    )
      .then((results) => setYellowList(results.filter(Boolean)))
      .catch((err) => console.error("Yellow routes fetch error:", err));
  }, [props.yellowData]);

  return (
    <BackRoutesLists
      kmbData={props.kmbData}
      ctbData={props.ctbData}
      ctbDataRever={props.ctbData}
      nlbData={props.nlbData}
      yellowData={yellowList}
    />
  );
};

export default BackRoutes;
