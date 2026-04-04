export default function GoBackLoading() {
  return (
    <div className="mt-2 m-1">
      <div style={{ padding: "12px" }}>
        <div style={{ height: "44px", borderRadius: "8px", background: "rgba(255,255,255,0.4)", marginBottom: "12px", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div
          style={{
            borderRadius: "12px",
            background: "rgba(255,255,255,0.25)",
            padding: "16px",
            textAlign: "center",
            color: "rgba(255,255,255,0.7)",
            animation: "pulse 1.5s ease-in-out 0.3s infinite",
          }}
        >
          <div style={{ height: "20px", width: "80%", margin: "0 auto 8px", borderRadius: "4px", background: "rgba(255,255,255,0.3)" }} />
          <div style={{ height: "20px", width: "60%", margin: "0 auto 8px", borderRadius: "4px", background: "rgba(255,255,255,0.3)" }} />
          <div style={{ height: "20px", width: "50%", margin: "0 auto", borderRadius: "4px", background: "rgba(255,255,255,0.3)" }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
