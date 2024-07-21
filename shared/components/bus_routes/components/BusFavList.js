import { Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import BackRoutesItemsCTBStop from "../../back_routes/components/BackRoutesItemsCTBStop";
import BackRoutesItemsStop from "../../back_routes/components/BackRoutesItemsStop";
import BackRoutesItemsNLBStop from "../../back_routes/components/BackRoutesItemsNLBStop";
import Image from "next/image";
import Card from "../../ui/Card";
import BackRoutesItemsYellowStop from "../../back_routes/components/BackRoutesItemsYellowStop";

const BusFavList = (props) => {
  const LogoYellow = "/files/images/logo_yellow.png";
  const LogoLWB = "/files/images/logo_lwb.png";
  const LogoCTB = "/files/images/logo_ctb.png";
  const LogoNLB = "/files/images/logo_nlb.png";
  const [data, setData] = useState(props.data);
  const [backData, setBackData] = useState(props.backData);
  const [nlbData, setNlbData] = useState(props.nlbData);
  useEffect(() => {
    setData(props.data);
    setBackData(props.backData);
    setNlbData(props.nlbData);
  }, [props.data, props.backData, props.nlbData]);

  const likedNLB = nlbData.map((x) => (
    <>
      <Card classNames="p-2">
        <Grid container spacing={0}>
          <Grid item xs={4}>
            <span className={`display-7 center badge-success`}>
              <Image src={LogoNLB} width={20} height={20} alt="NLB Logo" />
              {x.route}
            </span>
          </Grid>
          <Grid item xs={8}>
            <span className={`display-7 badge-primary-super center`}>
              <span className="display-8">往　</span> {x.terminus[0].stopName_c}
            </span>
          </Grid>
          <Grid item xs={12}>
            <BackRoutesItemsNLBStop
              stop={x}
              route={x.route}
              terminus={x.terminus}
              routeId={x.routeId}
              key={x}
              mode={"nlb"}
              site="fav"
              company="nlb"
            />
          </Grid>
        </Grid>
      </Card>
    </>
  ));

  return (
    <>
      {/* This is back route */}
      <Card disabled classNames="p-2">
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <div className="display-7 banner banner-warning center">常用❤️</div>
          </Grid>
        </Grid>
        <>
          <Grid container spacing={0}>
            <Grid
              item
              xs={12}
              md={props.mode !== "home" && 6}
              lg={props.mode !== "home" && 4}
              xl={props.mode !== "home" && 3}
            >
              {nlbData.length > 0 && likedNLB}
            </Grid>
            <Grid
              item
              xs={12}
              md={props.mode !== "home" && 6}
              lg={props.mode !== "home" && 4}
              xl={props.mode !== "home" && 3}
            >
              {backData !== "" &&
                backData
                  .sort((a, b) => (a.route < b.route ? -1 : 1))
                  .map((x) => (
                    <>
                      <Card classNames="p-2">
                        <Grid container spacing={0}>
                          <Grid item xs={4}>
                            <span
                              className={`display-7 center ${
                                x.company === "ctb" && "badge-ctb"
                              } ${x.company === "kmb" && "badge-kmb"} ${
                                x.company === "yb" && "badge-reverse"
                              }`}
                            >
                              {x.company === "kmb" && (
                                <Image
                                  src={LogoLWB}
                                  width={20}
                                  height={20}
                                  alt="LWB Logo"
                                />
                              )}
                              {x.company === "ctb" && (
                                <Image
                                  src={LogoCTB}
                                  width={20}
                                  height={20}
                                  alt="LWB Logo"
                                />
                              )}
                              {x.company === "yb" && (
                                <Image
                                  src={LogoYellow}
                                  width={20}
                                  height={20}
                                  alt="YB Logo"
                                />
                              )}
                              {x.route}
                            </span>
                          </Grid>
                          <Grid item xs={8}>
                            <span
                              className={`display-7 badge-primary-super center`}
                            >
                              <span className="display-8">往　</span>{" "}
                              {x.company === "kmb" && x.terminus[0].name_tc}
                              {x.company === "ctb" && x.terminus.data.name_tc}
                              {x.company === "nlb" && x.terminus.data.name_tc}
                              {x.company === "yb" && x.termName}
                            </span>
                          </Grid>
                          <Grid item xs={12}>
                            {x.company === "ctb" && (
                              <BackRoutesItemsCTBStop
                                stop={x}
                                route={x.route}
                                company={x.company}
                                terminus={x.terminus}
                                site="fav"
                                mode={""}
                              />
                            )}
                            {x.company === "kmb" && (
                              <BackRoutesItemsStop
                                stop={x}
                                route={x.route}
                                company={x.company}
                                terminus={x.terminus}
                                site="fav"
                              />
                            )}
                            {x.company === "yb" && (
                              <BackRoutesItemsYellowStop
                                stopId={x.stop}
                                stopSeq={x.stopSeq}
                                route={x.route}
                                routeId={x.routeId}
                                routeSeq={x.routeSeq}
                                company={x.company}
                                termName={x.termName}
                                site="fav"
                              />
                            )}
                          </Grid>
                        </Grid>
                      </Card>
                    </>
                  ))}
            </Grid>
          </Grid>

          {typeof window !== "undefined"
            ? (window.localStorage.getItem("likedBack") &&
                window.localStorage.getItem("likedBus") &&
                window.localStorage.getItem("likedNlb")) && (
                <div className="badge-reverse center p-1 m-1">
                  😔你未有任何常用車站及路線
                </div>
              )
            : false}
        </>
      </Card>
    </>
  );
};

export default BusFavList;
