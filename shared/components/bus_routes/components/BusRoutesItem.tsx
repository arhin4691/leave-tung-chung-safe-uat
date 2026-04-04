"use client";

import { Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import BusModal from "./BusModal";
import type { BusRoute } from "@/shared/types";

// Normalized ETA shape returned by /api/bus-stop-eta
export interface EtaItemNormalized {
  eta: string;
  dest: string;
  dest_en: string;
  rmk: string;
  rmk_en: string;
}

interface BusRoutesItemProps {
  data: BusRoute;
  site?: string;
  /** Pre-fetched ETAs from the parent BusRoutesList (one-shot batch call).
   *  When provided the component skips its own network request. */
  externalEta?: EtaItemNormalized[];
}

const BusRoutesItem: React.FC<BusRoutesItemProps> = (props) => {
  const [etaItems, setEtaItems] = useState<EtaItemNormalized[]>([]);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [detailModal, setDetailModal] = useState(false);

  // ── Tick every 5 s to keep minute counters fresh ────────────────
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 5000);
    return () => clearInterval(id);
  }, []);

  // ── If pre-fetched data is injected, use it directly ───────────
  useEffect(() => {
    if (props.externalEta !== undefined) {
      setEtaItems(props.externalEta);
    }
  }, [props.externalEta]);

  // ── Fallback: per-item proxy call (used by BusFavList / legacy) ─
  //    Calls our own backend — never the external APIs directly.
  useEffect(() => {
    if (props.externalEta !== undefined) return; // already handled above

    const fetchData = async () => {
      try {
        let url = "";
        const { type, busRoute, busStop, routeId } = props.data;
        if (type === "kmb") {
          url = `/api/bus-eta?type=kmb&route=${busRoute}&stop=${busStop}&serviceType=1`;
        } else if (type === "ctb") {
          url = `/api/bus-eta?type=ctb&route=${busRoute}&stop=${busStop}`;
        } else if (type === "nlb") {
          url = `/api/bus-eta?type=nlb&routeId=${routeId}&stop=${busStop}`;
        }
        if (!url) return;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        // /api/bus-eta returns { eta: EtaItem[] } where EtaItem has .eta / .dest / .dest_en
        const normalized: EtaItemNormalized[] = (json.eta ?? []).map((x: any) => ({
          eta: x.eta,
          dest: x.dest,
          dest_en: x.dest_en,
          rmk: x.rmk,
          rmk_en: x.rmk_en,
        }));
        setEtaItems(normalized);
      } catch {}
    };

    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data, props.externalEta]);

  const calcMin = (ts: string) =>
    Math.floor((Date.parse(ts) / 1000 - now) / 60);

  const companyBadge =
    props.data.type === "kmb"
      ? "badge-kmb"
      : props.data.type === "ctb"
      ? "badge-ctb"
      : "badge-success-super";

  return (
    <>
      {detailModal && (
        <BusModal onClose={() => setDetailModal(false)} data={props.data} />
      )}
      <div
        className="white-background-animated m-2 p-2"
        onClick={() => setDetailModal(!detailModal)}
      >
        {props.site === "fav" && (
          <span className="badge-primary-super display-8">
            {props.data.routeStop[0]}
          </span>
        )}
        <Grid container spacing={0}>
          {/* Route pill + destination */}
          <Grid item xs={3}>
            <div className={`center display-6 ${companyBadge}`}>
              {props.data.busRoute}
            </div>
            <div>
              {props.data.to.map((x) => (
                <div className="display-9 badge-success-outline" key={x}>
                  {x}
                </div>
              ))}
            </div>
          </Grid>

          {/* ETA columns */}
          <Grid item xs={9}>
            {etaItems.length > 0 ? (
              <Grid container spacing={0}>
                <Grid item xs={8}>
                  {etaItems.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className={`${
                        i === 0
                          ? calcMin(item.eta) <= 0
                            ? "badge-success-animate"
                            : calcMin(item.eta) <= 5
                            ? "badge-warning-animate"
                            : "badge-primary"
                          : "badge-primary"
                      } ${i === 0 ? "display-75" : "display-8"} center`}
                    >
                      往{" "}
                      <span className={i === 0 ? "display-7 center" : "display-75 center"}>
                        {item.dest || props.data.to[props.data.to.length - 1]}
                      </span>
                    </div>
                  ))}
                </Grid>
                <Grid item xs={4}>
                  {etaItems.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className={`${
                        i === 0
                          ? calcMin(item.eta) <= 0
                            ? "badge-success-animate"
                            : calcMin(item.eta) <= 5
                            ? "badge-warning-animate"
                            : "badge-primary"
                          : "badge-primary"
                      } center ${i === 0 ? "display-7" : "display-75"}`}
                    >
                      {calcMin(item.eta) <= 0 ? (
                        <span>到達</span>
                      ) : (
                        calcMin(item.eta)
                      )}
                    </div>
                  ))}
                </Grid>
              </Grid>
            ) : (
              <>
                <div className="badge-primary center display-75">
                  往{" "}
                  <span className="display-7 center">
                    {props.data.to[props.data.to.length - 1]}
                  </span>
                </div>
                <span className="badge-danger center display-7">未開</span>
              </>
            )}
          </Grid>

          {/* Spec badges */}
          {props.data.spec.map((x) => (
            <span className="badge-primary-outline display-9" key={x}>
              {x}
            </span>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default BusRoutesItem;

