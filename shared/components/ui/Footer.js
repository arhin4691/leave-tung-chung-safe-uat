import React from "react";
import classes from "./Footer.module.css";

function Footer(props) {
  const date = new Date();
  let year = date.getFullYear();

  return (
    <>
      <div className={`${classes.footer} ${classes.center}`}>
        <div className="align-left">
          ©{year} - 東涌出行<br />
          <span className="ps-3" style={{ fontSize: "10px" }}>
            Powered by Amos
          </span>
        </div>
      </div>
    </>
  );
}

export default Footer;
