import { Grid } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import errorPic from "../../../../public/files/images/404Pic.png";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import CarParkItemType from "./CarParkItemType";

const CarParkItem = (props) => {
  const [data, setData] = useState([]);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const intervalID = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 30000);

    return () => clearInterval(intervalID);
  }, [now]);

  const fetch = async () => {
    try {
      const res = await axios.get(
        `https://resource.data.one.gov.hk/td/carpark/vacancy_${props.data.park_id}.json`
      );
      setData(res.data.car_park[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch();
  }, [now]);
  //Modal
  const [modal, setModal] = useState(false);

  //Google Map
  const map = (
    <iframe
      width="100%"
      height="150px"
      frameborder="0"
      marginheight="0"
      marginwidth="0"
      src={`//maps.google.com/maps?q=${props.data.latitude},${props.data.longitude}&z=15&output=embed`}
    ></iframe>
  );
  return (
    <>
      {modal && (
        <Modal
          show
          header={props.data.name_tc}
          footer={<Button onClick={() => setModal(false)}>好的</Button>}
          onCancel={() => setModal(false)}
        >
          <img
            style={{ width: "100%" }}
            src={props.data.carpark_photo || errorPic}
            alt="Car Park Photo"
          />
          {map}
        </Modal>
      )}
      <div className="white-background m-2 p-2" onClick={() => setModal(true)}>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <span
                  className={`${
                    props.data.opening_status === "OPEN"
                      ? "badge-success-animate"
                      : "badge-danger"
                  } display-7`}
                >
                  {props.data.opening_status === "OPEN" ? "運作中" : "關閉中"}
                </span>
                <span className="badge-primary-super display-7">
                  {props.data.name_tc}
                </span>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={0}>
                  <Grid item xs={6}>
                    <span className="banner banner-secondary center m-1">
                      車種
                    </span>
                  </Grid>
                  <Grid item xs={6}>
                    <span className="banner banner-secondary center m-1">
                      資料
                    </span>
                  </Grid>
                </Grid>
                {data.vehicle_type?.map((x) => (
                  <CarParkItemType data={x} key={x.type}/>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default CarParkItem;
