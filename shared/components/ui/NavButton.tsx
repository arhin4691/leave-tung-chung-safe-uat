"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import classes from "./NavButton.module.css";
import { useTheme } from "@/shared/context/theme-context";
import { useLocale } from "@/shared/context/locale-context";
import { Grid } from "@mui/material";

// ── SVG Icons ────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BusIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="13" rx="2" />
    <path d="M3 11h18" />
    <path d="M8 5v6M16 5v6" />
    <circle cx="7.5" cy="20" r="1.5" />
    <circle cx="16.5" cy="20" r="1.5" />
    <path d="M7.5 18v-2M16.5 18v-2" />
  </svg>
);

const MTRIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <polyline points="6 16 9 8 12 14 15 8 18 16" />
  </svg>
);

const GearIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SunIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ── Nav items — 4 items: Home · Bus · MTR · Settings ────────────
const NAV_ITEMS = [
  { href: "/", Icon: HomeIcon, labelKey: "nav.home" as const },
  { href: "/go_back", Icon: BusIcon, labelKey: "nav.bus" as const },
  { href: "/mtr", Icon: MTRIcon, labelKey: "nav.mtr" as const },
];

// ── Component ────────────────────────────────────────────────────
const NavButton: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { locale, t, toggleLocale } = useLocale();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Detect desktop breakpoint after hydration
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      const inBtn = settingsBtnRef.current?.contains(e.target as Node);
      const inPopover = popoverRef.current?.contains(e.target as Node);
      if (!inBtn && !inPopover) setSettingsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [settingsOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const isZh = locale === "zh-HK";

  return (
    <>
      {/* ── Settings popover ──────────────────────────────────────
          Hoisted OUTSIDE the dock to escape framer-motion's CSS
          stacking context (transform creates a new stacking ctx).
          position:fixed + z-index:150 ensures it renders above
          the nav dock (z-index:100) and below modals (z-index:500). */}
      <AnimatePresence>
        {settingsOpen && (
          <div
            ref={popoverRef}
            style={
              isDesktop
                /* Desktop: popover floats to the right of the 220px sidebar */
                ? { position: "fixed", bottom: 80, left: 232, zIndex: 150 }
                /* Mobile: popover floats above centre of bottom dock */
                : { position: "fixed", bottom: 90, left: "50%", zIndex: 150 }
            }
          >
            <motion.div
              className={classes.settingsPopover}
              initial={{ opacity: 0, scale: 0.86, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.86, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <button
                className={classes.popoverRow}
                onClick={() => {
                  toggleTheme();
                  setSettingsOpen(false);
                }}
              >
                <span>
                  {theme === "dark"
                    ? isZh
                      ? "淺色模式"
                      : "Light Mode"
                    : isZh
                      ? "深色模式"
                      : "Dark Mode"}
                </span>
                <span className={classes.popoverAccessory}>
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </span>
              </button>
              <button
                className={classes.popoverRow}
                onClick={() => {
                  toggleLocale();
                  setSettingsOpen(false);
                }}
              >
                <span>{isZh ? "Switch to English" : "切換中文"}</span>
                <span
                  className={classes.popoverAccessory}
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  {isZh ? "EN" : "中"}
                </span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Dock pill ─────────────────────────────────────────── */}
      <motion.nav
        className={classes["dock"]}
        style={{
          position: "fixed",
          bottom: isDesktop ? "0px" : "0px",
          zIndex: 50,
          padding: "8px 10px",
          backdropFilter: "blur(40px) saturate(160%)",
          WebkitBackdropFilter: "blur(40px) saturate(160%)",
          width: "100%",
        }}
        initial={isDesktop ? { x: -220, opacity: 1 } : { y: 90, opacity: 1, scale: 1 }}
        animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 26,
          delay: 0.1,
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* 4 route nav items */}
        <Grid container spacing={0} alignItems="center" justifyContent="center">
          {NAV_ITEMS.map((item, i) => {
            const active = isActive(item.href);
            return (
              <Grid
                item
                xs={3}
                key={item.href}
                // style={{ position: "relative" }}
              >
                <motion.div
                  key={item.href}
                  style={{ position: "relative" }}
                  whileTap={{ scale: 0.86 }}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 28,
                    delay: 0.06 * i,
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="navActivePill"
                      className={classes.activePill}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  <Link
                    href={item.href}
                    className={`${classes.item} ${active ? classes.itemActive : ""}`}
                    aria-current={active ? "page" : undefined}
                    aria-label={t(item.labelKey)}
                  >
                    <span className={classes.itemIcon}>
                      <item.Icon />
                    </span>
                    <span className={classes.itemLabel}>
                      {t(item.labelKey)}
                    </span>
                  </Link>
                </motion.div>
              </Grid>
            );
          })}
          {/* 5th item: Settings — styled like a nav item but is a button */}

          <Grid item xs={3} style={{ position: "relative" }}>
            <motion.div
              style={{
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
              whileTap={{ scale: 0.86 }}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 28,
                delay: 0.06 * 4,
              }}
            >
              {settingsOpen && (
                <motion.div
                  layoutId="navActivePill"
                  className={classes.activePill}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <button
                ref={settingsBtnRef}
                className={`${classes.item} ${classes.settingsNavItem} ${settingsOpen ? classes.itemActive : ""}`}
                onClick={() => setSettingsOpen((o) => !o)}
                aria-label={isZh ? "設定" : "Settings"}
                aria-expanded={settingsOpen}
              >
                <span className={classes.itemIcon}>
                  <GearIcon />
                </span>
                <span className={classes.itemLabel}>
                  {isZh ? "設定" : "Settings"}
                </span>
              </button>
            </motion.div>
          </Grid>
        </Grid>
      </motion.nav>
    </>
  );
};

export default NavButton;
