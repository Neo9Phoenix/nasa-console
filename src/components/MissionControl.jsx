import React, { useEffect, useState } from "react";

const ITEMS = [
  { id: "earth", label: "EARTH TELEMETRY CORE" },
  { id: "iss", label: "ISS PASS / ALERTS" },
  { id: "sun", label: "SUN / MOON EVENTS" },
  { id: "orbit", label: "ORBIT TRACKER" },
  { id: "command", label: "COMMAND CENTER" },
  { id: "reboot", label: "REBOOT SYSTEM" },
];

export default function MissionControl({ onOpen, onExit }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKey = (e) => {
      const key = e.key;

      if (key === "Tab" || key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % ITEMS.length);
      } else if (key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + ITEMS.length) % ITEMS.length);
      } else if (key === "Enter") {
        const item = ITEMS[activeIndex];
        if (item.id === "reboot") {
          onExit?.();
        } else {
          onOpen?.(item.label, item.id);
        }
      } else if (key === "Escape") {
        onExit?.();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, onOpen, onExit]);

  const handleClick = (index, item) => {
    setActiveIndex(index);
    if (item.id === "reboot") {
      onExit?.();
    } else {
      onOpen?.(item.label, item.id);
    }
  };

  return (
    <div className="menu">
      <div className="menu-title">SPACEPORT TELEMETRY SYSTEM</div>
      <div className="menu-sub">MISSION CONTROL</div>

      <ul className="menu-list">
        {ITEMS.map((item, index) => (
          <li
            key={item.id}
            className={index === activeIndex ? "active" : ""}
            onClick={() => handleClick(index, item)}
          >
            <span className={`arrow ${index === activeIndex ? "blink" : ""}`}>
              ➜
            </span>
            <span className="label">{item.label}</span>
          </li>
        ))}
      </ul>

      <div className="menu-help">Press TAB to switch · ENTER open · ESC back</div>
    </div>
  );
}