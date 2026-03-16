import React, { useEffect, useMemo, useRef, useState } from "react";
import * as sat from "satellite.js";
import ConsoleFrame from "./ConsoleFrame";
import "./CRTLayout.css";

/**
 * ORBIT TRACKER (v2)
 * - Uses satellite.js in browser (no backend needed)
 * - User can edit TLE
 * - Live mode updates solution every 1s
 */

export default function OrbitTracker({ onBack }) {
  // Default ISS-ish TLE (user can replace anytime)
  const [tle1, setTle1] = useState(
    "1 25544U 98067A   26061.51944444  .00016717  00000-0  10270-3 0  9991"
  );
  const [tle2, setTle2] = useState(
    "2 25544  51.6416  68.3506 0005476  83.4092  57.7418 15.49515327436864"
  );

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const [live, setLive] = useState(false);

  const timerRef = useRef(null);

  const hud = useMemo(
    () => ({
      system: "ORBIT",
      channel: "TRACK",
      status: err
        ? "DEGRADED"
        : loading
        ? "ACQUIRING"
        : live
        ? "TRACKING"
        : result
        ? "NOMINAL"
        : "IDLE",
    }),
    [err, loading, result, live]
  );

  const computeOnce = () => {
    setErr("");

    try {
      const l1 = tle1.trim();
      const l2 = tle2.trim();
      if (!l1 || !l2) throw new Error("Missing TLE lines");

      const satrec = sat.twoline2satrec(l1, l2);

      const now = new Date();
      const pv = sat.propagate(satrec, now);
      if (!pv.position) throw new Error("TLE propagation failed (bad/old TLE?)");

      const gmst = sat.gstime(now);
      const geo = sat.eciToGeodetic(pv.position, gmst);

      const lat = sat.degreesLat(geo.latitude);
      const lon = sat.degreesLong(geo.longitude);
      const altKm = geo.height;

      const v = pv.velocity;
      const speed =
        v && typeof v.x === "number"
          ? Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
          : null;

      setResult({
        time: now.toISOString(),
        lat: lat.toFixed(4),
        lon: lon.toFixed(4),
        alt: altKm.toFixed(1),
        speed: speed ? speed.toFixed(3) : "—",
      });
    } catch (e) {
      setErr(e?.message || "Compute failed");
      setResult(null);
    }
  };

  const compute = async () => {
    setLoading(true);
    setResult(null);
    try {
      computeOnce();
    } finally {
      setLoading(false);
    }
  };

  // Live mode interval
  useEffect(() => {
    if (!live) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    // compute immediately then every second
    computeOnce();
    timerRef.current = setInterval(computeOnce, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, tle1, tle2]);

  return (
    <ConsoleFrame
      title="ORBIT TRACKER"
      subtitle="TLE · POSITION · ALTITUDE · SPEED"
      right={
        <button type="button" className="crt-button" onClick={onBack}>
          ⟵ RETURN TO MENU
        </button>
      }
    >
      <div className="earth-main-panel" style={{ paddingTop: 8 }}>
        <div className="space-feed-status">
          {err
            ? `SPACE FEED: ERROR — ${err}`
            : loading
            ? "SPACE FEED: SOLVING ORBIT…"
            : live
            ? "SPACE FEED: LIVE TRACKING LOCKED"
            : result
            ? "SPACE FEED: ORBIT SOLUTION LOCKED"
            : "SPACE FEED: IDLE — LOAD TLE + COMPUTE"}
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <div>
            <div className="boot-white" style={{ marginBottom: 6 }}>
              TLE LINE 1
            </div>
            <input
              value={tle1}
              onChange={(e) => setTle1(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(248,179,25,0.45)",
                background: "rgba(0,0,0,0.45)",
                color: "rgba(255,255,255,0.92)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <div className="boot-white" style={{ marginBottom: 6 }}>
              TLE LINE 2
            </div>
            <input
              value={tle2}
              onChange={(e) => setTle2(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(248,179,25,0.45)",
                background: "rgba(0,0,0,0.45)",
                color: "rgba(255,255,255,0.92)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="crt-button"
              onClick={compute}
              disabled={loading || live}
              style={{ minWidth: 170 }}
              title={live ? "Turn off LIVE first" : ""}
            >
              {loading ? "COMPUTING…" : "COMPUTE ORBIT"}
            </button>

            <button
              type="button"
              className="crt-button"
              onClick={() => setLive((v) => !v)}
              style={{ minWidth: 170 }}
            >
              {live ? "STOP LIVE" : "START LIVE"}
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            border: "2px solid rgba(248,179,25,0.35)",
            borderRadius: 14,
            padding: 14,
            background: "rgba(0,0,0,0.35)",
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div className="boot-white" style={{ marginBottom: 10 }}>
            🛰️ CURRENT SOLUTION
          </div>

          <div className="space-feed-hud">
            <div>TIME: {result?.time || "—"}</div>
            <div>LAT: {result?.lat || "—"}</div>
            <div>LON: {result?.lon || "—"}</div>
            <div>ALTITUDE: {result?.alt ? `${result.alt} km` : "—"}</div>
            <div>SPEED: {result?.speed ? `${result.speed} km/s` : "—"}</div>
          </div>
        </div>

        <div className="space-feed-hud" style={{ marginTop: 18 }}>
          <div>SYSTEM: {hud.system}</div>
          <div>CHANNEL: {hud.channel}</div>
          <div>STATUS: {hud.status}</div>
        </div>
      </div>
    </ConsoleFrame>
  );
}