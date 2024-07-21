import { Grid } from "@mui/material";
import React, { useState } from "react";
import MtrItem from "./MtrItem";

const MtrRoutes = () => {
  const [open, setOpen] = useState(true);
  const openHandler = () => {
    setOpen(!open);
  };
  return (
    <div className="white-background m-1 p-1">
      <Grid container spacing={0}>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <span
            className="p-2 display-7 banner banner-secondary"
            onClick={openHandler}
          >
            地鐵
          </span>
        </Grid>
      </Grid>
      {open && <MtrItem line={"TCL"} station={"TUC"} />}
    </div>
  );
};

export default MtrRoutes;
