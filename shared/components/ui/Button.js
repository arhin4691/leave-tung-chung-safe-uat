import React from "react";
import { motion } from "framer-motion";

import classes from "./Button.module.css";
import Link from "next/link";

const Button = (props) => {
  if (props.href) {
    return (
      <motion.a
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={
          !props.disabled && { scale: 1.05, filter: "brightness(110%)" }
        }
        whileTap={!props.disabled && { scale: 0.98, filter: "brightness(90%)" }}
        transition={{
          type: "spring",
          stiffness: 500,
          duration: 0.5,
        }}
        className={`${classes.btn} ${classes[`btn-${props.size || "default"}`]}
        ${props.light && classes["btn-light"]} 
        ${props.outline && classes["btn-outline"]} 
        ${props.outlineDanger && classes["btn-danger-outline"]} 
        ${props.outlineSecondary && classes["btn-secondary-outline"]} 
        ${props.outlineWarning && classes["btn-warning-outline"]} 
        ${props.outlineSuccess && classes["btn-success-outline"]} 
        ${props.outlineCircle && classes["btn-circle-outline"]} 
        ${props.outlineLight && classes["btn-light-outline"]} 
        ${props.outlineNothing && classes["btn-nothing-outline"]} 
        ${props.nothing && classes["btn-nothing"]}
        ${props.nothingCircle && classes["btn-nothing-circle"]}
        ${props.danger && classes["btn-danger"]}
        ${props.success && classes["btn-success"]}
        ${props.wide && classes["btn-wide"]}
        ${props.overflow && classes["btn-overflow"]}`}
        href={props.href}
        onClick={props.onClick}
        target={props.target}
      >
        {props.children}
      </motion.a>
    );
  }
  if (props.to) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={
          !props.disabled && { scale: 1.05, filter: "brightness(110%)" }
        }
        whileTap={!props.disabled && { scale: 0.98, filter: "brightness(90%)" }}
        transition={{
          type: "spring",
          stiffness: 500,
          duration: 0.5,
        }}
      >
        <Link
          to={props.to}
          exact={props.exact}
          className={`${classes.btn} ${classes[`btn-${props.size || "default"}`]}
          ${props.light && classes["btn-light"]} 
          ${props.outline && classes["btn-outline"]} 
          ${props.outlineDanger && classes["btn-danger-outline"]} 
          ${props.outlineSecondary && classes["btn-secondary-outline"]} 
          ${props.outlineWarning && classes["btn-warning-outline"]} 
          ${props.outlineSuccess && classes["btn-success-outline"]} 
          ${props.outlineCircle && classes["btn-circle-outline"]} 
          ${props.outlineLight && classes["btn-light-outline"]} 
          ${props.outlineNothing && classes["btn-nothing-outline"]} 
          ${props.nothing && classes["btn-nothing"]}
          ${props.nothingCircle && classes["btn-nothing-circle"]}
          ${props.danger && classes["btn-danger"]}
          ${props.success && classes["btn-success"]}
          ${props.wide && classes["btn-wide"]}
          ${props.overflow && classes["btn-overflow"]}`}
          onClick={props.onClick}
        >
          {props.children}
        </Link>
      </motion.div>
    );
  }
  return (
    <motion.button
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={
        !props.disabled && { scale: 1.05, filter: "brightness(110%)" }
      }
      whileTap={!props.disabled && { scale: 0.98, filter: "brightness(90%)" }}
      transition={{
        type: "spring",
        stiffness: 500,
        duration: 0.5,
      }}
        className={`${classes.btn} ${classes[`btn-${props.size || "default"}`]}
        ${props.light && classes["btn-light"]} 
        ${props.outline && classes["btn-outline"]} 
        ${props.outlineDanger && classes["btn-danger-outline"]} 
        ${props.outlineSecondary && classes["btn-secondary-outline"]} 
        ${props.outlineWarning && classes["btn-warning-outline"]} 
        ${props.outlineSuccess && classes["btn-success-outline"]} 
        ${props.outlineCircle && classes["btn-circle-outline"]} 
        ${props.outlineLight && classes["btn-light-outline"]} 
        ${props.outlineNothing && classes["btn-nothing-outline"]} 
        ${props.nothing && classes["btn-nothing"]}
        ${props.nothingCircle && classes["btn-nothing-circle"]}
        ${props.danger && classes["btn-danger"]}
        ${props.success && classes["btn-success"]}
        ${props.wide && classes["btn-wide"]}
        ${props.overflow && classes["btn-overflow"]}`}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </motion.button>
  );
};

export default Button;
