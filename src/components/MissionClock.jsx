import { useEffect, useState } from "react";

export default function MissionClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      // Convert to UTC format
      const utc = now
        .toISOString()
        .replace("T", " ")
        .split(".")[0];

      setTime(`${utc} UTC`);
    };

    updateClock();

    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mission-clock">
      <span className="telemetry-dot">●</span>
      <span className="mission-time">{time}</span>
    </div>
  );
}