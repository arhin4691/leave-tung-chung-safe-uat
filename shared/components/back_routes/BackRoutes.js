import React, { useEffect, useState } from "react";
import BackRoutesLists from "./components/BackRoutesLists";
import axios from "axios";

const BackRoutes = (props) => {
  //Extract Yellow Bus Data
  const [yellowList, setYellowList] = useState([]);
  const fetch = async () => {
    let arr = []
    for (var item of props.yellowData) {
      const res = await axios.get(`https://360-api.socif.co/api/route/${item}`);
      arr.push(res.data.data[0])
    }
    setYellowList(arr)
  };
  useEffect(() => {
    fetch();
  }, []);
  return (
    <>
      <BackRoutesLists
        kmbData={props.kmbData}
        ctbData={props.ctbData}
        ctbDataRever={props.ctbData}
        nlbData={props.nlbData}
        yellowData={yellowList}
      />
    </>
  );
};

export default BackRoutes;
