import { UpdateContext } from "@/shared/context/update-context";
import { Box, Grid, LinearProgress } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Card from "../../ui/Card";

const BackRoutesModal = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const termName =
    props.mode === "nlb"
      ? props.terminus[0].stopName_c
      : props.mode === "ctb"
        ? props.site === "fav"
          ? props.terminus.name_tc
          : props.terminus.data.name_tc
        : props.terminus[0].name_tc;

  const obj = {
    ...{
      route: props.route,
      routeId: props.routeId,
      company: props.mode === "ctb" ? "ctb" : "kmb",
      terminus: props.terminus,
    },
    ...props.stop,
  };
  //Like items
  const [likeItem, setLikeItem] = useState(
    window.localStorage.getItem("likedBack") || ""
  );
  const [like, setLike] = useState(
    JSON.parse("[" + likeItem.replace(/,\s*$/, "") + "]").filter(
      (x) => x.stop === props.stop.stop && x.route === props.route
    ).length > 0
  );

  const likeHandler = () => {
    setLike(true);
    toast.success("已加入常用", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      toastId: "successAdd",
    });
    likeItem === ""
      ? setLikeItem((prev) => prev + JSON.stringify(obj))
      : setLikeItem((prev) => prev + "," + JSON.stringify(obj));
  };

  const unlikeHandler = () => {
    setLike(false);
    toast.error("已從常用刪除", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      toastId: "errorAdd",
    });
    setLikeItem(
      JSON.stringify(
        JSON.parse("[" + likeItem.replace(/,\s*$/, "") + "]").filter(
          (x) => x.route !== props.route || x.stop !== props.stop.stop
        )
      ).slice(1, -1)
    );
  };

  //Like NLB
  const [likeNlb, setLikeNlb] = useState(
    window.localStorage.getItem("likedNlb") || ""
  );

  const [like2, setLike2] = useState(
    JSON.parse("[" + likeNlb.replace(/,\s*$/, "") + "]").filter(
      (x) => x.stopId === props.stop.stopId && x.route === props.route
    ).length > 0
  );

  const likeNLBHandler = () => {
    setLike2(true);
    toast.success("已加入常用", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      toastId: "successAdd",
    });

    likeNlb === ""
      ? setLikeNlb((prev) => prev + JSON.stringify(obj))
      : setLikeNlb((prev) => prev + "," + JSON.stringify(obj));
  };
  const unlikeNLBHandler = () => {
    setLike2(false);
    toast.error("已從常用刪除", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      toastId: "errorAdd",
    });
    setLikeNlb(
      JSON.stringify(
        JSON.parse("[" + likeNlb.replace(/,\s*$/, "") + "]").filter(
          (x) => x.stopId !== props.stop.stopId
        )
      ).slice(1, -1)
    );
  };

  const updateCtx = useContext(UpdateContext);
  useEffect(() => {
    localStorage.setItem("likedBack", likeItem);
    localStorage.setItem("likedNlb", likeNlb);
    localStorage.setItem("likedBus", likeItem);
    updateCtx.update();
  }, [like, like2]);

  //Refresh
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const header = (
    <>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <span
            className={`${props.mode === "ctb" && "badge-ctb"} ${
              props.mode === "kmb" && "badge-kmb"
            }
            ${props.mode === "nlb" && "badge-success"}`}
          >
            {props.route}
          </span>
          {like || like2 ? (
            <span
              className="align-right me-2"
              onClick={props.mode === "nlb" ? unlikeNLBHandler : unlikeHandler}
            >
              ❤️
            </span>
          ) : (
            <span
              className="align-right me-2"
              onClick={props.mode === "nlb" ? likeNLBHandler : likeHandler}
            >
              🤍
            </span>
          )}
        </Grid>
        <Grid item xs={2}>
          <span className="ms-2">➤</span>
        </Grid>
        <Grid item xs={10}>
          {props.mode === "nlb" ? props.stop.stopName_c : props.stop.name_tc}
        </Grid>
      </Grid>
    </>
  );

  const footer = (
    <Button outline onClick={props.onClose}>
      關閉
    </Button>
  );

  const content_0 =
    props.eta.length > 0 ? (
      <>
        <Grid container spacing={0}>
          <Grid item xs={8}>
            {Math.floor(
              (Date.parse(
                props.mode === "nlb"
                  ? props.eta[0].estimatedArrivalTime
                  : props.eta[0].eta
              ) /
                1000 -
                now) /
                60
            ) <= 0 ? (
              <span className={`badge-success-animate center display-7`}>
                <span className={`display-75 text-left`}>往 </span>
                {termName}
                <>
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                   !props.reverse &&
                    props.eta[0].dir === "O" && (
                      <>
                        <span className="display-9 badge-danger">回程車</span>
                      </>
                    )}
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                    props.reverse &&
                    props.eta[0].dir === "I" && (
                      <>
                        <span className="display-9 badge-danger">回程車</span>
                      </>
                    )}
                </>
              </span>
            ) : (
              <div
                className={`${
                  Math.floor(
                    (Date.parse(
                      props.mode === "nlb"
                        ? props.eta[0].estimatedArrivalTime
                        : props.eta[0].eta
                    ) /
                      1000 -
                      now) /
                      60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary-super"
                } center display-7`}
              >
                <span className={`display-75 text-left`}>往 </span>
                {termName}
                <>
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                   !props.reverse &&
                    props.eta[0].dir === "O" && (
                      <>
                        <span className="display-9 badge-danger">回程車</span>
                      </>
                    )}
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                    props.reverse &&
                    props.eta[0].dir === "I" && (
                      <>
                        <span className="display-9 badge-danger">回程車</span>
                      </>
                    )}
                </>
              </div>
            )}
          </Grid>
          <Grid item xs={4}>
            {Math.floor(
              (Date.parse(
                props.mode === "nlb"
                  ? props.eta[0].estimatedArrivalTime
                  : props.eta[0].eta
              ) /
                1000 -
                now) /
                60
            ) <= 0 ? (
              <span className="badge-success-animate center display-7">
                到達
              </span>
            ) : (
              <div
                className={`${
                  Math.floor(
                    (Date.parse(
                      props.mode === "nlb"
                        ? props.eta[0].estimatedArrivalTime
                        : props.eta[0].eta
                    ) /
                      1000 -
                      now) /
                      60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary-super"
                } center display-7`}
              >
                {Math.floor(
                  (Date.parse(
                    props.mode === "nlb"
                      ? props.eta[0].estimatedArrivalTime
                      : props.eta[0].eta
                  ) /
                    1000 -
                    now) /
                    60
                ) ? (
                  Math.floor(
                    (Date.parse(
                      props.mode === "nlb"
                        ? props.eta[0].estimatedArrivalTime
                        : props.eta[0].eta
                    ) /
                      1000 -
                      now) /
                      60
                  )
                ) : (
                  <span className="display-75">未有服務</span>
                )}
                <span className="display-8">
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                   !props.reverse &&
                    props.eta[0].dir === "O" &&
                    "　回程車"}
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                    props.reverse &&
                    props.eta[0].dir === "I" &&
                    "　回程車"}
                </span>
              </div>
            )}
          </Grid>
        </Grid>
        {props.eta.length > 1 && (
          <Grid container spacing={0}>
            <Grid item xs={8}>
              {Math.floor(
                (Date.parse(
                  props.mode === "nlb"
                    ? props.eta[1].estimatedArrivalTime
                    : props.eta[1].eta
                ) /
                  1000 -
                  now) /
                  60
              ) <= 0 ? (
                <span className="badge-success-animate center display-7">
                  <span className={`display-75 text-left`}>往 </span>
                  {termName}
                  <>
                    {props.site !== "fav" &&
                      props.mode === "ctb" &&
                     !props.reverse &&
                      props.eta[1].dir === "O" && (
                        <>
                          <span className="display-9 badge-danger">回程車</span>
                        </>
                      )}
                    {props.site !== "fav" &&
                      props.mode === "ctb" &&
                      props.reverse &&
                      props.eta[1].dir === "I" && (
                        <>
                          <span className="display-9 badge-danger">回程車</span>
                        </>
                      )}
                  </>
                </span>
              ) : (
                <div
                  className={`${
                    Math.floor(
                      (Date.parse(
                        props.mode === "nlb"
                          ? props.eta[1].estimatedArrivalTime
                          : props.eta[1].eta
                      ) /
                        1000 -
                        now) /
                        60
                    ) <= 5
                      ? "badge-warning-animate"
                      : "badge-primary-super"
                  } center display-75`}
                >
                  <span className={`display-75 text-left`}>往 </span>
                  {termName}
                  <>
                    {props.site !== "fav" &&
                      props.mode === "ctb" &&
                     !props.reverse &&
                      props.eta[1].dir === "O" && (
                        <>
                          <span className="display-9 badge-danger">回程車</span>
                        </>
                      )}
                    {props.site !== "fav" &&
                      props.mode === "ctb" &&
                      props.reverse &&
                      props.eta[1].dir === "I" && (
                        <>
                          <span className="display-9 badge-danger">回程車</span>
                        </>
                      )}
                  </>
                </div>
              )}
            </Grid>
            <Grid item xs={4}>
              <div
                className={`${
                  Math.floor(
                    (Date.parse(
                      props.mode === "nlb"
                        ? props.eta[1].estimatedArrivalTime
                        : props.eta[1].eta
                    ) /
                      1000 -
                      now) /
                      60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary-super"
                } center display-75`}
              >
                {Math.floor(
                  (Date.parse(
                    props.mode === "nlb"
                      ? props.eta[1].estimatedArrivalTime
                      : props.eta[1].eta
                  ) /
                    1000 -
                    now) /
                    60
                )}
                <span className="display-8">
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                   !props.reverse &&
                    props.eta[1].dir === "O" &&
                    "　回程車"}
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                    props.reverse &&
                    props.eta[1].dir === "I" &&
                    "　回程車"}
                </span>
              </div>
            </Grid>
          </Grid>
        )}

        {props.eta.length > 2 && (
          <Grid container spacing={0}>
            <Grid item xs={8}>
              {Math.floor(
                (Date.parse(
                  props.mode === "nlb"
                    ? props.eta[2].estimatedArrivalTime
                    : props.eta[2].eta
                ) /
                  1000 -
                  now) /
                  60
              ) <= 0 ? (
                <span className="badge-success-animate center display-7">
                  <span className={`display-75 text-left`}>往 </span>
                  {termName}
                  <>
                    {props.site !== "fav" &&
                      props.mode === "ctb" &&
                     !props.reverse &&
                      props.eta[2].dir === "O" && (
                        <>
                          <span className="display-9 badge-danger">回程車</span>
                        </>
                      )}
                    {props.site !== "fav" &&
                      props.mode === "ctb" &&
                      props.reverse &&
                      props.eta[2].dir === "I" && (
                        <>
                          <span className="display-9 badge-danger">回程車</span>
                        </>
                      )}
                  </>
                </span>
              ) : (
                <div
                  className={`${
                    Math.floor(
                      (Date.parse(
                        props.mode === "nlb"
                          ? props.eta[2].estimatedArrivalTime
                          : props.eta[2].eta
                      ) /
                        1000 -
                        now) /
                        60
                    ) <= 5
                      ? "badge-warning-animate"
                      : "badge-primary-super"
                  } center display-75`}
                >
                  <span className={`display-75 text-left`}>往 </span>
                  {termName}
                  <>
                    {props.site !== "fav" &&
                      props.mode === "ctb" &&
                     !props.reverse &&
                      props.eta[2].dir === "O" && (
                        <>
                          <span className="display-9 badge-danger">回程車</span>
                        </>
                      )}
                    {props.site !== "fav" &&
                      props.mode === "ctb" &&
                      props.reverse &&
                      props.eta[2].dir === "I" && (
                        <>
                          <span className="display-9 badge-danger">回程車</span>
                        </>
                      )}
                  </>
                </div>
              )}
            </Grid>
            <Grid item xs={4}>
              <div
                className={`${
                  Math.floor(
                    (Date.parse(
                      props.mode === "nlb"
                        ? props.eta[2].estimatedArrivalTime
                        : props.eta[2].eta
                    ) /
                      1000 -
                      now) /
                      60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary-super"
                } center display-75`}
              >
                {Math.floor(
                  (Date.parse(
                    props.mode === "nlb"
                      ? props.eta[2].estimatedArrivalTime
                      : props.eta[2].eta
                  ) /
                    1000 -
                    now) /
                    60
                )}
                <span className="display-8">
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                   !props.reverse &&
                    props.eta[2].dir === "O" &&
                    "　回程車"}
                  {props.site !== "fav" &&
                    props.mode === "ctb" &&
                    props.reverse &&
                    props.eta[2].dir === "I" &&
                    "　回程車"}
                </span>
              </div>
            </Grid>
          </Grid>
        )}
      </>
    ) : (
      <span className="badge-danger">未有服務</span>
    );

  const map = (
    <Card disabled classNames="p-1">
      <iframe
        width="100%"
        height="150px"
        frameborder="0"
        marginHeight="0"
        marginWidth="0"
        src={`//maps.google.com/maps?q=${props.lat},${props.long}&z=15&output=embed`}
        style={{ borderRadius: "10px", width: "100%", overflow: "hidden" }}
      ></iframe>
    </Card>
  );

  //Get other routes info
  const [otherRoutesNo, setOtherRoutesNo] = useState([]);
  const [otherRoutesNoCTB, setOtherRoutesNoCTB] = useState([]);
  const [otherRoutesNoNLB, setOtherRoutesNoNLB] = useState([]);
  useEffect(() => {
    const getEta = async () => {
      try {
        if (props.company === "kmb") {
          setIsLoading(true);
          const res = await axios.get(
            `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${props.stop.stop}`
          );
          setOtherRoutesNo(
            res.data.data.filter((x) => x.route !== props.route)
          );
          setIsLoading(false);
        }
        if (props.company === "ctb") {
          setIsLoading(true);
          let arr = [];
          const res = await axios.get(
            `https://rt.data.gov.hk/v1.1/transport/batch/stop-route/CTB/${props.stop.stop}`
          );
          for (const item of res.data.data) {
            const getRes = await axios.get(
              `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/${props.stop.stop}/${item.route}`
            );

            props.route !== item.route && arr.push(getRes.data.data[0]);
          }
          setOtherRoutesNoCTB(arr);
          setIsLoading(false);
        }
        if (props.company === "nlb") {
          setIsLoading(true);
          const res = await axios.get(
            `https://rt.data.gov.hk/v1.1/transport/batch/stop-route/NLB/${props.stop.stopId}`
          );
          let arr = [];
          for (const item of res.data.data) {
            const getRes = await axios.get(
              `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&routeId=${item.routeId}&stopId=${props.stop.stopId}&language=zh`
            );
            props.route !== item.route && arr.push(getRes.data.data[0]);
          }
          setOtherRoutesNoNLB(arr);
          setIsLoading(false);
        }
      } catch (error) {}
    };
    props.show && getEta();
    const interval = setInterval(() => {
      props.show && getEta();
      setNow(Math.floor(Date.now() / 1000));
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, [props.show]);

  const otherRoutes = (
    <Card disable classNames="p-2">
      <Grid container spacing={0}>
        {/* KMB */}
        {props.company === "kmb" && (
          <>
            <Grid item xs={12}>
              <span className="display-75 text-primary center">
                其他九巴路線
              </span>
            </Grid>
            {isLoading && (
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
            )}

            {otherRoutesNo.map((x) => (
              <>
                <Grid item xs={3}>
                  <span className="badge-kmb mb-1 center display-8">
                    {x.route}
                  </span>
                </Grid>
                <Grid item xs={5}>
                  <span className="badge-primary-super center display-8">
                    {x.dest_tc.split(" ")[0]}
                  </span>
                </Grid>
                <Grid item xs={4}>
                  {x.eta ? (
                    <>
                      {Math.floor((Date.parse(x.eta) / 1000 - now) / 60) <=
                        0 && (
                        <span
                          className={`badge-success-animate center display-8`}
                        >
                          到達
                        </span>
                      )}
                      {Math.floor((Date.parse(x.eta) / 1000 - now) / 60) >
                        0 && (
                        <div
                          className={`${
                            Math.floor((Date.parse(x.eta) / 1000 - now) / 60) <=
                            5
                              ? "badge-warning-animate"
                              : "badge-primary"
                          } center display-8`}
                        >
                          <span>
                            {Math.floor((Date.parse(x.eta) / 1000 - now) / 60)}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="badge-danger center display-8">
                      未有服務
                    </span>
                  )}
                </Grid>
              </>
            ))}
          </>
        )}
        {/* CTB */}
        {props.company === "ctb" && (
          <>
            <Grid item xs={12}>
              <span className="display-75 text-primary center">
                其他城巴路線
              </span>
            </Grid>
            {isLoading && (
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
            )}
            {otherRoutesNoCTB.map((x) => (
              <>
                {x && (
                  <>
                    <Grid item xs={3}>
                      <span className="badge-ctb mb-1 center display-8">
                        {x?.route}
                      </span>
                    </Grid>
                    <Grid item xs={5}>
                      <span className="badge-primary-super center display-8">
                        {x?.dest_tc.split(" ")[0]}
                      </span>
                    </Grid>
                    <Grid item xs={4}>
                      {x?.eta ? (
                        <>
                          {Math.floor((Date.parse(x?.eta) / 1000 - now) / 60) <=
                            0 && (
                            <span
                              className={`badge-success-animate center display-8`}
                            >
                              到達
                            </span>
                          )}
                          {Math.floor((Date.parse(x?.eta) / 1000 - now) / 60) >
                            0 && (
                            <div
                              className={`${
                                Math.floor(
                                  (Date.parse(x?.eta) / 1000 - now) / 60
                                ) <= 5
                                  ? "badge-warning-animate"
                                  : "badge-primary"
                              } center display-8`}
                            >
                              <span>
                                {Math.floor(
                                  (Date.parse(x?.eta) / 1000 - now) / 60
                                )}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="badge-danger center display-8">
                          未有服務
                        </span>
                      )}
                    </Grid>
                  </>
                )}
              </>
            ))}
          </>
        )}
        {/* NLB */}
        {/* {props.company === "nlb" && (
          <>
            <Grid item xs={12}>
              <span className="display-75 text-primary center">
                其他嶼巴路線
              </span>
            </Grid>
            {isLoading && (
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
            )}
            {otherRoutesNoNLB.map((x) => (
              <>
                {x && (
                  <>
                    <Grid item xs={3}>
                      <span className="badge-ctb mb-1 center display-8">
                        {x?.route}
                      </span>
                    </Grid>
                    <Grid item xs={5}>
                      <span className="badge-primary-super center display-8">
                        {x?.dest_tc.split(" ")[0]}
                      </span>
                    </Grid>
                    <Grid item xs={4}>
                      {x?.eta ? (
                        <>
                          {Math.floor((Date.parse(x?.eta) / 1000 - now) / 60) <=
                            0 && (
                            <span
                              className={`badge-success-animate center display-8`}
                            >
                              到達
                            </span>
                          )}
                          {Math.floor((Date.parse(x?.eta) / 1000 - now) / 60) >
                            0 && (
                            <div
                              className={`${
                                Math.floor(
                                  (Date.parse(x?.eta) / 1000 - now) / 60
                                ) <= 5
                                  ? "badge-warning-animate"
                                  : "badge-primary"
                              } center display-8`}
                            >
                              <span>
                                {Math.floor(
                                  (Date.parse(x?.eta) / 1000 - now) / 60
                                )}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="badge-danger center display-8">
                          未有服務
                        </span>
                      )}
                    </Grid>
                  </>
                )}
              </>
            ))}
          </>
        )} */}
      </Grid>
    </Card>
  );
  return (
    <Modal
      show={props.show}
      header={header}
      footer={footer}
      onCancel={props.onClose}
      size="sm"
    >
      {content_0}
      {map}
      {otherRoutes}
    </Modal>
  );
};

export default BackRoutesModal;
