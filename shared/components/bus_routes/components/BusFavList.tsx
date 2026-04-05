"use client";

import { Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Card from "../../ui/Card";
import BackRoutesItemsCTBStop from "../../back_routes/components/BackRoutesItemsCTBStop";
import BackRoutesItemsStop from "../../back_routes/components/BackRoutesItemsStop";
import BackRoutesItemsNLBStop from "../../back_routes/components/BackRoutesItemsNLBStop";
import BackRoutesItemsYellowStop from "../../back_routes/components/BackRoutesItemsYellowStop";
import FavStopCard from "../../back_routes/components/FavStopCard";
import { useLocale } from "@/shared/context/locale-context";
import type {
  BusRoute,
  FavBackStop,
  FavNlbStop,
  FavRouteStop,
} from "@/shared/types";

const LogoYellow = "/files/images/logo_yellow.png";
const LogoLWB = "/files/images/logo_lwb.png";
const LogoCTB = "/files/images/logo_ctb.png";
const LogoNLB = "/files/images/logo_nlb.png";

interface BusFavListProps {
  data: BusRoute[];
  backData: FavBackStop[] | string;
  nlbData: FavNlbStop[];
  /** New-style route stop favourites (likedRouteStop) */
  routeStopData?: FavRouteStop[];
  /** Called when a routeStop fav is removed so parent re-reads localStorage */
  onRouteStopRemoved?: () => void;
  mode?: string;
}

const BusFavList: React.FC<BusFavListProps> = (props) => {
  const { t } = useLocale();
  const [data, setData] = useState<BusRoute[]>(props.data);
  const [backData, setBackData] = useState<FavBackStop[] | string>(
    props.backData,
  );
  const [nlbData, setNlbData] = useState<FavNlbStop[]>(props.nlbData);
  const [routeStopData, setRouteStopData] = useState<FavRouteStop[]>(
    props.routeStopData ?? [],
  );
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setData(props.data);
    setBackData(props.backData);
    setNlbData(props.nlbData);
    setRouteStopData(props.routeStopData ?? []);
  }, [props.data, props.backData, props.nlbData, props.routeStopData]);

  const likedNLB = nlbData.map((x, index) => (
    <React.Fragment key={index}>
      <Card classNames="p-2">
        <Grid container spacing={0}>
          <Grid item xs={4}>
            <span className="display-7 center badge-success">
              <Image src={LogoNLB} width={20} height={20} alt="NLB Logo" />
              {x.route}
            </span>
          </Grid>
          <Grid item xs={8}>
            <span className="display-7 badge-primary-super center">
              <span className="display-8">往　</span> {x.terminus[0].stopName_c}
            </span>
          </Grid>
          <Grid item xs={12}>
            <BackRoutesItemsNLBStop
              stop={x}
              route={x.route}
              terminus={x.terminus}
              routeId={x.routeId}
              mode="nlb"
              site="fav"
              company="nlb"
            />
          </Grid>
        </Grid>
      </Card>
    </React.Fragment>
  ));

  const backDataArray = Array.isArray(backData) ? backData : [];

  return (
    <>
      <Card disabled classNames="p-2">
        {/* ── Section header ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "10px",
            marginBottom: "8px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#FF9F0A",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: "14px",
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {t("home.favourite")}
            </span>
          </div>
          <button
            onClick={() => setEditMode((o) => !o)}
            aria-label={editMode ? "done editing" : "edit favourites"}
            style={{
              background: editMode
                ? "rgba(255,159,10,0.15)"
                : "rgba(255,255,255,0.07)",
              border: editMode
                ? "1px solid rgba(255,159,10,0.35)"
                : "1px solid transparent",
              borderRadius: "9999px",
              cursor: "pointer",
              padding: "4px 11px",
              color: editMode ? "#FF9F0A" : "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
            }}
          >
            {editMode ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t("common.close")}
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z" />
                </svg>
                Edit
              </>
            )}
          </button>
        </div>
        <>
          <Grid container spacing={0}>
            <Grid
              item
              xs={12}
              md={props.mode !== "home" ? 6 : undefined}
              lg={props.mode !== "home" ? 4 : undefined}
              xl={props.mode !== "home" ? 3 : undefined}
            >
              {nlbData.length > 0 && likedNLB}
            </Grid>
            <Grid
              item
              xs={12}
              md={props.mode !== "home" ? 6 : undefined}
              lg={props.mode !== "home" ? 4 : undefined}
              xl={props.mode !== "home" ? 3 : undefined}
            >
              {backDataArray.length > 0 &&
                backDataArray
                  .sort((a, b) => (a.route < b.route ? -1 : 1))
                  .map((x, index) => (
                    <React.Fragment key={index}>
                      <Card classNames="p-2">
                        <Grid container spacing={0}>
                          <Grid item xs={4}>
                            <span
                              className={`display-7 center ${
                                x.company === "ctb" ? "badge-ctb" : ""
                              } ${x.company === "kmb" ? "badge-kmb" : ""} ${
                                x.company === "yb" ? "badge-reverse" : ""
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
                                  alt="CTB Logo"
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
                            <span className="display-7 badge-primary-super center">
                              <span className="display-8">往　</span>
                              {x.company === "kmb" &&
                                (x.terminus as { name_tc?: string }[])?.[0]
                                  ?.name_tc}
                              {x.company === "ctb" &&
                                (x.terminus as { data?: { name_tc?: string } })
                                  ?.data?.name_tc}
                              {x.company === "nlb" &&
                                (x.terminus as { data?: { name_tc?: string } })
                                  ?.data?.name_tc}
                              {x.company === "yb" && x.termName}
                            </span>
                          </Grid>
                          <Grid item xs={12}>
                            {x.company === "ctb" && (
                              <BackRoutesItemsCTBStop
                                stop={x}
                                route={x.route}
                                company={x.company}
                                terminus={x.terminus as { name_tc?: string }[]}
                                site="fav"
                                mode=""
                              />
                            )}
                            {x.company === "kmb" && (
                              <BackRoutesItemsStop
                                stop={x}
                                route={x.route}
                                company={x.company}
                                terminus={x.terminus as { name_tc?: string }[]}
                                site="fav"
                              />
                            )}
                            {x.company === "yb" && (
                              <BackRoutesItemsYellowStop
                                stopId={x.stop ?? ""}
                                stopSeq={Number(x.stopSeq)}
                                route={x.route}
                                routeId={x.routeId ?? ""}
                                routeSeq={Number(x.routeSeq)}
                                company={x.company}
                                termName={x.termName}
                                site="fav"
                              />
                            )}
                          </Grid>
                        </Grid>
                      </Card>
                    </React.Fragment>
                  ))}
            </Grid>
          </Grid>

          {typeof window !== "undefined"
            ? !window.localStorage.getItem("likedBack") &&
              !window.localStorage.getItem("likedBus") &&
              !window.localStorage.getItem("likedNlb") &&
              routeStopData.length === 0 && (
                <div className="badge-reverse center p-1 m-1">
                  😔
                  {t("fav.youHaveNoFav")}
                </div>
              )
            : false}

          {/* ── New-style route stop favourites ─── */}
          {routeStopData.length > 0 && (
            <Grid container spacing={0}>
              <Grid item xs={12} className="">
                {routeStopData.map((s, i) => (
                  <FavStopCard
                    key={`${s.company}-${s.route}-${s.stopId}-${i}`}
                    stop={s}
                    showRemove={editMode}
                    onRemove={() => props.onRouteStopRemoved?.()}
                  />
                ))}
              </Grid>
            </Grid>
          )}
        </>
      </Card>
    </>
  );
};

export default BusFavList;
