import React, { useCallback, useState } from "react";
import BootScreen from "./components/BootScreen";
import CRTLayout from "./components/CRTLayout";
import MissionControl from "./components/MissionControl";
import EarthCore from "./components/EarthCore";
import IssPassAlerts from "./components/IssPassAlerts";
import SunMoonEvents from "./components/SunMoonEvents";
import OrbitTracker from "./components/OrbitTracker";
import CommandCenter from "./components/CommandCenter";

const ALLOWED_MODULES = new Set(["earth", "iss", "sun", "orbit", "command"]);

export default function App() {
  const [booted, setBooted] = useState(false);
  const [module, setModule] = useState(null); // null | "earth" | "iss" | "sun" | "orbit" | "command"

  const rebootSystem = useCallback(() => {
    setModule(null);
    setBooted(false);
  }, []);

  const openModule = useCallback((label, id) => {
    if (id === "exit") {
      rebootSystem();
      return;
    }

    if (ALLOWED_MODULES.has(id)) {
      setModule(id);
      return;
    }

    console.warn("Unknown module:", { label, id });
  }, [rebootSystem]);

  const backToMenu = useCallback(() => setModule(null), []);

  return (
    <>
      {!booted ? (
        <BootScreen onComplete={() => setBooted(true)} />
      ) : (
        <CRTLayout>
          {!module ? (
            <div className="fade-in">
              <MissionControl onOpen={openModule} onExit={rebootSystem} />
            </div>
          ) : module === "earth" ? (
            <div className="fade-in">
              <EarthCore onBack={backToMenu} />
            </div>
          ) : module === "iss" ? (
            <div className="fade-in">
              <IssPassAlerts onBack={backToMenu} />
            </div>
          ) : module === "sun" ? (
            <div className="fade-in">
              <SunMoonEvents onBack={backToMenu} />
            </div>
          ) : module === "orbit" ? (
            <div className="fade-in">
              <OrbitTracker onBack={backToMenu} />
            </div>
          ) : module === "command" ? (
            <div className="fade-in">
              <CommandCenter onBack={backToMenu} />
            </div>
          ) : null}
        </CRTLayout>
      )}
    </>
  );
}