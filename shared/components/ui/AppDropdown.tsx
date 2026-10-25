"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/shared/context/locale-context";
import cardStyles from "./Card.module.css";
import styles from "./AppDropdown.module.css";

export interface AppDropdownOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface AppDropdownProps {
  open: boolean;
  onClose: () => void;
  options: AppDropdownOption[];
  value: string;
  onSelect: (value: string) => void;
  allowCreate?: boolean;
  onCreateClick?: () => void;
  createLabel?: string;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  children?: React.ReactNode;
}

const AppDropdown: React.FC<AppDropdownProps> = ({
  open,
  onClose,
  options,
  value,
  onSelect,
  allowCreate = false,
  onCreateClick,
  createLabel,
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  children,
}) => {
  const { t } = useLocale();
  const portalRoot =
    typeof document !== "undefined"
      ? document.getElementById("modal-hook")
      : null;

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!portalRoot) return null;

  return (
    ReactDOM.createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="app-dropdown-title"
              className={`${cardStyles.card} ${styles.panel}`}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
            >
              <header className={styles.header}>
                <h2 id="app-dropdown-title">{title}</h2>
              </header>
              <form
                className={styles.form}
                onSubmit={(event) => {
                  event.preventDefault();
                  onConfirm();
                }}
              >
                <div className={styles.content}>
                  <div style={{ display: "grid", gap: 8 }}>
                    {options.map((option) => (
                      <label
                        key={option.value}
                        style={optionStyle(value === option.value)}
                      >
                        <input
                          type="radio"
                          name="app-dropdown-option"
                          value={option.value}
                          checked={value === option.value}
                          onChange={() => onSelect(option.value)}
                          style={{
                            accentColor: "var(--accent-blue)",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1, minWidth: 0, fontSize: 14 }}>
                          {option.label}
                          {option.icon && (
                            <span style={{ marginLeft: 6, fontSize: 11 }}>
                              {option.icon}
                            </span>
                          )}
                        </span>
                        {option.count !== undefined && (
                          <span
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: 12,
                            }}
                          >
                            {option.count}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  {allowCreate && onCreateClick && (
                    <button
                      type="button"
                      onClick={onCreateClick}
                      style={createButtonStyle}
                    >
                      ＋ {createLabel ?? t("fav.createNewList")}
                    </button>
                  )}
                  {children}
                </div>
                <footer className={styles.footer}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={secondaryButtonStyle}
                  >
                    {cancelLabel}
                  </button>
                  <button type="submit" style={primaryButtonStyle}>
                    {confirmLabel}
                  </button>
                </footer>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      portalRoot,
    )
  );
};

const optionStyle = (selected: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 12px",
  borderRadius: 14,
  border: "1px solid var(--glass-border)",
  background: selected ? "rgba(10,132,255,0.14)" : "rgba(255,255,255,0.04)",
  cursor: "pointer",
});

const secondaryButtonStyle: React.CSSProperties = {
  flex: 1,
  border: "1px solid var(--glass-border)",
  borderRadius: 12,
  padding: "10px 12px",
  background: "rgba(255,255,255,0.06)",
  color: "var(--text-primary)",
  font: "inherit",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  flex: 1,
  border: "1px solid var(--accent-blue)",
  borderRadius: 12,
  padding: "10px 12px",
  background: "var(--accent-blue)",
  color: "#fff",
  font: "inherit",
  fontWeight: 700,
  cursor: "pointer",
};

const createButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 12,
  border: "1px dashed var(--glass-border)",
  borderRadius: 14,
  padding: "11px 12px",
  background: "rgba(255,255,255,0.035)",
  color: "var(--accent-blue)",
  textAlign: "left",
  font: "inherit",
  fontWeight: 600,
  cursor: "pointer",
};

export default AppDropdown;
