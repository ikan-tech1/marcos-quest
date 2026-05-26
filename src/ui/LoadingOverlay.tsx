export function LoadingOverlay() {
  return (
    <div className="overlay overlay-loading">
      <div className="loader-ring" />
      <p className="subtitle">Loading world...</p>
    </div>
  );
}
