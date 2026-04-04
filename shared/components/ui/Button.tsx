"use client";

import React from "react";
import { motion } from "framer-motion";
import classes from "./Button.module.css";
import Link from "next/link";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  href?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  size?: string;
  light?: boolean;
  outline?: boolean;
  outlineDanger?: boolean;
  outlineSecondary?: boolean;
  outlineWarning?: boolean;
  outlineSuccess?: boolean;
  outlineCircle?: boolean;
  outlineLight?: boolean;
  outlineNothing?: boolean;
  nothing?: boolean;
  nothingCircle?: boolean;
  danger?: boolean;
  success?: boolean;
  wide?: boolean;
  overflow?: boolean;
  to?: string;
}

const Button: React.FC<ButtonProps> = (props) => {
  const commonClasses = [
    classes[`btn-${props.size || "default"}`],
    props.light && classes["btn-light"],
    props.outline && classes["btn-outline"],
    props.outlineDanger && classes["btn-danger-outline"],
    props.outlineSecondary && classes["btn-secondary-outline"],
    props.outlineWarning && classes["btn-warning-outline"],
    props.outlineSuccess && classes["btn-success-outline"],
    props.outlineCircle && classes["btn-circle-outline"],
    props.outlineLight && classes["btn-light-outline"],
    props.outlineNothing && classes["btn-nothing-outline"],
    props.nothing && classes["btn-nothing"],
    props.nothingCircle && classes["btn-nothing-circle"],
    props.danger && classes["btn-danger"],
    props.success && classes["btn-success"],
    props.wide && classes["btn-wide"],
    props.overflow && classes["btn-overflow"],
  ]
    .filter(Boolean)
    .join(" ");

  const commonStyle: React.CSSProperties = {
    fontFamily: "Inter,    -apple-system,    BlinkMacSystemFont,  sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: "0.015em",
    padding: "7px 18px",
    margin: "4px",
    border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.13))",
    borderRadius: "var(--radius-sm, 10px)",
    background: "rgba(10, 132, 255, 0.2)",
    color: "#60b8ff",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    backdropFilter: "blur(16px) saturate(160%)",
    WebkitBackdropFilter: "blur(16px) saturate(160%)",
    transition: "all 0.2s",
    WebkitUserSelect: "none",
    userSelect: "none",
  };

  const motionProps = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    whileHover: !props.disabled
      ? { scale: 1.05, filter: "brightness(110%)" }
      : undefined,
    whileTap: !props.disabled
      ? { scale: 0.98, filter: "brightness(90%)" }
      : undefined,
    transition: { type: "spring", stiffness: 500, duration: 0.5 },
  };

  if (props.href) {
    return (
      <motion.a
        {...motionProps}
        className={commonClasses}
        href={props.href}
        onClick={props.onClick as any}
        target={props.target}
        style={commonStyle}
      >
        {props.children}
      </motion.a>
    );
  }

  if (props.to) {
    return (
      <motion.div {...motionProps} style={commonStyle}>
        <Link
          href={props.to}
          className={commonClasses}
          onClick={props.onClick as any}
        >
          {props.children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      className={commonClasses}
      type={props.type ?? "button"}
      onClick={props.onClick as any}
      disabled={props.disabled}
      style={commonStyle}
    >
      {props.children}
    </motion.button>
  );
};

export default Button;
