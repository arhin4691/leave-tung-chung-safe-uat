"use client";

import React, { useState } from "react";
import BusRoutesList from "./components/BusRoutesList";
import Input from "../ui/Input";
import { Grid } from "@mui/material";
import MtrRoutes from "./components/MtrRoutes";
import InitToast from "../ui/InitToast";
import type { BusRoute } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";

interface BusRoutesProps {
  kmbCtbYinghei: BusRoute[];
  nlbYinghei: BusRoute[];
  kmbCtbSeaview: BusRoute[];
  nlbSeaview: BusRoute[];
  kmbCtbSeaview2: BusRoute[];
  nlbSeaview2: BusRoute[];
  kmbCtbCitygate: BusRoute[];
  kmbCtbFutong: BusRoute[];
  nlbTungchung: BusRoute[];
  kmbCtbTungchung: BusRoute[];
  nlbTattung: BusRoute[];
  nlbYunga: BusRoute[];
}

type Company = "KMB" | "CTB" | "NLB" | "ALL";

function compare(a: BusRoute, b: BusRoute) {
  if (a.busRoute < b.busRoute) return -1;
  if (a.busRoute > b.busRoute) return 1;
  return 0;
}

const BUS_ROUTES_FUTONG_NLB: BusRoute[] = [];

const COMPANY_FILTERS: { label: string; value: Company }[] = [
  { label: "全部", value: "ALL" },
  { label: "KMB",  value: "KMB" },
  { label: "CTB",  value: "CTB" },
  { label: "NLB",  value: "NLB" },
];

const BusRoutes: React.FC<BusRoutesProps> = (props) => {
  const { t } = useLocale();
  const [showInput, setShowInput] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [company, setCompany] = useState<Company>("ALL");

  const onGet = (val: string) => setKeyword(val);
  const onSubmitHandler = (e: React.FormEvent) => e.preventDefault();
  const clearHandler = () => {
    setShowInput(false);
    setTimeout(() => setShowInput(true), 0);
  };

  const filterKmbCtb = (routes: BusRoute[]) => {
    if (company === "ALL") return routes;
    if (company === "KMB") return routes.filter((r) => r.type === "kmb");
    if (company === "CTB") return routes.filter((r) => r.type === "ctb");
    return [];
  };

  const filterNlb = (routes: BusRoute[]) => {
    if (company === "ALL" || company === "NLB") return routes;
    return [];
  };

  return (
    <div>
      <div className="mt-2 m-1">
        <form onSubmit={onSubmitHandler}>
          <Grid container spacing={0}>
            <Grid item xs={11}>
              {showInput ? (
                <Input
                  id="search"
                  type="text"
                  element="input"
                  placeholder={t("common.search")}
                  onInput={() => {}}
                  validators={[]}
                  onGetValue={onGet}
                  autocomplete="off"
                />
              ) : (
                <div className="m-3">1</div>
              )}
            </Grid>
            <Grid item xs={1}>
              <div className="ms-1 mt-2 text-white display-65" onClick={clearHandler}>
                ⛒
              </div>
            </Grid>
            <div className="mb-5">
              <InitToast
                message="本頁面即將停用, 請盡快到所有交通加回常用路線"
                theme="colored"
                duration={10000}
                type="error"
                position="top-center"
                className="top-over"
              />
            </div>
          </Grid>
        </form>

        {/* 公司篩選 */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "6px 4px 10px" }}>
          {COMPANY_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setCompany(value)}
              style={{
                padding: "5px 14px",
                borderRadius: 9999,
                border: "1px solid",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.18s",
                background: company === value ? "rgba(10,132,255,0.28)" : "rgba(255,255,255,0.07)",
                color: company === value ? "#60b8ff" : "rgba(255,255,255,0.60)",
                borderColor: company === value ? "rgba(10,132,255,0.55)" : "rgba(255,255,255,0.15)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {keyword === "" && <MtrRoutes />}

      <BusRoutesList
        keyword={keyword}
        routes={[]}
        nlbRoutes={filterNlb([...props.nlbYunga].sort(compare))}
        stopName="裕雅苑"
        location="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1846.6752395007254!2d113.94368017720657!3d22.278671244073823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDE2JzQzLjIiTiAxMTPCsDU2JzM4LjAiRQ!5e0!3m2!1szh-TW!2shk!4v1675957756076!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={filterKmbCtb([...props.kmbCtbYinghei].sort(compare))}
        nlbRoutes={filterNlb([...props.nlbYinghei].sort(compare))}
        stopName="迎禧路 (昇薈對面 西行 巴士站)"
        location="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d923.3404148461025!2d113.94464107721572!3d22.279003744054044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDE2JzQ0LjQiTiAxMTPCsDU2JzQxLjkiRQ!5e0!3m2!1szh-TW!2shk!4v1675957819042!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={filterKmbCtb([...props.kmbCtbSeaview].sort(compare))}
        nlbRoutes={filterNlb([...props.nlbSeaview].sort(compare))}
        stopName="海堤灣畔 (水藍天岸 南行 巴士站)"
        location="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d923.3430671673831!2d113.94563857721566!3d22.274948244065744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDE2JzI5LjgiTiAxMTPCsDU2JzQ0LjkiRQ!5e0!3m2!1szh-TW!2shk!4v1675957854028!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={filterKmbCtb([...props.kmbCtbSeaview2].sort(compare))}
        nlbRoutes={filterNlb([...props.nlbSeaview2].sort(compare))}
        stopName="海堤灣畔 (北行 巴士站)"
        location="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d923.3430671673831!2d113.94563857721566!3d22.274948244065744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDE2JzI5LjgiTiAxMTPCsDU2JzQ0LjkiRQ!5e0!3m2!1szh-TW!2shk!4v1675957854028!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={filterKmbCtb([...props.kmbCtbCitygate].sort(compare))}
        nlbRoutes={[]}
        stopName="東薈城 (達東路 南行 橋底)"
        location="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d923.3447194767026!2d113.94598757721549!3d22.272361244074553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDE2JzIwLjUiTiAxMTPCsDU2JzQ1LjkiRQ!5e0!3m2!1szh-TW!2shk!4v1675957893073!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={filterKmbCtb([...props.kmbCtbFutong].sort(compare))}
        nlbRoutes={filterNlb([...BUS_ROUTES_FUTONG_NLB].sort(compare))}
        stopName="富東廣場 (東涌站D出口對面馬路)"
        location="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d923.3413148508455!2d113.94531757721581!3d22.277360744059838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDE2JzM4LjUiTiAxMTPCsDU2JzQ0LjEiRQ!5e0!3m2!1szh-TW!2shk!4v1675957928165!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={filterKmbCtb([...props.kmbCtbTungchung].sort(compare))}
        nlbRoutes={filterNlb([...props.nlbTungchung].sort(compare))}
        stopName="東涌站巴士總站"
        location="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d923.3438432688834!2d113.94580607721557!3d22.273654744070504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDE2JzI1LjIiTiAxMTPCsDU2JzQ1LjMiRQ!5e0!3m2!1szh-TW!2shk!4v1675957973215!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={[]}
        nlbRoutes={filterNlb([...props.nlbTattung].sort(compare))}
        stopName="東涌達東路總站"
        location="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d923.3447194767026!2d113.94598757721549!3d22.272361244074553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDE2JzIwLjUiTiAxMTPCsDU2JzQ1LjkiRQ!5e0!3m2!1szh-TW!2shk!4v1675957893073!5m2!1szh-TW!2shk"
      />
    </div>
  );
};

export default BusRoutes;
