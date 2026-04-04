"use client";

import React from "react";
import { motion } from "framer-motion";
import classes from "./Card.module.css";

interface CardProps {
  children?: React.ReactNode;
  classNames?: string;
  disabled?: boolean;
  static?: boolean;
  without?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Card: React.FC<CardProps> = (props) => {
  return (
    <motion.div
      variants={{
        hover: !props.disabled
          ? {
              scale: !props.static ? 1.012 : 1,
              background: "var(--glass-bg-hover)",
              borderColor: "var(--glass-border-hover)",
              boxShadow: "var(--glass-shadow-lg)",
            }
          : undefined,
        active: !props.disabled
          ? { scale: 0.988, background: "var(--glass-bg-active)" }
          : undefined,
      }}
      layout
      initial={{ scale: 0.97, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      whileHover="hover"
      whileTap={!props.static ? "active" : undefined}
      className={`${classes["card"]} ${props.classNames ?? ""} ${props.without ? classes["not_card"] : ""}`}
      onClick={props.onClick}
      onDoubleClick={props.onDoubleClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      {props.children}
    </motion.div>
  );
};

export default Card;
