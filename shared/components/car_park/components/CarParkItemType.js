import { Grid } from "@mui/material";
import React, { Fragment } from "react";

const TYPES = {
  P: "私家車及貨VAN",
  M: "電單車",
  L: "客貨車",
  H: "重型客貨車",
  C: "長途汽車/巴士",
  T: "貨櫃車",
  B: "小型巴士",
};
const PAYMENT = {
  HOURLY: "時租",
  DAILY: "日租",
  MONTHLY: "月租",
};

const CarParkItemType = (props) => {
  return (
    <>
      <Grid container spacing={0}>
        {props.data.service_category.map((x) => (
          <Fragment key={x.category}>
            <Grid item xs={6}>
              <span className="badge-primary center">
                {TYPES[props.data.type]}
              </span>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={0}>
                <Grid item xs={6}>
                  <span className="badge-primary center">
                    {PAYMENT[x.category]}
                  </span>
                </Grid>
                <Grid item xs={6}>
                  {x.vacancy_type === "A" && (
                    <span
                      className={`${
                        x.vacancy === -1 && "badge-danger-outline display-8"
                      } ${x.vacancy === 0 && "badge-danger"} ${
                        x.vacancy > 0 && "badge-success"
                      } center`}
                    >
                      {" "}
                      {x.vacancy === -1 && "未能提供"}
                      {x.vacancy === 0 && "滿"}
                      {x.vacancy > 1 && x.vacancy}
                    </span>
                  )}

                  {x.vacancy_type === "B" && (
                    <span
                      className={`${
                        x.vacancy === -1 && "badge-danger-outline display-8"
                      } ${x.vacancy === 0 && "badge-danger"} ${
                        x.vacancy > 0 && "badge-success"
                      } center`}
                    >
                      {" "}
                      {x.vacancy === -1 && "未能提供"}
                      {x.vacancy === 0 && "滿"}
                      {x.vacancy === 1 && "有位"}
                    </span>
                  )}

                  {x.vacancy_type === "C" && (
                    <span className={`badge-danger center`}>停用中</span>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </>
  );
};

export default CarParkItemType;
