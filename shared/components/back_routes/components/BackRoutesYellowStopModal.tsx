"use client";

import React, { useContext, useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { Grid } from "@mui/material";
import { UpdateContext } from "@/shared/context/update-context";
import Card from "../../ui/Card";

interface BackRoutesYellowStopModalProps {
  onClose: () => void;
  stop?: string;
  stopId?: string | number;
  stopSeq?: number;
  route?: string;
  routeId?: string | number;
  routeSeq?: number;
  termName?: string;
  orgName?: string;
  eta?: any;
  mode?: string;
  site?: string;
  lat?: number;
  long?: number;
  show: boolean;
  company?: string;
}

const BackRoutesYellowStopModal: React.FC<BackRoutesYellowStopModalProps> = (props) => {
  const updateCtx = useContext(UpdateContext);

  const obj = {
    route: props.route,
    routeId: props.routeId,
    routeCode: props.route,
    company: "yb",
    termName: props.termName,
    stop: props.stopId,
    curr: props.stop,
    routeSeq: props.routeSeq,
    stopSeq: props.stopSeq,
    data: props.stopSeq,
  };

  const [likeItem, setLikeItem] = useState<string>(() =>
    typeof window !== "undefined" ? window.localStorage.getItem("likedBack") || "" : ""
  );

  const [like, setLike] = useState<boolean>(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("likedBack") || ""
        : "";
    return (
      JSON.parse("[" + stored.replace(/,\s*$/, "") + "]").filter(
        (x: any) =>
          parseInt(x.stop) === parseInt(String(props.stopId)) &&
          parseInt(x.routeId) === parseInt(String(props.routeId))
      ).length > 0
    );
  });

  const likeHandler = () => {
    setLike(true);
    setLikeItem((prev) =>
      prev === "" ? JSON.stringify(obj) : prev + "," + JSON.stringify(obj)
    );
  };

  const unlikeHandler = () => {
    setLike(false);
    setLikeItem(
      JSON.stringify(
        JSON.parse("[" + likeItem.replace(/,\s*$/, "") + "]").filter(
          (x: any) => x.routeId !== props.routeId || x.stop !== props.stopId
        )
      ).slice(1, -1)
    );
  };

  useEffect(() => {
    localStorage.setItem("likedBack", likeItem);
    localStorage.setItem("likedBus", likeItem);
    updateCtx.update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [like]);

  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  useEffect(() => {
    setLike(
      JSON.parse("[" + likeItem.replace(/,\s*$/, "") + "]").filter(
        (x: any) =>
          parseInt(x.stop) === parseInt(String(props.stopId)) &&
          parseInt(x.routeId) === parseInt(String(props.routeId))
      ).length > 0
    );
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.show]);

  const calcMin = (timestamp: string) =>
    Math.floor((Date.parse(timestamp) / 1000 - now) / 60);

  const renderRow = (etaTs: string, size: string = "display-7") => (
    <Grid container spacing={0}>
      <Grid item xs={8}>
        {calcMin(etaTs) <= 0 ? (
          <span className={`badge-success-animate center ${size}`}>
            <span className="display-75 text-left">往 </span>
            {props.termName}
          </span>
        ) : (
          <div
            className={`${calcMin(etaTs) <= 5 ? "badge-warning-animate" : "badge-primary-super"} center ${size}`}
          >
            <span className="display-75 text-left">往 </span>
            {props.termName}
          </div>
        )}
      </Grid>
      <Grid item xs={4}>
        {calcMin(etaTs) <= 0 ? (
          <span className={`badge-success-animate center ${size}`}>到達</span>
        ) : (
          <div
            className={`${calcMin(etaTs) <= 5 ? "badge-warning-animate" : "badge-primary-super"} center ${size}`}
          >
            {calcMin(etaTs) ? (
              calcMin(etaTs)
            ) : (
              <span className="display-75">未有服務</span>
            )}
          </div>
        )}
      </Grid>
    </Grid>
  );

  const content =
    props.eta?.eta && props.eta.eta.length > 0 ? (
      <>
        {renderRow(props.eta.eta[0].timestamp, "display-7")}
        {props.eta.eta.length > 1 && renderRow(props.eta.eta[1].timestamp, "display-75")}
        {props.eta.eta.length > 2 && renderRow(props.eta.eta[2].timestamp, "display-75")}
      </>
    ) : (
      <span className="badge-danger">未有服務</span>
    );

  const map = (
    <Card disabled classNames="p-1">
      <iframe
        width="100%"
        height="150px"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        src={`//maps.google.com/maps?q=${props.lat},${props.long}&z=15&output=embed`}
        style={{ borderRadius: "10px", width: "100%", overflow: "hidden" }}
      ></iframe>
    </Card>
  );

  const header = (
    <>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <span className="badge-reverse">{props.route}</span>
          {like ? (
            <span className="align-right me-2" onClick={unlikeHandler}>
              ❤️
            </span>
          ) : (
            <span className="align-right me-2" onClick={likeHandler}>
              🤍
            </span>
          )}
        </Grid>
        <Grid item xs={2}>
          <span className="ms-2">➤</span>
        </Grid>
        <Grid item xs={10}>
          <span className="ms-2">{props.stop}</span>
        </Grid>
      </Grid>
    </>
  );

  const footer = (
    <Button outline onClick={props.onClose}>
      關閉
    </Button>
  );

  return (
    <Modal
      show={props.show}
      onCancel={props.onClose}
      size="sm"
      header={header}
      footer={footer}
    >
      {content}
      {map}
    </Modal>
  );
};

export default BackRoutesYellowStopModal;
