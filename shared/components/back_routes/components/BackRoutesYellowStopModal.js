import React, { useContext, useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { Grid } from "@mui/material";
import { UpdateContext } from "@/shared/context/update-context";
import Card from "../../ui/Card";

const BackRoutesYellowStopModal = (props) => {
  const updateCtx = useContext(UpdateContext);
  const obj = {
    ...{
      route: props.route,
      routeId: props.routeId,
      routeCode: props.routeCode,
      company: "yb",
      termName: props.termName,
      stop: props.stopId,
      curr: props.stop,
      routeSeq: props.routeSeq,
      stopSeq: props.stopSeq,
      data: props.stopSeq,
    },
  };
  const [likeItem, setLikeItem] = useState(
    window.localStorage.getItem("likedBack") || ""
  );
  const [like, setLike] = useState(
    JSON.parse("[" + likeItem.replace(/,\s*$/, "") + "]").filter(
      (x) =>
        parseInt(x.stop) === parseInt(props.stopId) &&
        parseInt(x.routeId) === parseInt(props.routeId)
    ).length > 0
  );
  const likeHandler = () => {
    setLike(true);
    likeItem === ""
      ? setLikeItem((prev) => prev + JSON.stringify(obj))
      : setLikeItem((prev) => prev + "," + JSON.stringify(obj));
  };
  const unlikeHandler = () => {
    setLike(false);
    setLikeItem(
      JSON.stringify(
        JSON.parse("[" + likeItem.replace(/,\s*$/, "") + "]").filter(
          (x) => x.routeId !== props.routeId || x.stop !== props.stopId
        )
      ).slice(1, -1)
    );
  };

  useEffect(() => {
    localStorage.setItem("likedBack", likeItem);
    localStorage.setItem("likedBus", likeItem);
    updateCtx.update();
  }, [like]);

  //Refresh
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    setLike(
      JSON.parse("[" + likeItem.replace(/,\s*$/, "") + "]").filter(
        (x) =>
          parseInt(x.stop) === parseInt(props.stopId) &&
          parseInt(x.routeId) === parseInt(props.routeId)
      ).length > 0
    );
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [props.show]);

  const header = (
    <>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <span className={`badge-reverse`}>{props.route}</span>
          {like ? (
            <span className="align-right me-2" onClick={unlikeHandler}>
              ❤️
            </span>
          ) : (
            <span className="align-right me-2" onClick={likeHandler}>
              🤍
            </span>
          )}
        </Grid>
        <Grid item xs={2}>
          <span className="ms-2">➤</span>
        </Grid>
        <Grid item xs={10}>
          <span className="ms-2">{props.stop}</span>
        </Grid>
      </Grid>
    </>
  );
  const footer = (
    <Button outline onClick={props.onClose}>
      關閉
    </Button>
  );
  const content =
    props.eta?.eta.length > 0 ? (
      <>
        <Grid container spacing={0}>
          <Grid item xs={8}>
            {Math.floor(
              (Date.parse(props.eta?.eta[0].timestamp) / 1000 - now) / 60
            ) <= 0 ? (
              <span className={`badge-success-animate center display-7`}>
                <span className={`display-75 text-left`}>往 </span>
                {props.termName}
              </span>
            ) : (
              <div
                className={`${
                  Math.floor(
                    (Date.parse(props.eta?.eta[0].timestamp) / 1000 - now) / 60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary-super"
                } center display-7`}
              >
                <span className={`display-75 text-left`}>往 </span>
                {props.termName}
              </div>
            )}
          </Grid>
          <Grid item xs={4}>
            {Math.floor(
              (Date.parse(props.eta?.eta[0].timestamp) / 1000 - now) / 60
            ) <= 0 ? (
              <span className="badge-success-animate center display-7">
                到達
              </span>
            ) : (
              <div
                className={`${
                  Math.floor(
                    (Date.parse(props.eta?.eta[0].timestamp) / 1000 - now) / 60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary-super"
                } center display-7`}
              >
                {Math.floor(
                  (Date.parse(props.eta?.eta[0].timestamp) / 1000 - now) / 60
                ) ? (
                  Math.floor(
                    (Date.parse(props.eta?.eta[0].timestamp) / 1000 - now) / 60
                  )
                ) : (
                  <span className="display-75">未有服務</span>
                )}
              </div>
            )}
          </Grid>
        </Grid>
        {props.eta?.eta.length > 1 && (
          <Grid container spacing={0}>
            <Grid item xs={8}>
              {Math.floor(
                (Date.parse(props.eta?.eta[1].timestamp) / 1000 - now) / 60
              ) <= 0 ? (
                <span className="badge-success-animate center display-7">
                  <span className={`display-75 text-left`}>往 </span>
                  {props.termName}
                </span>
              ) : (
                <div
                  className={`${
                    Math.floor(
                      (Date.parse(props.eta?.eta[1].timestamp) / 1000 - now) /
                        60
                    ) <= 5
                      ? "badge-warning-animate"
                      : "badge-primary-super"
                  } center display-75`}
                >
                  <span className={`display-75 text-left`}>往 </span>
                  {props.termName}
                </div>
              )}
            </Grid>
            <Grid item xs={4}>
              <div
                className={`${
                  Math.floor(
                    (Date.parse(props.eta?.eta[1].timestamp) / 1000 - now) / 60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary-super"
                } center display-75`}
              >
                {Math.floor(
                  (Date.parse(props.eta?.eta[1].timestamp) / 1000 - now) / 60
                )}
              </div>
            </Grid>
          </Grid>
        )}

        {props.eta?.eta.length > 2 && (
          <Grid container spacing={0}>
            <Grid item xs={8}>
              {Math.floor(
                (Date.parse(props.eta?.eta[2].timestamp) / 1000 - now) / 60
              ) <= 0 ? (
                <span className="badge-success-animate center display-7">
                  <span className={`display-75 text-left`}>往 </span>
                  {props.termName}
                </span>
              ) : (
                <div
                  className={`${
                    Math.floor(
                      (Date.parse(props.eta?.eta[2].timestamp) / 1000 - now) /
                        60
                    ) <= 5
                      ? "badge-warning-animate"
                      : "badge-primary-super"
                  } center display-75`}
                >
                  <span className={`display-75 text-left`}>往 </span>
                  {props.termName}
                </div>
              )}
            </Grid>
            <Grid item xs={4}>
              <div
                className={`${
                  Math.floor(
                    (Date.parse(props.eta?.eta[2].timestamp) / 1000 - now) / 60
                  ) <= 5
                    ? "badge-warning-animate"
                    : "badge-primary-super"
                } center display-75`}
              >
                {Math.floor(
                  (Date.parse(props.eta?.eta[2].timestamp) / 1000 - now) / 60
                )}
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

  
  const [otherRoutesNo, setOtherRoutesNo] = useState([]);

  useEffect(() => {

  },[props.show])
  return (
    <Modal
      show={props.show}
      onCancel={props.onClose}
      size="sm"
      header={header}
      footer={footer}
    >
      {content}
      {map}
    </Modal>
  );
};

export default BackRoutesYellowStopModal;
