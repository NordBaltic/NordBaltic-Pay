export default function Loading({ size = "medium", fullscreen = false }) {
  return (
    <div className={`loading-container ${fullscreen ? "fullscreen" : ""}`}>
      <div className={`loading-animation ${size}`}></div>
    </div>
  );
}
