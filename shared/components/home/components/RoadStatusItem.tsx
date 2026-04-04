"use client";

import { Grid } from "@mui/material";
import React, { useState } from "react";
import RoadStatusModal from "./RoadStatusModal";
import Card from "../../ui/Card";
import type { RoadStatusMessage } from "@/shared/types";

interface RoadStatusItemProps {
  data: RoadStatusMessage;
}

const RoadStatusItem: React.FC<RoadStatusItemProps> = (props) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <RoadStatusModal show={showModal} data={props.data} onClose={() => setShowModal(false)} />
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Card classNames="p-2" onClick={() => setShowModal(true)}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <div className="banner banner-white display-75">
                  {(props.data.ChinShort?.[0] ?? "").substring(0, 40)} ...
                </div>
                <div className="badge-primary-super display-8 mt-1 align-right">
                  {props.data.ReferenceDate?.[0]}
                </div>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default RoadStatusItem;
