"use client";
/**
 * RouteKeyboard — predictive custom keyboard rendered as a fixed bottom sheet.
 *
 * Trigger / native-keyboard prevention
 * ──────────────────────────────────────
 * • The parent search `<input>` should use `inputMode="none"` and `readOnly`
 *   on mobile so the OS virtual keyboard NEVER opens.  The parent calls
 *   `onOpen()` from the input's `onClick` / `onFocus` handler.
 * • On desktop the keyboard sheet is not shown; physical typing works
 *   through the parent's normal controlled input.
 *
 * Layout: numpad-inspired grid
 * ─────────────────────────────
 *   ┌─────────────────────────────────────────┐
 *   │  ░ drag-handle ░                        │
 *   │  [suggestion chips …]                   │
 *   ├─────────────────────────────────────────┤
 *   │  [1][2][3][4][5][6][7][8][9][0]  digits │
 *   ├─────────────────────────────────────────┤
 *   │  [A][B][C][D][E][F][G]          letters │
 *   │  [H][I][J][K][L][M][N]                  │
 *   │  [O][P][Q][R][S][T][U]                  │
 *   │  [V][W][X][Y][Z]                        │
 *   ├─────────────────────────────────────────┤
 *   │  [← 刪除]           [清除全部]          │
 *   └─────────────────────────────────────────┘
 *
 * Accessibility
 * ──────────────
 * • role="dialog" + aria-label on the panel
 * • role="listbox" + role="option" on suggestion chips
 * • aria-label on every key (e.g. "數字 3", "字母 E")
 * • aria-live="polite" on the value display
 */

