import React, { useEffect } from "react";
import classes from "./Modal.module.css";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import dynamic from "next/dynamic";
// import Backdrop from "./Backdrop";
const Backdrop = dynamic(() => import("./Backdrop"), { ssr: false }); //New non SSR import
import { AnimatePresence, motion } from "framer-motion";

const ModalOverlay = (props) => {
  const init = () => {
    if (props.show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };
  useEffect(() => {
    init();
  }, [props.show]);
  const content = (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1.0, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring" }}
      className={`${classes["modal"]} ${props.className} ${
        classes[`modal-${props.size}`]
      } ${classes["hide-scroll"]}`}
      style={props.style}
      layout
    >
      <header
        className={`${classes["modal__header"]} ${props.headerClass} ${
          props.stickyHead && classes["modal__header__sticky"]
        }`}
      >
        <h2>{props.header}</h2>
      </header>
      <form
        onSubmit={
          props.onSubmit ? props.onSubmit : (event) => event.preventDefault()
        }
      >
        <div className={`${classes["modal__content"]} ${props.contentClass}`}>
          {props.children}
        </div>
        <footer
          className={`${classes["modal__footer"]} ${props.footerClass} ${
            props.stickyFoot && classes["modal__footer__sticky"]
          }`}
        >
          {props.footer}
        </footer>
      </form>
    </motion.div>
  );
  return ReactDOM.createPortal(content, document.getElementById("modal-hook"));
};

export default function Modal(props) {
  // if (props.show) {
  //   document.body.style.overflow = "hidden";
  // } else {
  //   document.body.style.overflow = "unset";
  // }
  return (
    <>
      <Backdrop show={props.show} onClick={props.onCancel} />

      {/* {props.show && <Backdrop onClick={props.onCancel} />} */}

      <AnimatePresence>
        <CSSTransition
          in={props.show}
          mountOnEnter
          unmountOnExit
          timeout={0}
          classNames={classes["modal"]}
        >
          <ModalOverlay {...props} />
        </CSSTransition>
      </AnimatePresence>
    </>
  );
}
