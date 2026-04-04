"use client";

import React, { useEffect } from "react";
import classes from "./Modal.module.css";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Backdrop from "./Backdrop";

interface ModalProps {
  show?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  onCancel?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  headerClass?: string;
  contentClass?: string;
  footerClass?: string;
  stickyHead?: boolean;
  stickyFoot?: boolean;
}

const ModalOverlay: React.FC<ModalProps> = (props) => {
  useEffect(() => {
    if (!props.show) return;

    const html = document.documentElement;
    const body = document.body;

    // Save current scroll position
    const scrollY = window.scrollY;

    // Prevent scrolling + preserve scrollbar space (best UX)
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed"; // prevents scroll
    body.style.top = `-${scrollY}px`; // keeps scroll position
    body.style.width = "100%"; // prevents layout shift

    // Optional: force scrollbar gutter to stay (modern browsers)
    html.style.scrollbarGutter = "stable";

    return () => {
      // Restore everything cleanly
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      html.style.scrollbarGutter = "";

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [props.show]);

  const el =
    typeof document !== "undefined"
      ? document.getElementById("modal-hook")
      : null;
  if (!el) return null;

  /* Outer wrapper: position:fixed fullscreen, flex-centred.
   * This replaces the old "left:50%; transform:translateX(-50%)" pattern
   * which framer-motion overwrote with its own scale/y transforms, causing
   * the modal to appear off-screen / at the bottom. */
  const content = (
    <div className={classes["modalOuter"]} onClick={props.onCancel}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className={`${classes["modal"]} ${classes[`modal-${props.size ?? "md"}`]} ${props.className ?? ""} ${classes["hide-scroll"]}`}
        style={props.style}
        onClick={(e) => e.stopPropagation()}
        layout
      >
        <header
          className={`${classes["modal__header"]} ${props.headerClass ?? ""} ${
            props.stickyHead ? classes["modal__header__sticky"] : ""
          }`}
        >
          <h2>{props.header}</h2>
        </header>
        <form onSubmit={props.onSubmit ?? ((e) => e.preventDefault())}>
          <div
            className={`${classes["modal__content"]} ${props.contentClass ?? ""}`}
          >
            {props.children}
          </div>
          <footer
            className={`${classes["modal__footer"]} ${props.footerClass ?? ""} ${
              props.stickyFoot ? classes["modal__footer__sticky"] : ""
            }`}
          >
            {props.footer}
          </footer>
        </form>
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(content, el);
};

export default function Modal(props: ModalProps) {
  return (
    <>
      <Backdrop show={props.show} onClick={props.onCancel} />
      <AnimatePresence>
        {props.show && <ModalOverlay key="modal-overlay" {...props} />}
      </AnimatePresence>
    </>
  );
}
