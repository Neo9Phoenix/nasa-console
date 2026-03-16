import { useEffect, useState } from "react";
import "./iss.css";

/*
Backend base URL
Local: http://127.0.0.1:5000
Production: use VITE_API_BASE
*/
const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function IssPassConsole() {

  /* LOCATION */
  const [lat, setLat] = useState("28.5729");
  const [lon, setLon] = useState("-80.6490");

  /* PASS DATA */
  const [passes, setPasses] = useState([]);
  const [nextPass, setNextPass] = useState(null);

  /* STATUS */
  const [tMinus, setTMinus] = useState("--:--");
  const [status, setStatus] = useState("IDLE");

  /* UI STATE */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ALERT */
  const [alertArmed, setAlertArmed] = useState(true);

  /* META */
  const [lastUpdated, setLastUpdated] = useState(null);

  /* FETCH ISS PASS */

  const fetchPass = async (latOverride, lonOverride) => {

    setLoading(true);
    setError("");

    try {

      const latNum = Number(latOverride ?? lat);
      const lonNum = Number(lonOverride ?? lon);

      if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
        throw new Error("Invalid coordinates");
      }

      const url = `${API_BASE}/iss-pass?lat=${latNum}&lon=${lonNum}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, { signal: controller.signal });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Backend error (${res.status})`);
      }

      const data = await res.json();

      if (!data?.ok) {
        throw new Error(data?.error || "ISS lookup failed");
      }

      const pass = {
        rise_time_utc: data.risetime_utc,
        duration_sec: data.duration
      };

      setPasses([pass]);
      setLastUpdated(new Date().toISOString());

    } catch (err) {

      console.error("ISS fetch error:", err);

      setError(err.message || "Unable to retrieve ISS pass data");
      setPasses([]);
      setNextPass(null);
      setStatus("IDLE");
      setTMinus("--:--");

    } finally {

      setLoading(false);

    }
  };

  /* GEOLOCATION */

  const useMyLocation = () => {

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {

        const latStr = pos.coords.latitude.toFixed(4);
        const lonStr = pos.coords.longitude.toFixed(4);

        setLat(latStr);
        setLon(lonStr);

        fetchPass(latStr, lonStr);

      },
      () => setError("Unable to retrieve current location")
    );
  };

  /* COUNTDOWN LOGIC */

  useEffect(() => {

    if (!passes.length) {
      setNextPass(null);
      setStatus("IDLE");
      setTMinus("--:--");
      return;
    }

    const updateCountdown = () => {

      const now = new Date();

      const pass = passes[0];
      const riseDate = new Date(pass.rise_time_utc);
      const endDate = new Date(
        riseDate.getTime() + pass.duration_sec * 1000
      );

      setNextPass(pass);

      if (now < riseDate) {

        const diff = riseDate - now;

        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        const mm = String(mins).padStart(2, "0");
        const ss = String(secs).padStart(2, "0");

        setTMinus(`T-${mm}:${ss}`);

        setStatus(diff <= 10 * 60 * 1000 ? "INBOUND" : "SCHEDULED");

      } else if (now >= riseDate && now <= endDate) {

        setStatus("OVERHEAD");
        setTMinus("T+00:00");

      } else {

        setStatus("IDLE");
        setTMinus("--:--");

      }
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);

  }, [passes]);

  const alertActive =
    alertArmed && (status === "INBOUND" || status === "OVERHEAD");

  return (

    <div className="module iss-module">

      {/* HEADER */}

      <div className="iss-header">
        ISS PASS CONSOLE
      </div>

      {/* ORBIT VISUALIZATION */}

      <div className="iss-orbit-block">

        <div className="iss-orbit-frame">

          <img
            src="/satellite-orbit.gif"
            className="iss-sat-image"
            alt="ISS Orbit Visualization"
          />

        </div>

        <div className="iss-sat-caption">
          REAL-TIME ORBIT VISUALIZATION
        </div>

      </div>

      {/* INPUT PANEL */}

      <div className="iss-input-block">

        <div className="iss-field-group">
          <div className="iss-field-label">LATITUDE</div>
          <input
            className="iss-input"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
        </div>

        <div className="iss-field-group">
          <div className="iss-field-label">LONGITUDE</div>
          <input
            className="iss-input"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
          />
        </div>

        <div className="iss-row">

          <button
            className="iss-btn"
            onClick={() => fetchPass()}
            disabled={loading}
          >
            {loading ? "SCANNING…" : "GET PASSES"}
          </button>

          <button
            className="iss-btn ghost"
            onClick={useMyLocation}
            disabled={loading}
          >
            USE MY LOCATION
          </button>

        </div>

      </div>

      {error && <div className="iss-error">{error}</div>}

      {/* STATUS PANEL */}

      <div className="iss-status-panel">

        <div className="iss-row iss-status-row">
          <span className="label">STATUS</span>
          <span className={`value status-${status.toLowerCase()}`}>
            {status}
          </span>
        </div>

        <div className="iss-row iss-status-row">
          <span className="label">T-MINUS</span>
          <span className="value">{tMinus}</span>
        </div>

        <div className="iss-row iss-status-row">
          <span className="label">ALERT</span>

          <button
            className={`iss-btn alert-toggle ${alertArmed ? "armed" : "off"}`}
            onClick={() => setAlertArmed((v) => !v)}
          >
            {alertArmed ? "ALERT ARMED" : "ALERT OFF"}
          </button>
        </div>

      </div>

      {/* ALERT BANNER */}

      {alertActive && (
        <div className="iss-alert-banner">
          ISS PASS {status === "INBOUND" ? "INBOUND" : "OVERHEAD"} – LOOK UP
        </div>
      )}

      {/* NEXT PASS DATA */}

      {nextPass && (

        <div className="iss-next-block">

          <div className="iss-next-title">
            NEXT PASS (UTC)
          </div>

          <div className="iss-next-row">
            <span className="label">TIME</span>
            <span className="value">
              {new Date(nextPass.rise_time_utc)
                .toISOString()
                .replace(".000Z", "Z")}
            </span>
          </div>

          <div className="iss-next-row">
            <span className="label">DURATION</span>
            <span className="value">
              {nextPass.duration_sec} s
            </span>
          </div>

        </div>

      )}

      {/* META */}

      {lastUpdated && (
        <div className="iss-meta">
          Last scan: {lastUpdated.replace(".000Z", "Z")}
        </div>
      )}

    </div>
  );
}