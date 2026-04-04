export default function FavouriteLoading() {
  return (
    <div className="m-1">
      <div className="white-background p-2" style={{ marginBottom: "8px" }}>
        <div style={{ height: "32px", width: "120px", borderRadius: "8px", background: "rgba(255,193,7,0.3)", margin: "0 auto", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="white-background m-1 p-2"
          style={{ animation: `pulse 1.5s ease-in-out ${i * 0.12}s infinite` }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ width: "60px", height: "40px", borderRadius: "8px", background: "rgba(121,174,202,0.25)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: "20px", borderRadius: "4px", background: "rgba(121,174,202,0.2)", marginBottom: "6px" }} />
              <div style={{ height: "16px", width: "60%", borderRadius: "4px", background: "rgba(121,174,202,0.15)" }} />
            </div>
            <div style={{ width: "50px", height: "40px", borderRadius: "8px", background: "rgba(40,167,69,0.2)" }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
