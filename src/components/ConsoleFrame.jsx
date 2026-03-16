import React from "react";
import "./ConsoleFrame.css";
import MissionClock from "./MissionClock";

export default function ConsoleFrame({
  title = "EARTH TELEMETRY CORE",
  subtitle = "LIVE FEED",
  right = null,
  children
}) {
  return (
    <div className="frame">

      {/* ===== HEADER ===== */}
      <div className="frame-top">

        {/* Left: Page Title */}
        <div className="frame-title">
          {title}
        </div>

        {/* Mission Clock */}
        <div className="frame-clock">
          <MissionClock />
        </div>

        {/* Subtitle */}
        <div className="frame-sub">
          {subtitle}
        </div>

        {/* Right-side controls */}
        <div className="frame-right">
          {right}
        </div>

      </div>

      {/* ===== BODY ===== */}
      <div className="frame-body">

        {/* Retro console visual wrapper */}
        <div className="retroify">
          {children}
        </div>

      </div>

      {/* ===== FOOTER ===== */}
      <div className="frame-bottom">
        <span>STATUS: ONLINE</span>
        <span>CHANNEL: EPIC/APOD</span>
        <span>FPS: 1</span>
      </div>

    </div>
  );
}