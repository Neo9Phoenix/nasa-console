import ConsoleFrame from "./ConsoleFrame";
import IssPassConsole from "./IssPassConsole";
import "./iss.css";

export default function IssPassAlerts({ onBack }) {
  return (
    <ConsoleFrame
      title="ISS PASS / ALERTS"
      subtitle="REAL-TIME OVERHEAD DETECTION"
      right={
        <button type="button" className="crt-button" onClick={onBack}>
          ⟵ RETURN TO MENU
        </button>
      }
    >
      <div className="iss-shell">
        {/* TOP: main console */}
        <div className="iss-console-block">
          <IssPassConsole />
        </div>

        {/* BOTTOM: orbit GIF + title */}
        <div className="iss-orbit-block">
          <div className="iss-orbit-frame">
            <img
              src="/satellite-orbit.gif"
              alt="Satellite orbit animation"
              className="iss-sat-image"
            />
          </div>
          <div className="iss-sat-caption">ORBITAL TRACK SIMULATION</div>
        </div>
      </div>
    </ConsoleFrame>
  );
}
