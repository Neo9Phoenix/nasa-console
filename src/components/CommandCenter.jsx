import React, { useMemo, useState } from "react";
import ConsoleFrame from "./ConsoleFrame";
import "./CRTLayout.css";

/**
 * COMMAND CENTER (v1)
 * - Runs a simple health check against backend endpoints
 * - Shows ONLINE/OFFLINE per endpoint
 *
 * Uses backend base URL (local default):
 *   http://127.0.0.1:5000
 *
 * Optional env override:
 *   VITE_API_BASE=http://127.0.0.1:5000
 */
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

const endpoints = [
  { key: "core", label: "CORE", path: "/" },
  { key: "epic", label: "EPIC", path: "/epic" },
  { key: "apod", label: "APOD", path: "/apod" },
  { key: "sunmoon", label: "SUNMOON", path: "/sunmoon?lat=28.5729&lon=-80.6490" },
];

export default function CommandCenter({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState({
    core: "IDLE",
    epic: "IDLE",
    apod: "IDLE",
    sunmoon: "IDLE",
  });

  const hud = useMemo(() => {
    const anyOffline = Object.values(status).some((s) => s === "OFFLINE");
    const anyOnline = Object.values(status).some((s) => s === "ONLINE");
    const state = err
      ? "DEGRADED"
      : loading
      ? "ACQUIRING"
      : anyOffline
      ? "DEGRADED"
      : anyOnline
      ? "NOMINAL"
      : "IDLE";

    return { system: "COMMAND", channel: "CONTROL", status: state };
  }, [status, loading, err]);

  const ping = async (path) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6500);

    try {
      const res = await fetch(`${API_BASE}${path}`, { signal: ctrl.signal });
      if (!res.ok) return false;

      // attempt to parse json to ensure body is valid
      try {
        await res.json();
      } catch {
        // some endpoints might not be json; ok to accept if status is ok
      }

      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(t);
    }
  };

  const runCheck = async () => {
    setErr("");
    setLoading(true);

    // optimistic: set all to CHECKING
    const next = {};
    endpoints.forEach((e) => (next[e.key] = "CHECKING"));
    setStatus((s) => ({ ...s, ...next }));

    try {
      const results = await Promise.all(
        endpoints.map(async (e) => {
          const ok = await ping(e.path);
          return [e.key, ok ? "ONLINE" : "OFFLINE"];
        })
      );

      const updated = {};
      results.forEach(([k, v]) => (updated[k] = v));
      setStatus((s) => ({ ...s, ...updated }));

      const anyOffline = Object.values(updated).some((v) => v === "OFFLINE");
      if (anyOffline) setErr("Failed to fetch (one or more endpoints offline)");
    } finally {
      setLoading(false);
    }
  };

  const statusLine =
    err
      ? `SYSTEM ERROR — ${err}`
      : loading
      ? "SYSTEM CHECK: RUNNING…"
      : "SYSTEM CHECK: READY";

  return (
    <ConsoleFrame
      title="COMMAND CENTER"
      subtitle="SYSTEM STATUS · HEALTH MONITOR"
      right={
        <button type="button" className="crt-button" onClick={onBack}>
          ⟵ RETURN TO MENU
        </button>
      }
    >
      <div className="earth-main-panel" style={{ paddingTop: 8 }}>
        <div className="space-feed-status">{statusLine}</div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <button
            type="button"
            className="crt-button"
            onClick={runCheck}
            disabled={loading}
            style={{ minWidth: 200 }}
          >
            {loading ? "CHECKING…" : "RUN SYSTEM CHECK"}
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            border: "2px solid rgba(248,179,25,0.35)",
            borderRadius: 14,
            padding: 14,
            background: "rgba(0,0,0,0.35)",
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div className="boot-white" style={{ marginBottom: 10 }}>
            BACKEND STATUS
          </div>

          <div className="space-feed-hud">
            {endpoints.map((e) => (
              <div key={e.key}>
                {e.label}: {status[e.key]}
              </div>
            ))}
          </div>

          <div className="space-feed-hud" style={{ marginTop: 10, opacity: 0.85 }}>
            API_BASE: {API_BASE}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            border: "2px solid rgba(248,179,25,0.35)",
            borderRadius: 14,
            padding: 14,
            background: "rgba(0,0,0,0.35)",
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div className="boot-white" style={{ marginBottom: 10 }}>
            FRONTEND MODULES
          </div>
          <div className="space-feed-hud">
            <div>EARTH CORE: ONLINE</div>
            <div>ISS PASS: ONLINE</div>
            <div>SUN / MOON: ONLINE</div>
            <div>ORBIT TRACKER: ONLINE</div>
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