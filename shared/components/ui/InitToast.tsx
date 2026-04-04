"use client";

import React, { useEffect } from "react";
import { toast } from "react-toastify";
import classes from "./InitToast.module.css";

interface InitToastProps {
  message: string;
  type: "success" | "info" | "warning" | "error";
  theme?: string;
  duration?: number;
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
  className?: string;
}

const InitToast: React.FC<InitToastProps> = (props) => {
  useEffect(() => {
    const opts: any = {
      position: props.position,
      autoClose: props.duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      className: classes[props.className ?? ""],
    };
    if (props.type === "success") toast.success(props.message, { ...opts, toastId: "success1" });
    if (props.type === "info") toast.info(props.message, { ...opts, toastId: "info1" });
    if (props.type === "warning") toast.warn(props.message, { ...opts, toastId: "warn1" });
    if (props.type === "error") toast.error(props.message, { ...opts, toastId: "error1" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default InitToast;
