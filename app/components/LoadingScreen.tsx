export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">CYBERSENSE</div>
      <div className="loading-spinner-wrap">
        <div className="loading-ring" />
        <div className="loading-ring" />
        <div className="loading-ring" />
      </div>
      <div className="loading-status">
        LOADING
        <span className="loading-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  );
}