import React, { useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { buildTrie } from "@/shared/util/route-trie";

// ── Keyboard layout constants ─────────────────────────────────────────────────
// Digits shown in "numpad" order: 1–9 then 0
const NUMPAD_DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;
const LETTER_ROWS = [
  "ABCDEFG".split(""),
  "HIJKLMN".split(""),
  "OPQRSTU".split(""),
  "VWXYZ".split(""),
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────
export interface RouteKeyboardProps {
  /** Whether the bottom sheet is open. Controlled by parent. */
  isOpen: boolean;
  /** Called when the user taps the backdrop or the close handle. */
  onClose: () => void;
  /** Current search value — controlled from the parent. */
  value: string;
  /** Called on every keystroke / backspace / clear. */
  onChange: (val: string) => void;
  /**
   * Called when the user taps a suggestion chip (the full route string).
   * The parent can use this to scroll to the matching route card.
   */
  onSelect?: (route: string) => void;
  /**
   * Deduplicated route numbers for the currently-selected company filter.
   * The trie is rebuilt with `useMemo` only when this array reference changes.
   */
  routes: string[];
  /** Maximum number of suggestion chips shown. Default: 12. */
  maxSuggestions?: number;
}

// ── Sub-component: individual key button ─────────────────────────────────────
interface KeyBtnProps {
  label: string;
  valid: boolean;
  onPress: (ch: string) => void;
  ariaLabel: string;
}

const KeyBtn = React.memo<KeyBtnProps>(({ label, valid, onPress, ariaLabel }) => (
  <motion.button
    type="button"
    disabled={!valid}
    aria-disabled={!valid}
    className={`route-kb-key${valid ? " route-kb-key-valid" : " route-kb-key-dim"}`}
    onClick={() => valid && onPress(label)}
    whileTap={valid ? { scale: 0.72 } : {}}
    transition={{ type: "spring", stiffness: 700, damping: 28 }}
    aria-label={ariaLabel}
  >
    {label}
  </motion.button>
));
KeyBtn.displayName = "KeyBtn";

// ── Main component ────────────────────────────────────────────────────────────
const RouteKeyboard: React.FC<RouteKeyboardProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
  onSelect,
  routes,
  maxSuggestions = 12,
}) => {
  const trie = useMemo(() => buildTrie(routes), [routes]);

  const validNext  = useMemo(() => trie.nextChars(value),              [trie, value]);
  const suggestions = useMemo(() => trie.matches(value, maxSuggestions), [trie, value, maxSuggestions]);
  const isExact    = useMemo(() => trie.isExact(value),                 [trie, value]);
  const noMatch    = value.length > 0 && suggestions.length === 0;

  const handleKey = useCallback(
    (ch: string) => {
      const next = (value + ch).toUpperCase();
      onChange(next);
      if (trie.isExact(next) && trie.nextChars(next).size === 0) {
        onSelect?.(next);
      }
    },
    [value, onChange, onSelect, trie],
  );

  const handleBackspace = useCallback(() => onChange(value.slice(0, -1)), [value, onChange]);
  const handleClear     = useCallback(() => onChange(""),                  [onChange]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────── */}
          <motion.div
            className="route-kb-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Bottom sheet panel ───────────────────────────────── */}
          <motion.div
            className="route-kb-sheet"
            role="dialog"
            aria-label="路線號碼輸入鍵盤"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
          >
            {/* Drag handle */}
            <div className="route-kb-handle" aria-hidden="true" />

            {/* ── Value display ────────────────────────────────── */}
            <div className="route-kb-display" aria-live="polite" aria-atomic="true">
              <div className="route-kb-display-inner">
                {value ? (
                  <span className="route-kb-display-value">{value.toUpperCase()}</span>
                ) : (
                  <span className="route-kb-display-placeholder">輸入路線號碼…</span>
                )}
                <AnimatePresence>
                  {isExact && (
                    <motion.span
                      key="exact"
                      className="route-kb-exact-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </AnimatePresence>
                {noMatch && (
                  <span className="route-kb-no-match" aria-live="assertive">找不到路線</span>
                )}
              </div>
              <button
                type="button"
                className="route-kb-display-backspace"
                onClick={handleBackspace}
                disabled={!value}
                aria-label="刪除上一個字元"
              >
                ⌫
              </button>
            </div>

            {/* ── Suggestion chips ─────────────────────────────── */}
            <AnimatePresence initial={false} mode="wait">
              {value.length > 0 && suggestions.length > 0 && (
                <motion.div
                  key="suggestions"
                  className="route-kb-suggestions"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.14 }}
                  role="listbox"
                  aria-label="符合的路線"
                >
                  {suggestions.map((r) => {
                    const sel = r.toUpperCase() === value.toUpperCase();
                    return (
                      <button
                        key={r}
                        type="button"
                        role="option"
                        aria-selected={sel}
                        className={`route-kb-chip${sel ? " route-kb-chip-exact" : ""}`}
                        onClick={() => { onChange(r.toUpperCase()); onSelect?.(r); }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Key panel ────────────────────────────────────── */}
            <div className="route-kb-panel" role="grid" aria-label="字元鍵盤">
              {/* Numbers row — numpad order 1-9 then 0 */}
              <div className="route-kb-row route-kb-row-digits" role="row">
                {NUMPAD_DIGITS.map((d) => (
                  <KeyBtn key={d} label={d} valid={validNext.has(d)} onPress={handleKey} ariaLabel={`數字 ${d}`} />
                ))}
              </div>

              {/* Divider */}
              <div className="route-kb-divider" aria-hidden="true" />

              {/* Letter rows */}
              {LETTER_ROWS.map((row, ri) => (
                <div key={ri} className="route-kb-row route-kb-row-letters" role="row">
                  {row.map((l) => (
                    <KeyBtn key={l} label={l} valid={validNext.has(l)} onPress={handleKey} ariaLabel={`字母 ${l}`} />
                  ))}
                </div>
              ))}

              {/* Action row */}
              <div className="route-kb-row route-kb-row-actions" role="row">
                <button
                  type="button"
                  className="route-kb-action route-kb-action-backspace"
                  onClick={handleBackspace}
                  disabled={!value}
                  aria-label="刪除上一個字元"
                >
                  ⌫ 刪除
                </button>
                <button
                  type="button"
                  className="route-kb-action route-kb-action-clear"
                  onClick={handleClear}
                  disabled={!value}
                  aria-label="清除全部輸入"
                >
                  清除全部
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RouteKeyboard;
