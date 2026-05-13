const LoadingRadar: React.FC<{ size?: number }> = ({ size = 28 }) => {
  return (
    <div
      className="relative flex items-center justify-center rounded-full overflow-hidden shrink-0"
      style={{ width: size, height: size, background: "#001A99", border: "0.5px solid rgba(255,255,255,0.3)" }}
    >
      <div className="absolute inset-[15%] rounded-full" style={{ border: "0.5px solid rgba(255,255,255,0.45)" }} />
      <div
        className="absolute rounded-full"
        style={{ width: "34%", height: "34%", border: "0.5px solid rgba(255,255,255,0.45)" }}
      />
      <span className="absolute top-1/2 left-1/2 w-1/2 h-full bg-transparent origin-top-left animate-radar" style={{ borderTop: "0.5px solid rgba(255,255,255,0.3)" }}>
        <span className="absolute top-0 left-0 w-full h-full origin-top-left -rotate-[55deg] blur-[5px]"
          style={{ background: "rgba(0,200,80,0.85)" }} />
      </span>
    </div>
  );
};

export default LoadingRadar;
