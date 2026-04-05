"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLocale } from "@/shared/context/locale-context";

interface AboutModalProps {
  version: string;
  releaseDate: string;
}

const AboutModal: React.FC<AboutModalProps> = ({ version, releaseDate }) => {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {/* Header row — matches settingsPopover row style */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "10px 14px",
          borderRadius: "12px",
          cursor: "pointer",
          border: "none",
          outline: "none",
          background: "rgba(255,255,255,0.07)",
          color: "rgba(255,255,255,0.86)",
          fontSize: "13px",
          fontWeight: 500,
          fontFamily: "inherit",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span>{t("settings.about")}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{ color: "rgba(255,255,255,0.52)", fontSize: "14px", lineHeight: 1 }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            style={{ overflow: "hidden" }}
          >
            {/* FavStopCard-style glass card */}
            <div
              style={{
                marginTop: "6px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                padding: "14px",
              }}
            >
              {/* Logo */}
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <Image src="/files/images/logo.png" alt="Logo" width={80} height={53} />
              </div>

              {/* Dev note */}
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.6,
                  marginBottom: "12px",
                }}
              >
                {t("about.devNotePrefix")}
                <a
                  href={`mailto:leave.tung.chung.safe@gmail.com?subject=我想向東涌出行提供意見&body=版本號碼: ${version}%20%3A%0D%0A意見內容: `}
                  style={{ color: "#34C759", marginInline: "3px", textDecoration: "none" }}
                >
                  {t("about.feedbackHere")}
                </a>
                {t("about.devNoteSuffix")}
              </div>

              {/* Version + release date badges */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "rgba(10,132,255,0.15)",
                    border: "1px solid rgba(10,132,255,0.35)",
                    color: "#0A84FF",
                    borderRadius: "9999px",
                    padding: "2px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {t("about.version")}: {version}
                </span>
                <span
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.55)",
                    borderRadius: "9999px",
                    padding: "2px 10px",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  {releaseDate}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AboutModal;
