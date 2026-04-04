"use client";

import { Box, Grid, LinearProgress } from "@mui/material";
import React, { useState, useEffect, useDeferredValue, Suspense } from "react";
import Input from "../../ui/Input";
import BackRoutesItems from "./BackRoutesItems";
import BackRoutesItemsCTB from "./BackRoutesItemsCTB";
import BackRoutesItemsNLB from "./BackRoutesItemsNLB";
import { AnimatePresence } from "framer-motion";
import Card from "../../ui/Card";
import BackRoutesItemsYellow from "./BackRoutesItemsYellow";
import type { KmbRoute, CtbRoute, NlbRoute, YellowRoute, KmbStop } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";

interface BackRoutesListsProps {
  kmbData: KmbRoute[];
  ctbData: CtbRoute[];
  ctbDataRever: CtbRoute[];
  nlbData: NlbRoute[];
  yellowData: YellowRoute[];
}

const BackRoutesLists: React.FC<BackRoutesListsProps> = (props) => {
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [busList, setBusList] = useState<KmbRoute[]>([]);
  const [ctbList, setCtbList] = useState<CtbRoute[]>([]);
  const [ctbReverList, setCtbReverList] = useState<CtbRoute[]>([]);
  const [nlbList, setNlbList] = useState<NlbRoute[]>([]);
  const [yellowList, setYellowList] = useState<YellowRoute[]>([]);
  const [fullList, setFullList] = useState<KmbStop[]>([]);

  useEffect(() => {
    fetch("https://data.etabus.gov.hk/v1/transport/kmb/stop")
      .then((r) => r.json())
      .then((j) => setFullList(j.data))
      .catch((err) => console.error("KMB stop list fetch error:", err));
  }, []);

  const [showInput, setShowInput] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>("");
  const deferredKeyword = useDeferredValue(keyword || "");

  const searchHandler = () => {};
  const onGet = (val: string) => {
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
        ? []
        : [...props.kmbData].filter((x) =>
            x.route.toUpperCase().startsWith(deferredKeyword.toUpperCase())
          )
    );
    setCtbList(
      deferredKeyword === null || deferredKeyword === ""
        ? []
        : [...props.ctbData].filter((x) =>
            x.route.toUpperCase().startsWith(deferredKeyword.toUpperCase())
          )
    );
    setCtbReverList(
      deferredKeyword === null || deferredKeyword === ""
        ? []
        : [...props.ctbDataRever].filter((x) =>
            x.route.toUpperCase().startsWith(deferredKeyword.toUpperCase())
          )
    );
    setNlbList(
      deferredKeyword === null || deferredKeyword === ""
        ? []
        : [...props.nlbData].filter(
            (x) =>
              x.routeNo.toUpperCase().startsWith(deferredKeyword.toUpperCase()) ||
              x.routeName_c.toUpperCase().startsWith(deferredKeyword.toUpperCase()) ||
              x.routeName_s.toUpperCase().startsWith(deferredKeyword.toUpperCase()) ||
              x.routeName_e.toUpperCase().startsWith(deferredKeyword.toUpperCase())
          )
    );
    setYellowList(
      deferredKeyword === null || deferredKeyword === ""
        ? []
        : [...props.yellowData].filter((x) =>
            x.route_code.toUpperCase().includes(deferredKeyword.toUpperCase())
          )
    );
  };

  useEffect(() => {
    if (deferredKeyword) setIsLoading(true);
    const timeout = setTimeout(() => {
      sorting();
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  placeholder={t("common.enterRoute")}
                  onInput={searchHandler}
                  validators={[]}
                  onGetValue={onGet}
                  autocomplete="off"
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
            {(deferredKeyword === null || deferredKeyword === "") && (
              <Grid item xs={12}>
                <Card disabled classNames="p-2 text-light">
                  <span className="m-2 banner banner-transparent">
                    {t("bus.searchHint")}
                    <br />
                    {t("bus.searchExample")}
                    <br />
                  </span>
                </Card>
              </Grid>
            )}
            {isLoading && (
              <Grid item xs={12}>
                <Card disabled classNames="p-2 text-primary">
                  <Box>
                    <LinearProgress />
                    <span className="text-primary center">{t("bus.preparing")}</span>
                  </Box>
                </Card>
              </Grid>
            )}
            <>
              <Suspense fallback={<h2>Loading...</h2>}>
                {busList
                  .sort((a, b) => (a.route > b.route ? 1 : -1))
                  .map((x) => (
                    <Grid item xs={12} md={6} lg={4} key={x.route}>
                      <BackRoutesItems
                        fullList={fullList}
                        route={x.route}
                        type={x.bound}
                      />
                    </Grid>
                  ))}
                {ctbList
                  .sort((a, b) => (a.route > b.route ? 1 : -1))
                  .map((x) => (
                    <Grid item xs={12} md={6} lg={4} key={`ctb-${x.route}`}>
                      <BackRoutesItemsCTB
                        route={x.route}
                        type={x.type}
                        start={x.dest_tc}
                        end={x.orig_tc}
                        co="ctb"
                      />
                    </Grid>
                  ))}
                {ctbReverList
                  .sort((a, b) => (a.route > b.route ? 1 : -1))
                  .map((x) => (
                    <Grid item xs={12} md={6} lg={4} key={`ctbr-${x.route}`}>
                      <BackRoutesItemsCTB
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
                    <Grid item xs={12} md={6} lg={4} key={x.routeId}>
                      <BackRoutesItemsNLB routeId={x.routeId} route={x.routeNo} />
                    </Grid>
                  ))}
                {yellowList
                  .sort((a, b) => (a.route_code > b.route_code ? 1 : -1))
                  .map((x, i) => (
                    <React.Fragment key={`yb-${x.route_id}-${i}`}>
                      <Grid item xs={12} md={6} lg={4}>
                        <BackRoutesItemsYellow
                          routeSeq={1}
                          routeId={x.route_id}
                          routeCode={x.route_code}
                          directions={x.directions[0]}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} lg={4}>
                        <BackRoutesItemsYellow
                          routeSeq={2}
                          routeId={x.route_id}
                          routeCode={x.route_code}
                          directions={x.directions[1]}
                        />
                      </Grid>
                    </React.Fragment>
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
                        {t("bus.notFound")}
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
