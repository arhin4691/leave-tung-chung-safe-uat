import React, { useState } from "react";
import BusRoutesList from "./components/BusRoutesList";
import Input from "../ui/Input";
import { Grid } from "@mui/material";
import MtrRoutes from "./components/MtrRoutes";
import InitToast from "../ui/InitToast";

const BUS_ROUTES_FUTONG_NLB = [];

function compare(a, b) {
  if (a.busRoute < b.busRoute) {
    return -1;
  }
  if (a.busRoute > b.busRoute) {
    return 1;
  }
  return 0;
}

const BusRoutes = (props) => {
  const [showInput, setShowInput] = useState(true);
  const [keyword, setKeyword] = useState("");
  const searchHandler = () => {};
  const onGet = (val) => {
    setKeyword(val);
  };
  const onSubmitHandler = (e) => {
    e.preventDefault();
  };
  const clearHandler = () => {
    setShowInput(false);
    setTimeout(() => {
      setShowInput(true);
    }, 0);
  };

  //Alert
  return (
    <div>
      <div className="mt-2 m-1">
        <form onSubmit={onSubmitHandler}>
          <Grid container spacing={0}>
            <Grid xs={11}>
              {showInput ? (
                <Input
                  id="search"
                  type="text"
                  element="input"
                  placeholder={"搜 尋"}
                  onInput={searchHandler}
                  validators={[]}
                  sticky
                  onGetValue={onGet}
                  autocomplete={"off"}
                />
              ) : (
                <div className="m-3">1</div>
              )}
            </Grid>
            <Grid xs={1}>
              <div
                className="ms-1 mt-2 text-white display-65"
                onClick={clearHandler}
              >
                ⛒
              </div>
            </Grid>
            <div className="mb-5">
              <InitToast
                message={`本頁面即將停用, 請盡快到所有交通加回常用路線`}
                theme="colored"
                duration={10000}
                type="error"
                position="top-center"
                className="top-over"
              />
            </div>
          </Grid>
        </form>
      </div>
      {keyword === "" && (
        <>
          <MtrRoutes />
        </>
      )}
      <BusRoutesList
        keyword={keyword}
        routes={[]}
        nlbRoutes={props.nlbYunga.sort(compare)}
        stopName={"裕雅苑"}
        location="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d922.885430194704!2d113.94624882923922!3d22.29534323992744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDE3JzQzLjIiTiAxMTPCsDU2JzQ4LjUiRQ!5e0!3m2!1szh-TW!2shk!4v1679997372361!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={props.kmbCtbYinghei.sort(compare)}
        nlbRoutes={props.nlbYinghei.sort(compare)}
        stopName={"迎禧路 (昇薈對面 西行 巴士站)"}
        location="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.604705824451!2d113.95145946927698!3d22.292958980731086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403e2b460f36df1%3A0xf80ea903ad6050c4!2z6L-O56an6Lev!5e0!3m2!1szh-TW!2shk!4v1677752726767!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={props.kmbCtbSeaview.sort(compare)}
        nlbRoutes={props.nlbSeaview.sort(compare)}
        stopName={"海堤灣畔 (水藍天岸 南行 巴士站)"}
        location="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1305.1848045089944!2d113.94384627631942!3d22.292376060239597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403e2b0ea5f35a3%3A0x7eac4ca8df21b24c!2z5rW35aCk54Gj55WUOyDmg6DmnbHot68!5e0!3m2!1szh-TW!2shk!4v1677752698081!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={props.kmbCtbSeaview2.sort(compare)}
        nlbRoutes={props.nlbSeaview2.sort(compare)}
        stopName={"海堤灣畔 (北行 巴士站)"}
        location="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1305.1848045089944!2d113.94384627631942!3d22.292376060239597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403e2b0eb6705bd%3A0xd6a481ce24ee5fcf!2z5rW35aCk54Gj55WU!5e0!3m2!1szh-TW!2shk!4v1677752673870!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={props.kmbCtbCitygate.sort(compare)}
        nlbRoutes={[]}
        stopName={"東薈城 (達東路 南行 橋底)"}
        location="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d922.9244161535335!2d113.94160889479484!3d22.28943964213293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403e2b009ed865b%3A0xc0099ba5fb9ef003!2z5p2x6JaI5Z-OOyDpgZTmnbHot68!5e0!3m2!1szh-TW!2shk!4v1677752652711!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={props.kmbCtbFutong.sort(compare)}
        nlbRoutes={BUS_ROUTES_FUTONG_NLB.sort(compare)}
        stopName={"富東廣場 (東涌站D出口對面馬路)"}
        location="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d922.9263170491918!2d113.94160889479484!3d22.289151753802567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403e2b001eb7767%3A0x8abb1832491f97bd!2z5a-M5p2x5buj5aC0OyDpgZTmnbHot68!5e0!3m2!1szh-TW!2shk!4v1677752632769!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={props.kmbCtbTungchung.sort(compare)}
        nlbRoutes={props.nlbTungchung.sort(compare)}
        stopName={"東涌站巴士總站"}
        location="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d922.9229576945851!2d113.94010953995554!3d22.2896605215705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403e2bab58d9af1%3A0x2d950810d6c6fa1f!2z5p2x5raM56uZOyDmnbHmtozluILkuK3lv4M!5e0!3m2!1szh-TW!2shk!4v1677752616279!5m2!1szh-TW!2shk"
      />
      <BusRoutesList
        keyword={keyword}
        routes={[]}
        nlbRoutes={props.nlbTattung.sort(compare)}
        stopName={"東涌達東路總站"}
        location="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d922.9177833298838!2d113.93957546015275!3d22.29044414755186!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403e2bae77966d7%3A0x58295e90c8263a68!2z5p2x5raM6YGU5p2x6Lev5be05aOr57i956uZ!5e0!3m2!1szh-TW!2shk!4v1677752582890!5m2!1szh-TW!2shk"
      />
    </div>
  );
};

export default BusRoutes;
