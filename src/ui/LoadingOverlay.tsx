export function LoadingOverlay() {
  return (
    <div className="overlay overlay-loading overlay--fullscreen screen-enter">
      <div className="loading-scene" aria-hidden="true">
        <div className="loading-coin" />
        <div className="loading-coin loading-coin--2" />
        <div className="loading-coin loading-coin--3" />
      </div>
      <p className="loading-title">EASHAN&apos;S QUEST</p>
      <p className="loading-sub blink">Loading the kingdom...</p>
      <div className="loading-bar">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}
