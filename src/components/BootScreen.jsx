import React, { useEffect, useState } from "react";
import "./CRTLayout.css";

const BootScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState("boot");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const sequence = [
      { next: "boot", delay: 2000 },
      { next: "online", delay: 2000 },
    ];
    let i = 0;
    const step = () => {
      const { next, delay } = sequence[i];
      setPhase(next);
      i++;
      if (i < sequence.length) {
        setTimeout(step, delay);
      } else {
        setTimeout(() => setFadeOut(true), 1800); // start fade
        setTimeout(() => onComplete?.(), 3000);   // handoff to Mission Control
      }
    };
    step();
  }, [onComplete]);

  return (
    <div className={`crt-container ${fadeOut ? "fade-out" : ""}`}>
      {/* ⭐️ STARFIELD (behind overlay/content) */}
      <div className="starfield">
        <div className="stars" />
        <div className="stars2" />
        <div className="stars3" />
      </div>

      {/* Scanlines */}
      <div className="crt-overlay" />

      {/* Text */}
      <div className="crt-content">
        {phase === "boot" && (
          <>
            <div className="boot-title">SPACEPORT TELEMETRY SYSTEM</div>
            <div className="boot-sub boot-white">INITIALIZING…</div>
            <div className="boot-divider" />
            <div className="boot-sub boot-white">MISSION BOOT-UP</div>
          </>
        )}

        {phase === "online" && (
          <div className="headline headline-online">SYSTEM ONLINE</div>
        )}
      </div>
    </div>
  );
};

export default BootScreen;
