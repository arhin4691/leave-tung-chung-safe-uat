import React, { useReducer, useEffect } from "react";
import classes from "./Input.module.css";
import { validate } from "../../util/validators";
import { motion } from "framer-motion";

const inputReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case "TOUCH":
      return { ...state, isTouched: true };
    default:
      return state;
  }
};

function Input(props) {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || "",
    isTouched: false,
    isValid: props.initialValid || false,
  });

  const { id, onInput } = props;
  const { value, isValid } = inputState;

  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const changeHandler = (e) => {
    dispatch({
      type: "CHANGE",
      val: e.target.value,
      validators: props.validators,
    });
  };

  const touchHandler = () => {
    dispatch({
      type: "TOUCH",
    });
  };
  props.onGetValue(value);

  const element =
    props.element === "input" ? (
      <motion.input
        variants={{
          normal: !props.disabled && {
            scale: 0.98,
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            outline: "none",
          },
          focus: !props.disabled && {
            scale: 1.01,
            backgroundColor: "#ebebeb",
            borderBottom: "2px solid #79aeca",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            outline: "none",
          },
          hover: !props.disabled && {
            scale: 1.01,
            backgroundColor: "#ebebeb",
            outline: "none",
          },
        }}
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
        min={props.min ? props.min : null}
        max={props.max ? props.max : null}
        maxLength={props.maxlength ? props.maxlength : null}
        autoComplete={props.autocomplete || "on"}
        style={props.style}
      />
    ) : (
      <motion.textarea
        variants={{
          normal: !props.disabled && {
            scale: 0.98,
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            outline: "none",
          },
          focus: !props.disabled && {
            scale: 1.01,
            backgroundColor: "#ebebeb",
            borderBottom: "2px solid #79aeca",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            outline: "none",
          },
          hover: !props.disabled && {
            scale: 1.01,
            backgroundColor: "#ebebeb",
            outline: "none",
          },
        }}
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
        min={props.min}
        max={props.max}
        maxLength={props.maxlength ? props.maxlength : null}
        style={props.style}
      />
    );
  return (
    <motion.div
      className={`${classes[`form-control`]} ${
        props.errorText &&
        !inputState.isValid &&
        inputState.isTouched &&
        classes["form-control--invalid"]
      }
      }`}
    >
      <label htmlFor={props.id}>{props.label} </label>
      {element}
      {props.errorText && !inputState.isValid && inputState.isTouched && (
        <span>{props.errorText}</span>
      )}
    </motion.div>
  );
}

export default Input;
