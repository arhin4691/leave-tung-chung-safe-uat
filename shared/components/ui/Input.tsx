"use client";

import React, { useReducer, useEffect } from "react";
import classes from "./Input.module.css";
import { validate } from "../../util/validators";
import type { Validator } from "../../util/validators";
import { motion } from "framer-motion";

interface InputState {
  value: string;
  isTouched: boolean;
  isValid: boolean;
}

type InputAction =
  | { type: "CHANGE"; val: string; validators: Validator[] }
  | { type: "TOUCH" };

const inputReducer = (state: InputState, action: InputAction): InputState => {
  switch (action.type) {
    case "CHANGE":
      return { ...state, value: action.val, isValid: validate(action.val, action.validators) };
    case "TOUCH":
      return { ...state, isTouched: true };
    default:
      return state;
  }
};

interface InputProps {
  id: string;
  type?: string;
  element?: "input" | "textarea";
  placeholder?: string;
  label?: string;
  validators?: Validator[];
  errorText?: string;
  onInput?: (id: string, val: string, isValid: boolean) => void;
  onGetValue: (val: string) => void;
  initialValue?: string;
  initialValid?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  maxlength?: number;
  rows?: number;
  autocomplete?: string;
  style?: React.CSSProperties;
  sticky?: boolean;
}

function Input(props: InputProps) {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || "",
    isTouched: false,
    isValid: props.initialValid || false,
  });

  const { id, onInput } = props;
  const { value, isValid } = inputState;

  useEffect(() => {
    if (onInput) onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch({ type: "CHANGE", val: e.target.value, validators: props.validators ?? [] });
  };

  const touchHandler = () => {
    dispatch({ type: "TOUCH" });
  };

  props.onGetValue(value);

  const motionVariants = {
    normal: !props.disabled
      ? { scale: 0.98, borderTop: "none", borderLeft: "none", borderRight: "none", outline: "none" }
      : undefined,
    focus: !props.disabled
      ? { scale: 1.01, backgroundColor: "#ebebeb", borderBottom: "2px solid #79aeca", borderTop: "none", borderLeft: "none", borderRight: "none", outline: "none" }
      : undefined,
    hover: !props.disabled ? { scale: 1.01, backgroundColor: "#ebebeb", outline: "none" } : undefined,
  };

  const element =
    props.element === "input" ? (
      <motion.input
        variants={motionVariants}
        initial="normal"
        animate={{ scale: 1 }}
        whileHover="hover"
        whileFocus="focus"
        transition={{ type: "spring", stiffness: 500 }}
        id={props.id}
        type={props.type}
        placeholder={props.placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
        disabled={props.disabled}
        min={props.min}
        max={props.max}
        maxLength={props.maxlength}
        autoComplete={props.autocomplete || "on"}
        style={props.style}
      />
    ) : (
      <motion.textarea
        variants={motionVariants}
        initial="normal"
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
        whileHover="hover"
        whileFocus="focus"
        id={props.id}
        rows={props.rows || 3}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
        disabled={props.disabled}
        style={props.style}
      />
    );

  return (
    <motion.div
      className={`${classes["form-control"]} ${
        props.errorText && !inputState.isValid && inputState.isTouched
          ? classes["form-control--invalid"]
          : ""
      }`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      {element}
      {props.errorText && !inputState.isValid && inputState.isTouched && (
        <span>{props.errorText}</span>
      )}
    </motion.div>
  );
}

export default Input;
