import React, { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { useEffect } from "react";
import { useContext } from "react";
import { UpdateContext } from "@/shared/context/update-context";
import { toast } from "react-toastify";

const BusModal = (props) => {
  const [likeItem, setLikeItem] = useState(
    window.localStorage.getItem("likedBus") || ""
  );

  const [like, setLike] = useState(
    JSON.parse("[" + likeItem.replace(/,\s*$/, "") + "]").filter(
      (x) => x.busRoute === props.data.busRoute
    ).length > 0
  );
  const updateCtx = useContext(UpdateContext);

  useEffect(() => {
    localStorage.setItem("likedBus", likeItem);
    updateCtx.update();
  }, [like]);

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
      ? setLikeItem((prev) => prev + JSON.stringify(props.data))
      : setLikeItem((prev) => prev + "," + JSON.stringify(props.data));
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
          (x) => x.busRoute !== props.data.busRoute
        )
      ).slice(1, -1)
    );
  };

  const header = (
    <>
      <span className="p-0 m-0">
        巴士路線 ➤ {props.data.busRoute}
        <span className="align-right">
          {like ? (
            <span className="me-2" onClick={unlikeHandler}>
              ❤️
            </span>
          ) : (
            <span className="me-2" onClick={likeHandler}>
              🤍
            </span>
          )}
        </span>
      </span>
    </>
  );
  const footer = (
    <>
      <Button outline onClick={props.onClose}>
        關閉
      </Button>
    </>
  );
  const content = (
    <div>
      {props.data.routeStop.map((x, index) => (
        <div
          className={`${
            index === 0 ? "badge-rainbow-outline" : "badge-primary-outline"
          }`}
        >
          {x}
        </div>
      ))}
    </div>
  );
  return (
    <>
      <Modal show header={header} footer={footer} onCancel={props.onClose}>
        {content}
      </Modal>
    </>
  );
};

export default BusModal;
