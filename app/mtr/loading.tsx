export default function MtrLoading() {
  return (
    <div>
      <div
        className="white-background center"
        style={{ padding: "12px", marginBottom: "8px", animation: "pulse 1.5s ease-in-out infinite" }}
      >
        <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(121,174,202,0.3)" }} />
      </div>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="white-background m-1 p-2"
          style={{ animation: `pulse 1.5s ease-in-out ${i * 0.08}s infinite` }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ width: "80px", height: "32px", borderRadius: "6px", background: "rgba(121,174,202,0.25)" }} />
            <div style={{ flex: 1, height: "24px", borderRadius: "4px", background: "rgba(121,174,202,0.15)" }} />
            <div style={{ width: "60px", height: "32px", borderRadius: "6px", background: "rgba(121,174,202,0.2)" }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
