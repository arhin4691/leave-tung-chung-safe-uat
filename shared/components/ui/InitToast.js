import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import classes from "./InitToast.module.css";

const InitToast = (props) => {
  useEffect(() => {
    props.type === "success" &&
      toast.success(props.message, {
        position: props.position,
        autoClose: props.duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        toastId: "success1",
        className: classes[props.className],
      });

    props.type === "info" &&
      toast.info(props.message, {
        position: props.position,
        autoClose: props.duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        toastId: "info1",
        className: classes[props.className],
      });

    props.type === "warning" &&
      toast.warn(props.message, {
        position: props.position,
        autoClose: props.duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        toastId: "warn1",
        className: classes[props.className],
      });

    props.type === "error" &&
      toast.error(props.message, {
        position: props.position,
        autoClose: props.duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        toastId: "error1",
        className: classes[props.className],
      });
  }, []);
  return <ToastContainer />;
};

export default InitToast;
