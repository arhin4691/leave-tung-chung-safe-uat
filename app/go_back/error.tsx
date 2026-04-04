"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GoBackError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("go_back page error:", error);
  }, [error]);

  return (
    <div className="m-2 p-2">
      <div
        className="white-background-static p-2 center"
        style={{ borderRadius: "12px" }}
      >
        <div className="banner banner-little-danger center mb-3">
          ⚠️ 載入失敗
        </div>
        <p style={{ color: "#fff", textAlign: "center", marginBottom: "16px" }}>
          無法載入巴士路線資料，請檢查網絡連接後重試。
        </p>
        <button
          onClick={reset}
          style={{
            background: "#79aeca",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 24px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          重試
        </button>
      </div>
    </div>
  );
}
