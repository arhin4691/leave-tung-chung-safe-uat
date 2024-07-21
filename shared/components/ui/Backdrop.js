import React from "react";
import ReactDOM from "react-dom";

import { Backdrop as MuiBackDrop } from "@mui/material";

const Backdrop = (props) => {
  // return ReactDOM.createPortal(
  //   <div className="backdrop" onClick={props.onClick}></div>,
  //   document.getElementById('backdrop-hook')
  // );
  return ReactDOM.createPortal(
    <MuiBackDrop open={props.show || false} onClick={props.onClick} />,

    document.getElementById("backdrop-hook")
  );
};

export default Backdrop;
