import { Grid } from "@mui/material";
import { useState } from "react";
import RoadStatusModal from "./RoadStatusModal";
import Card from "../../ui/Card";

const RoadStatusItem = (props) => {
  //Modal
  const [showModal, setShowModal] = useState(false);
  const openModalHandler = () => {
    setShowModal(true);
  };
  const closeModalHandler = () => {
    setShowModal(false);
  };

  return (
    <>
      <RoadStatusModal
        show={showModal}
        data={props.data}
        onClose={closeModalHandler}
      />
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Card classNames="p-2" onClick={openModalHandler}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <div className="banner banner-white display-75">
                  {props.data.ChinShort.toString().substring(0, 40)} ...
                </div>
                <div className="badge-primary-super display-8 mt-1 align-right">
                  {props.data.ReferenceDate}
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
