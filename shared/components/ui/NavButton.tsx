"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import classes from "./NavButton.module.css";
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

// ── Nav items — 4 items: Home · Bus · MTR · Settings ────────────
const NAV_ITEMS = [
  { href: "/", Icon: HomeIcon, labelKey: "nav.home" as const },
  { href: "/go_back", Icon: BusIcon, labelKey: "nav.bus" as const },
  { href: "/mtr", Icon: MTRIcon, labelKey: "nav.mtr" as const },
  { href: "/settings", Icon: GearIcon, labelKey: "settings.title" as const },
];

// ── Component ────────────────────────────────────────────────────
const NavButton: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLocale();
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop breakpoint after hydration
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
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
                    className={`${classes.item} ${item.href === "/settings" ? classes.settingsNavItem : ""} ${active ? classes.itemActive : ""}`}
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
        </Grid>
      </motion.nav>
    </>
  );
};

export default NavButton;
