import Modal from "../../ui/Modal";
import React from "react";
import Button from "../../ui/Button";
import { Grid } from "@mui/material";

const RoadStatusModal = (props) => {
  const header = <div className="ms-2">交通消息 - {props.data.msgID}</div>;
  const footer = (
    <>
      <Button onClick={props.onClose}>收到明白</Button>
    </>
  );
  const all = props.data.ChinText[0].split("。");
  const content = (
    <>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          {all.slice(0,-1).map((x) => (
            <div className="m-4 text-primary display-7" key={x}>{x}。</div>
          ))}
        </Grid>
        <span className="mt-5 display-8 badge-secondary align-right">
          {props.data.ReferenceDate}
        </span>
      </Grid>
    </>
  );
  return (
    <Modal show={props.show} header={header} footer={footer} onCancel={props.onClose} size={"sm"}>
      {content}
    </Modal>
  );
};

export default RoadStatusModal;
