import React from "react";
import { motion } from "framer-motion";
import classes from "./Card.module.css";

const Card = (props) => {
  return (
    <motion.div
      variants={{
        static: !props.disabled && {
          scale: 1,
          opacity: 1,
        },
        focus: !props.disabled && {
          scale: 1.01,
          backgroundColor: "#ebebeb",
          borderBottom: "2px solid #79aeca",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
        },
        hover: !props.disabled && {
          scale: !props.static ? 1.01 : 1,
          backgroundColor: "#ffffff",
        },
        active: !props.disabled && {
          scale: 0.99,
          backgroundColor: "#ffffff",
        },
      }}
      layout
      initial={{ scale: 0.99 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500 }}
      whileHover={"hover"}
      whileFocus={!props.static && "focus"}
      whileTap={!props.static && "active"}
      className={`${classes['card']} ${props.classNames} ${props.without && classes["not_card"]} `}
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
