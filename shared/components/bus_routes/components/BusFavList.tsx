"use client";

import { Grid } from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
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
} from "@/shared/types";
import { useFavouriteLists } from "@/shared/hooks/useFavouriteLists";

const LogoYellow = "/files/images/logo_yellow.png";
const LogoLWB = "/files/images/logo_lwb.png";
const LogoCTB = "/files/images/logo_ctb.png";
const LogoNLB = "/files/images/logo_nlb.png";

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface BusFavListProps {
  data: BusRoute[];
  backData: FavBackStop[] | string;
  nlbData: FavNlbStop[];
  mode?: string;
}

const BusFavList: React.FC<BusFavListProps> = (props) => {
  const { t } = useLocale();
  const [data, setData] = useState<BusRoute[]>(props.data);
  const [backData, setBackData] = useState<FavBackStop[] | string>(
    props.backData,
  );
  const [nlbData, setNlbData] = useState<FavNlbStop[]>(props.nlbData);
  const [editMode, setEditMode] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const {
    lists,
    selectedList,
    selectList,
    createList,
    renameList,
    deleteList,
    setDefaultList,
    removeRoute,
  } = useFavouriteLists();
  const [listMenuId, setListMenuId] = useState<string | null>(null);
  const [listNameMode, setListNameMode] = useState<"create" | "rename" | null>(
    null,
  );
  const [listTargetId, setListTargetId] = useState<string | null>(null);
  const [listName, setListName] = useState("");
  const [listNameError, setListNameError] = useState("");

  useEffect(() => {
    setData(props.data);
    setBackData(props.backData);
    setNlbData(props.nlbData);
  }, [props.data, props.backData, props.nlbData]);

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      () => { /* permission denied – fall back to number sort */ },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  const backDataArray = Array.isArray(backData) ? backData : [];

  const sortedNlbData = useMemo(
    () => [...nlbData].sort((a, b) => a.route.localeCompare(b.route)),
    [nlbData],
  );

  const sortedBackData = useMemo(() => {
    const list = [...backDataArray];
    if (userLat !== null && userLng !== null) {
      return list.sort((a, b) => {
        const aLat = parseFloat(a.lat ?? "");
        const aLng = parseFloat(a.long ?? "");
        const bLat = parseFloat(b.lat ?? "");
        const bLng = parseFloat(b.long ?? "");
        if (!isNaN(aLat) && !isNaN(aLng) && !isNaN(bLat) && !isNaN(bLng)) {
          return (
            haversineKm(userLat, userLng, aLat, aLng) -
            haversineKm(userLat, userLng, bLat, bLng)
          );
        }
        return a.route < b.route ? -1 : 1;
      });
    }
    return list.sort((a, b) => (a.route < b.route ? -1 : 1));
  }, [backDataArray, userLat, userLng]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedRouteStopData = useMemo(() => {
    const list = [...(selectedList?.routes ?? [])];
    if (userLat !== null && userLng !== null) {
      return list.sort((a, b) => {
        const aLat = parseFloat(a.lat ?? "");
        const aLng = parseFloat(a.long ?? "");
        const bLat = parseFloat(b.lat ?? "");
        const bLng = parseFloat(b.long ?? "");
        if (!isNaN(aLat) && !isNaN(aLng) && !isNaN(bLat) && !isNaN(bLng)) {
          return (
            haversineKm(userLat, userLng, aLat, aLng) -
            haversineKm(userLat, userLng, bLat, bLng)
          );
        }
        return a.route.localeCompare(b.route);
      });
    }
    return list.sort((a, b) => a.route.localeCompare(b.route));
  }, [selectedList, userLat, userLng]);

  const beginCreateList = () => {
    setListNameMode("create");
    setListTargetId(null);
    setListName("");
    setListNameError("");
    setListMenuId(null);
  };

  const saveListName = () => {
    const cleanName = listName.trim();
    if (!cleanName) {
      setListNameError(t("fav.nameRequired"));
      return;
    }
    if (cleanName.length > 12) {
      setListNameError(t("fav.nameTooLong"));
      return;
    }

    if (listNameMode === "create") {
      const created = createList(cleanName);
      if (!created) {
        setListNameError(t("fav.nameDuplicate"));
        return;
      }
      selectList(created.id);
    } else if (
      listNameMode === "rename" &&
      listTargetId &&
      !renameList(listTargetId, cleanName)
    ) {
      setListNameError(t("fav.nameDuplicate"));
      return;
    }
    setListNameMode(null);
    setListName("");
    setListNameError("");
  };

  const likedNLB = sortedNlbData.map((x, index) => (
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
  const showListTabs = lists.length > 1 || editMode;
  const activeFavouriteList = selectedList ?? lists[0];

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
            aria-label={editMode ? t("fav.done") : t("setting.edit")}
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
                {t("fav.done")}
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z" />
                </svg>
                {t("setting.edit")}
              </>
            )}
          </button>
        </div>
        {showListTabs && (
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
              }}
            >
              <div
                role="tablist"
                aria-label={t("home.favourite")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  flex: 1,
                  minWidth: 0,
                  overflowX: "auto",
                  padding: "2px 0 5px",
                  scrollbarWidth: "none",
                }}
              >
                {lists.map((list) => (
                  <div
                    key={list.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                      border: "1px solid",
                      borderColor:
                        selectedList?.id === list.id
                          ? "var(--accent-blue)"
                          : "var(--glass-border)",
                      borderRadius: 9999,
                      background:
                        selectedList?.id === list.id
                          ? "var(--accent-blue)"
                          : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={selectedList?.id === list.id}
                      onClick={() => {
                        selectList(list.id);
                        setListMenuId(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        border: 0,
                        borderRadius: 9999,
                        padding: editMode ? "6px 0 6px 11px" : "6px 11px",
                        background: "transparent",
                        color:
                          selectedList?.id === list.id
                            ? "#fff"
                            : "var(--text-secondary)",
                        whiteSpace: "nowrap",
                        font: "inherit",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {list.isDefault && <span aria-label={t("fav.default")}>📌</span>}
                      {list.name}
                    </button>
                    {editMode && (
                      <button
                        type="button"
                        aria-label={`${list.name} ${t("common.more")}`}
                        onClick={() =>
                          setListMenuId((current) =>
                            current === list.id ? null : list.id,
                          )
                        }
                        style={{
                          border: 0,
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          margin: "0 3px 0 1px",
                          background: "transparent",
                          color:
                            selectedList?.id === list.id
                              ? "rgba(255,255,255,0.9)"
                              : "var(--text-secondary)",
                          fontSize: 16,
                          lineHeight: 1,
                          cursor: "pointer",
                        }}
                      >
                        •••
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {editMode && (
                <button
                  type="button"
                  aria-label={t("fav.createNewList")}
                  onClick={beginCreateList}
                  style={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    border: "1px solid var(--accent-blue)",
                    borderRadius: "50%",
                    background: "rgba(10,132,255,0.16)",
                    color: "var(--accent-blue)",
                    fontSize: 21,
                    lineHeight: 1,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              )}
            </div>

            {listMenuId && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  padding: 8,
                  margin: "2px 0 7px",
                  borderRadius: 14,
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-bg)",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setDefaultList(listMenuId);
                    setListMenuId(null);
                  }}
                  style={listActionButtonStyle}
                >
                  📌 {t("fav.setDefault")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = lists.find((list) => list.id === listMenuId);
                    if (target) {
                      setListTargetId(target.id);
                      setListName(target.name);
                      setListNameMode("rename");
                      setListNameError("");
                    }
                    setListMenuId(null);
                  }}
                  style={listActionButtonStyle}
                >
                  {t("fav.renameList")}
                </button>
                <button
                  type="button"
                  disabled={lists.length <= 1}
                  onClick={() => {
                    deleteList(listMenuId);
                    setListMenuId(null);
                  }}
                  style={{
                    ...listActionButtonStyle,
                    color:
                      lists.length <= 1
                        ? "var(--text-secondary)"
                        : "var(--accent-red)",
                    opacity: lists.length <= 1 ? 0.5 : 1,
                  }}
                >
                  {t("fav.deleteList")}
                </button>
              </div>
            )}

            {listNameMode && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 7,
                  padding: 8,
                  margin: "2px 0 7px",
                  borderRadius: 14,
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <input
                  autoFocus
                  value={listName}
                  maxLength={12}
                  placeholder={t("fav.listNamePlaceholder")}
                  onChange={(event) => {
                    setListName(event.target.value);
                    setListNameError("");
                  }}
                  style={{
                    minWidth: 120,
                    flex: 1,
                    border: "1px solid var(--glass-border)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    background: "var(--glass-bg)",
                    color: "var(--text-primary)",
                    font: "inherit",
                    fontSize: 13,
                  }}
                />
                {listNameError && (
                  <span
                    role="alert"
                    style={{
                      flexBasis: "100%",
                      color: "var(--accent-red)",
                      fontSize: 11,
                    }}
                  >
                    {listNameError}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setListNameMode(null);
                    setListNameError("");
                  }}
                  style={listActionButtonStyle}
                >
                  {t("fav.cancel")}
                </button>
                <button
                  type="button"
                  onClick={saveListName}
                  style={{
                    ...listActionButtonStyle,
                    background: "var(--accent-blue)",
                    color: "#fff",
                  }}
                >
                  {listNameMode === "create" ? t("fav.create") : t("fav.done")}
                </button>
              </div>
            )}
          </div>
        )}
        <div
          style={{
            margin: "0 0 8px 14px",
            color: userLat !== null ? "#34C759" : "var(--text-secondary)",
            opacity: 0.75,
            fontSize: 10,
          }}
        >
          {userLat !== null ? t("common.sortNearest") : t("common.sortByNumber")}
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
                sortedBackData
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

          {data.length === 0 &&
            backDataArray.length === 0 &&
            nlbData.length === 0 &&
            (activeFavouriteList?.routes.length ?? 0) === 0 && (
              <div className="badge-reverse center p-1 m-1">
                😔
                {t("fav.youHaveNoFav")}
              </div>
            )}

          {/* ── New-style route stop favourites ─── */}
            {(activeFavouriteList?.routes.length ?? 0) > 0 && (
            <Grid container spacing={0}>
              <Grid item xs={12} className="">
                {sortedRouteStopData.map((s, i) => (
                  <FavStopCard
                    key={`${s.company}-${s.route}-${s.stopId}-${i}`}
                    stop={s}
                    showRemove={editMode}
                    onRemove={(stop) => {
                      if (activeFavouriteList) {
                        removeRoute(activeFavouriteList.id, stop);
                      }
                    }}
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

const listActionButtonStyle: React.CSSProperties = {
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "7px 9px",
  background: "rgba(255,255,255,0.06)",
  color: "var(--text-primary)",
  font: "inherit",
  fontSize: 11,
  cursor: "pointer",
};

export default BusFavList;
