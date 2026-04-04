"use client";

import { UpdateContext } from "@/shared/context/update-context";
import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import { useLocale } from "@/shared/context/locale-context";
import BusStopEtaView from "./BusStopEtaView";
import type { BackModalStop, EtaEntry } from "@/shared/types";

interface BackRoutesModalProps {
  onClose: () => void;
  stop: BackModalStop;
  route: string;
  routeId?: string | number;
  terminus: unknown;
  eta: EtaEntry[];
  mode: "kmb" | "ctb" | "nlb";
  site?: string;
  lat?: string;
  long?: string;
  reverse?: boolean;
  show: boolean;
  company?: string;
}

const BackRoutesModal: React.FC<BackRoutesModalProps> = (props) => {
  const { t } = useLocale();

  const obj: Record<string, unknown> = {
    route: props.route,
    routeId: props.routeId,
    company: props.mode === "ctb" ? "ctb" : "kmb",
    terminus: props.terminus,
    ...props.stop,
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
        (x: Record<string, unknown>) => x.stop === props.stop.stop && x.route === props.route
      ).length > 0
    );
  });

  const [likeNlb, setLikeNlb] = useState<string>(() =>
    typeof window !== "undefined" ? window.localStorage.getItem("likedNlb") || "" : ""
  );

  const [like2, setLike2] = useState<boolean>(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("likedNlb") || ""
        : "";
    return (
      JSON.parse("[" + stored.replace(/,\s*$/, "") + "]").filter(
        (x: Record<string, unknown>) => x.stopId === props.stop.stopId && x.route === props.route
      ).length > 0
    );
  });

  const likeHandler = () => {
    setLike(true);
    toast.success(t("bus.addFav"), {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
      toastId: "successAdd",
    });
    setLikeItem((prev) =>
      prev === "" ? JSON.stringify(obj) : prev + "," + JSON.stringify(obj)
    );
  };

  const unlikeHandler = () => {
    setLike(false);
    toast.error(t("bus.removeFav"), {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
      toastId: "errorAdd",
    });
    setLikeItem(
      JSON.stringify(
        JSON.parse("[" + likeItem.replace(/,\s*$/, "") + "]").filter(
          (x: Record<string, unknown>) => x.route !== props.route || x.stop !== props.stop.stop
        )
      ).slice(1, -1)
    );
  };

  const likeNLBHandler = () => {
    setLike2(true);
    toast.success(t("bus.addFav"), {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
      toastId: "successAdd",
    });
    setLikeNlb((prev) =>
      prev === "" ? JSON.stringify(obj) : prev + "," + JSON.stringify(obj)
    );
  };

  const unlikeNLBHandler = () => {
    setLike2(false);
    toast.error(t("bus.removeFav"), {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
      toastId: "errorAdd",
    });
    setLikeNlb(
      JSON.stringify(
        JSON.parse("[" + likeNlb.replace(/,\s*$/, "") + "]").filter(
          (x: Record<string, unknown>) => x.stopId !== props.stop.stopId
        )
      ).slice(1, -1)
    );
  };

  const updateCtx = useContext(UpdateContext);

  useEffect(() => {
    localStorage.setItem("likedBack", likeItem);
    localStorage.setItem("likedNlb", likeNlb);
    localStorage.setItem("likedBus", likeItem);
    updateCtx.update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [like, like2]);

  // ── Resolve stop display info ─────────────────────────────────
  const stopNameTc =
    props.mode === "nlb"
      ? (props.stop.stopName_c ?? "")
      : (props.stop.name_tc ?? "");

  const stopNameEn =
    props.mode === "nlb"
      ? (props.stop.stopName_e ?? "")
      : (props.stop.name_en ?? "");

  const stopId =
    props.mode === "nlb"
      ? String(props.stop.stopId ?? "")
      : (props.stop.stop ?? "");

  const isLiked = props.mode === "nlb" ? like2 : like;
  const onLike = props.mode === "nlb" ? likeNLBHandler : likeHandler;
  const onUnlike = props.mode === "nlb" ? unlikeNLBHandler : unlikeHandler;

  const terminusArr = props.terminus as Array<{
    stopName_c?: string;
    stopName_e?: string;
    name_tc?: string;
  }>;
  const nlbDest =
    props.mode === "nlb"
      ? (terminusArr?.[terminusArr?.length - 1]?.stopName_c ?? "")
      : "";
  const nlbDestEn =
    props.mode === "nlb"
      ? (terminusArr?.[terminusArr?.length - 1]?.stopName_e ?? "")
      : "";

  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
      }}
    >
      <span
        className={
          props.mode === "ctb"
            ? "badge-ctb-green"
            : props.mode === "kmb"
            ? "badge-kmb"
            : "badge-nlb"
        }
        style={{ fontSize: "17px", fontWeight: 800 }}
      >
        {props.route}
      </span>
      <span
        style={{
          fontWeight: 600,
          fontSize: "14px",
          color: "var(--text-secondary)",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {stopNameTc}
      </span>
      <button
        type="button"
        onClick={isLiked ? onUnlike : onLike}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "22px",
          lineHeight: 1,
          padding: "2px 4px",
          flexShrink: 0,
        }}
        aria-label={isLiked ? t("bus.removeFav") : t("bus.addFav")}
      >
        {isLiked ? "❤️" : "🤍"}
      </button>
    </div>
  );

  const footer = (
    <Button outline onClick={props.onClose}>
      {t("common.close")}
    </Button>
  );

  return (
    <Modal
      show={props.show}
      header={header}
      footer={footer}
      onCancel={props.onClose}
      size="sm"
      stickyHead
      stickyFoot
    >
      <BusStopEtaView
        stopId={stopId}
        stopNameTc={stopNameTc}
        stopNameEn={stopNameEn || undefined}
        company={props.mode}
        lat={props.lat ?? props.stop.lat}
        long={props.long ?? props.stop.long}
        currentRoute={props.route}
        nlbEtas={props.mode === "nlb" ? props.eta : undefined}
        nlbDest={nlbDest || undefined}
        nlbDestEn={nlbDestEn || undefined}
      />
    </Modal>
  );
};

export default BackRoutesModal;

