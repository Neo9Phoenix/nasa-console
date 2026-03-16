import React, { useEffect, useMemo, useState } from "react";
import ConsoleFrame from "./ConsoleFrame";
import "./CRTLayout.css";

/**
 * SUN / MOON EVENTS (v1)
 * Reliable + simple:
 * - Calls your backend proxy: GET /sunmoon?lat=...&lon=...
 * - Backend handles Sun (API) + Moon (local compute)
 *
 * Local backend:
 *   http://127.0.0.1:5000/sunmoon
 */

const API_BASE = import.meta.env.VITE_API_BASE;

export default function SunMoonEvents({ onBack }) {
  // Default: Cape Canaveral-ish / Orlando-ish
  const [lat, setLat] = useState("28.5729");
  const [lon, setLon] = useState("-80.6490");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [sun, setSun] = useState(null);
  const [moon, setMoon] = useState(null);

  const hud = useMemo(
    () => ({
      system: "SOL/LUNA",
      channel: "EVENTS",
      status: err ? "DEGRADED" : loading ? "ACQUIRING" : "NOMINAL",
    }),
    [err, loading]
  );

  const isValidNumber = (v) => v !== "" && !Number.isNaN(Number(v));

  const fetchAll = async () => {
    setErr("");
    setLoading(true);

    try {
      if (!isValidNumber(lat) || !isValidNumber(lon)) {
        throw new Error("Invalid coordinates");
      }

      const url = `${API_BASE}/sunmoon?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Backend error (${res.status})`);
      }

      setSun({
        date: data.date,
        sunrise: data.sun?.sunrise,
        sunset: data.sun?.sunset,
        solar_noon: data.sun?.solar_noon,
        day_length: data.sun?.day_length,
        civil_twilight_begin: data.sun?.civil_twilight_begin,
        civil_twilight_end: data.sun?.civil_twilight_end,
      });

      setMoon({
        phase: data.moon?.phase,
        illumination: data.moon?.illumination,
        age: data.moon?.age,
        distance: data.moon?.distance,
        date: data.moon?.date,
      });
    } catch (e) {
      setErr(e?.message || "Fetch failed");
      setSun(null);
      setMoon(null);
    } finally {
      setLoading(false);
    }
  };

  // auto fetch once on mount
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmtUtc = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mi = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mi} UTC`;
  };

  return (
    <ConsoleFrame
      title="SUN / MOON EVENTS"
      subtitle="SUNRISE · SUNSET · MOON PHASE"
      right={
        <button type="button" className="crt-button" onClick={onBack}>
          ⟵ RETURN TO MENU
        </button>
      }
    >
      <div className="earth-main-panel" style={{ paddingTop: 8 }}>
        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="boot-white" style={{ opacity: 0.9 }}>
              LAT
            </div>
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              style={{
                width: 140,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(248,179,25,0.45)",
                background: "rgba(0,0,0,0.45)",
                color: "rgba(255,255,255,0.92)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="boot-white" style={{ opacity: 0.9 }}>
              LON
            </div>
            <input
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              style={{
                width: 140,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(248,179,25,0.45)",
                background: "rgba(0,0,0,0.45)",
                color: "rgba(255,255,255,0.92)",
                outline: "none",
              }}
            />
          </div>

          <button
            type="button"
            className="crt-button"
            onClick={fetchAll}
            disabled={loading}
            style={{ minWidth: 150 }}
          >
            {loading ? "ACQUIRING…" : "FETCH EVENTS"}
          </button>
        </div>

        {/* Status */}
        <div className="space-feed-status">
          {err
            ? `SPACE FEED: ERROR — ${err}`
            : loading
            ? "SPACE FEED: ACQUIRING SOL/LUNA EVENTS…"
            : "SPACE FEED: SOL/LUNA EVENTS LOCKED"}
        </div>

        {/* Data panels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginTop: 14,
          }}
        >
          {/* SUN */}
          <div
            style={{
              border: "2px solid rgba(248,179,25,0.35)",
              borderRadius: 14,
              padding: 14,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <div className="boot-white" style={{ marginBottom: 10 }}>
              ☀️ SUN (UTC)
            </div>

            <div className="space-feed-hud">
              <div>DATE: {sun?.date || "—"}</div>
              <div>SUNRISE: {fmtUtc(sun?.sunrise)}</div>
              <div>SUNSET: {fmtUtc(sun?.sunset)}</div>
              <div>SOLAR NOON: {fmtUtc(sun?.solar_noon)}</div>
              <div>DAY LENGTH: {sun?.day_length ?? "—"}</div>
              <div>CIVIL TWILIGHT BEGIN: {fmtUtc(sun?.civil_twilight_begin)}</div>
              <div>CIVIL TWILIGHT END: {fmtUtc(sun?.civil_twilight_end)}</div>
            </div>
          </div>

          {/* MOON */}
          <div
            style={{
              border: "2px solid rgba(248,179,25,0.35)",
              borderRadius: 14,
              padding: 14,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <div className="boot-white" style={{ marginBottom: 10 }}>
              🌙 MOON
            </div>

            <div className="space-feed-hud">
              <div>PHASE: {moon?.phase || "—"}</div>
              <div>ILLUMINATION: {moon?.illumination ?? "—"}</div>
              <div>AGE (DAYS): {moon?.age ?? "—"}</div>
              <div>DISTANCE: {moon?.distance ?? "—"}</div>
              <div>DATE: {moon?.date || "—"}</div>
            </div>
          </div>
        </div>

        {/* HUD footer */}
        <div className="space-feed-hud" style={{ marginTop: 18 }}>
          <div>SYSTEM: {hud.system}</div>
          <div>CHANNEL: {hud.channel}</div>
          <div>STATUS: {hud.status}</div>
        </div>
      </div>
    </ConsoleFrame>
  );
}