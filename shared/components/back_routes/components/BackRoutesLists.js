import { Box, Grid, LinearProgress } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect, useDeferredValue, Suspense } from "react";
import Input from "../../ui/Input";
import BackRoutesItems from "./BackRoutesItems";
import BackRoutesItemsCTB from "./BackRoutesItemsCTB";
import BackRoutesItemsNLB from "./BackRoutesItemsNLB";
import { AnimatePresence } from "framer-motion";
import Card from "../../ui/Card";
import BackRoutesItemsYellow from "./BackRoutesItemsYellow";

const BackRoutesLists = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [busList, setBusList] = useState([]);
  const [ctbList, setCtbList] = useState([]);
  const [ctbReverList, setCtbReverList] = useState([]);
  const [nlbList, setNlbList] = useState([]);
  const [yellowList, setYellowList] = useState([]);
  const [fullList, setFullList] = useState([]);
  useEffect(() => {
    fullList.length < 1 &&
      setTimeout(async () => {
        const data = await axios.get(
          "https://data.etabus.gov.hk/v1/transport/kmb/stop"
        );
        setFullList(data.data.data);
      }, 0);
  }, [fullList]);

  const [showInput, setShowInput] = useState(true);
  const [keyword, setKeyword] = useState("");
  const deferredKeyword = useDeferredValue(keyword || "");
  const searchHandler = () => {};
  const onGet = (val) => {
    setKeyword(val);
  };
  const clearHandler = () => {
    setShowInput(false);
    setTimeout(() => {
      setShowInput(true);
    }, 0);
  };

  const sorting = () => {
    setBusList(
      deferredKeyword === null || deferredKeyword === ""
        ? [] //props.kmbData
        : [...props.kmbData].filter(
            (x) =>
              x.route.toUpperCase().startsWith(deferredKeyword.toUpperCase()) //||
            // x.co?.toUpperCase().includes(deferredKeyword.toUpperCase())
          )
    );
    setCtbList(
      deferredKeyword === null || deferredKeyword === ""
        ? [] //props.ctbData
        : [...props.ctbData].filter(
            (x) =>
              x.route.toUpperCase().startsWith(deferredKeyword.toUpperCase()) //||
            // x.co.toUpperCase().includes(deferredKeyword.toUpperCase())
          )
    );
    setCtbReverList(
      deferredKeyword === null || deferredKeyword === ""
        ? [] //props.ctbData
        : [...props.ctbDataRever].filter(
            (x) =>
              x.route.toUpperCase().startsWith(deferredKeyword.toUpperCase()) //||
            // x.co.toUpperCase().includes(deferredKeyword.toUpperCase())
          )
    );
    setNlbList(
      deferredKeyword === null || deferredKeyword === ""
        ? [] //props.nlbData
        : [...props.nlbData].filter(
            (x) =>
              x.routeNo
                .toUpperCase()
                .startsWith(deferredKeyword.toUpperCase()) ||
              x.routeName_c
                .toUpperCase()
                .startsWith(deferredKeyword.toUpperCase()) ||
              x.routeName_s
                .toUpperCase()
                .startsWith(deferredKeyword.toUpperCase()) ||
              x.routeName_e
                .toUpperCase()
                .startsWith(deferredKeyword.toUpperCase())
          )
    );
    setYellowList(
      deferredKeyword === null || deferredKeyword === ""
        ? [] //props.ctbData
        : [...props.yellowData].filter((x) =>
            x.route_code.toUpperCase().includes(deferredKeyword.toUpperCase())
          )
    );
  };
  useEffect(() => {
    deferredKeyword && setIsLoading(true);
    const timeout = setTimeout(() => {
      sorting();
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [deferredKeyword]);

  return (
    <>
      <AnimatePresence initial={false}>
        <div className="mt-2 m-1">
          <Grid container spacing={0}>
            <Grid item xs={11}>
              {showInput ? (
                <Input
                  id="search"
                  type="text"
                  element="input"
                  placeholder={"請輸入路線號碼"}
                  onInput={searchHandler}
                  validators={[]}
                  onGetValue={onGet}
                  autocomplete={"off"}
                />
              ) : (
                <div className="m-3">1</div>
              )}
            </Grid>
            <Grid item xs={1}>
              <div
                className="ms-1 mt-2 text-white display-65"
                onClick={clearHandler}
              >
                ⛒
              </div>
            </Grid>
            {deferredKeyword === null ||
              (deferredKeyword === "" && (
                <Grid item xs={12}>
                  <Card disabled classNames="p-2 text-light">
                    <span className="m-2 banner banner-transparent">
                      你可以輸入任何巴士號碼作出搜尋
                      <br />
                      例如 E33 / 37M / E11 等等
                      <br />
                    </span>
                  </Card>
                </Grid>
              ))}
            {isLoading && (
              <Grid item xs={12}>
                <Card disabled classNames="p-2 text-primary">
                  <Box>
                    <LinearProgress />
                    <span className="text-primary center">
                      正在為你準備列表
                    </span>
                  </Box>
                </Card>
              </Grid>
            )}
            <>
              <Suspense fallback={<h2>Loading...</h2>}>
                {busList
                  .sort((a, b) => (a.route > b.route ? 1 : -1))
                  .map((x) => (
                    <Grid item xs={12} md={6} lg={4}>
                      <BackRoutesItems
                        key={x.route}
                        fullList={fullList}
                        route={x.route}
                        // type={x.type}
                        type={x.bound}
                      />
                    </Grid>
                  ))}
                {ctbList
                  .sort((a, b) => (a.route > b.route ? 1 : -1))
                  .map((x) => (
                    <Grid item xs={12} md={6} lg={4}>
                      <BackRoutesItemsCTB
                        key={x.route}
                        route={x.route}
                        type={x.type}
                        start={x.dest_tc}
                        end={x.orig_tc}
                        co={"ctb"}
                      />
                    </Grid>
                  ))}
                {ctbReverList
                  .sort((a, b) => (a.route > b.route ? 1 : -1))
                  .map((x) => (
                    <Grid item xs={12} md={6} lg={4}>
                      <BackRoutesItemsCTB
                        key={x.route}
                        route={x.route}
                        type={x.type}
                        start={x.orig_tc}
                        end={x.dest_tc}
                        co={x.co}
                        mode="reverse"
                      />
                    </Grid>
                  ))}
                {nlbList
                  .sort((a, b) => (a.routeNo > b.routeNo ? 1 : -1))
                  .map((x) => (
                    <Grid item xs={12} md={6} lg={4}>
                      <BackRoutesItemsNLB
                        key={x.routeId}
                        routeId={x.routeId}
                        route={x.routeNo}
                      />
                    </Grid>
                  ))}
                {yellowList
                  .sort((a, b) => (a.routeNo > b.routeNo ? 1 : -1))
                  .map((x) => (
                    <>
                      <Grid item xs={12} md={6} lg={4}>
                        <BackRoutesItemsYellow
                          key={x.route_id}
                          routeSeq={1}
                          routeId={x.route_id}
                          routeCode={x.route_code}
                          directions={x.directions[0]}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} lg={4}>
                        <BackRoutesItemsYellow
                          key={x.route_id}
                          routeSeq={2}
                          routeId={x.route_id}
                          routeCode={x.route_code}
                          directions={x.directions[1]}
                        />
                      </Grid>
                    </>
                  ))}
                {deferredKeyword !== "" &&
                  !isLoading &&
                  busList.length === 0 &&
                  ctbList.length === 0 &&
                  ctbReverList.length === 0 &&
                  nlbList.length === 0 &&
                  yellowList.length === 0 && (
                    <Grid item xs={12}>
                      <div className="banner banner-little-danger m-2 center">
                        根據你的輸入找不到任何路線
                      </div>
                    </Grid>
                  )}
              </Suspense>
            </>
          </Grid>
        </div>
      </AnimatePresence>
    </>
  );
};

export default BackRoutesLists;
