import { Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import { parseString } from "xml2js";
import Button from "../ui/Button";
import RoadStatusItem from "./components/RoadStatusItem";
import Card from "../ui/Card";

const RoadStatus = (props) => {
  //Road Status Data
  const [roadData, setRoadData] = useState([{ ChinShort: `正在載入` }]);
  const [refresh, setRefresh] = useState(false);

  //Refresh Handler
  const refreshHandler = () => {
    setRefresh(true);
    const timeout = setTimeout(() => {
      setRefresh(false);
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshHandler();
    }, 600000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    setTimeout(async () => {
      // setRoadData(props.data);
      try {
        await fetch(
          "https://resource.data.one.gov.hk/td/en/specialtrafficnews.xml"
        )
          .then((response) => response.text())
          .then((xml) => {
            parseString(xml, function (err, result) {
              setRoadData(result.body.message);
            });
          })
          .catch(console.error);
      } catch (error) {
        setRoadData([
          {
            ChinShort: `政府內部資料錯誤: ${error}`,
            ChinText: `政府內部資料錯誤: ${error}`,
            ReferenceDate: "",
          },
        ]);
      }
    }, 0);
  }, [refresh]);

  //More
  const [quan, setQuan] = useState(3);
  const showMoreHandler = () => {
    setQuan((prev) => prev + 3);
  };

  return (
    <>
      <Card disabled classNames="p-2">
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <span className="banner banner-primary center display-7">
              香港交通消息
            </span>
          </Grid>
          {roadData.slice(0, quan).map(
            (x) =>
              !x.ChinShort.includes("") && (
                <Grid item xs={12} md={6} xl={3} key={x.ChinShort}>
                  <RoadStatusItem data={x} key={x.ChinShort} />
                </Grid>
              )
          )}
        </Grid>
        <div className="center">
          <Button
            light
            disabled={quan > roadData.length}
            onClick={showMoreHandler}
          >
            更多
          </Button>
        </div>
      </Card>
    </>
  );
};

export default RoadStatus;
