"use client";

import React, { useState, useEffect, useContext } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { UpdateContext } from "@/shared/context/update-context";
import { toast } from "react-toastify";
import type { BusRoute } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";

interface BusModalProps {
  onClose: () => void;
  data: BusRoute;
}

const BusModal: React.FC<BusModalProps> = (props) => {
  const { t } = useLocale();

  const [likeItem, setLikeItem] = useState<string>(() =>
    typeof window !== "undefined" ? window.localStorage.getItem("likedBus") || "" : ""
  );

  const [like, setLike] = useState<boolean>(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("likedBus") || "" : "";
    return JSON.parse("[" + stored.replace(/,\s*$/, "") + "]").filter(
      (x: BusRoute) => x.busRoute === props.data.busRoute
    ).length > 0;
  });

  const updateCtx = useContext(UpdateContext);

  useEffect(() => {
    localStorage.setItem("likedBus", likeItem);
    updateCtx.update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [like]);

  const likeHandler = () => {
    setLike(true);
    toast.success(t("bus.addFav"), {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
      toastId: "successAdd",
    });
    setLikeItem((prev) => (prev === "" ? JSON.stringify(props.data) : prev + "," + JSON.stringify(props.data)));
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
          (x: BusRoute) => x.busRoute !== props.data.busRoute
        )
      ).slice(1, -1)
    );
  };

  const header = (
    <span className="p-0 m-0">
      {t("bus.route")} {props.data.busRoute}
      <span className="align-right">
        {like ? (
          <span className="me-2" onClick={unlikeHandler}>❤️</span>
        ) : (
          <span className="me-2" onClick={likeHandler}>🤍</span>
        )}
      </span>
    </span>
  );

  const footer = (
    <Button outline onClick={props.onClose}>
      {t("common.close")}
    </Button>
  );

  const content = (
    <div>
      {props.data.routeStop.map((x, index) => (
        <div
          key={index}
          className={index === 0 ? "badge-rainbow-outline" : "badge-primary-outline"}
        >
          {x}
        </div>
      ))}
    </div>
  );

  return (
    <Modal show header={header} footer={footer} onCancel={props.onClose}>
      {content}
    </Modal>
  );
};

export default BusModal;
