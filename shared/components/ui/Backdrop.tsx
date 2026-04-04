"use client";

import React from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface BackdropProps {
  show?: boolean;
  onClick?: () => void;
}

const Backdrop: React.FC<BackdropProps> = (props) => {
  const el = typeof document !== "undefined" ? document.getElementById("backdrop-hook") : null;
  if (!el) return null;
  return ReactDOM.createPortal(
    <AnimatePresence>
      {props.show && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={props.onClick}
          style={{
            position: "fixed",
            inset: 0,
            /* Higher than navbar (100) but below modal (1100) */
            zIndex: 90,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        />
      )}
    </AnimatePresence>,
    el
  );
};

export default Backdrop;
