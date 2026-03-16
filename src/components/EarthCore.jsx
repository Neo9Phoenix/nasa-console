import React, { useEffect, useMemo, useRef, useState } from "react";
import ConsoleFrame from "./ConsoleFrame";
import "./CRTLayout.css";

/* =========================================================
   API CONFIG
   ========================================================= */

const API_BASE = import.meta.env.VITE_API_BASE;

/* Fallback Earth image if APIs fail */

const FALLBACK_IMAGE =
  "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/land_ocean_ice_2048.png";


export default function EarthCore({ onBack }) {

/* =========================================================
   STATE
   ========================================================= */

const [apod, setApod] = useState(null);
const [epicUrls, setEpicUrls] = useState([]);
const [frameIndex, setFrameIndex] = useState(0);
const [useFallback, setUseFallback] = useState(false);

const frameTimer = useRef(null);


/* =========================================================
   KEEP BACKEND AWAKE (Render sleep fix)
   ========================================================= */

useEffect(() => {
  const ping = setInterval(() => {
    fetch(`${API_BASE}/health`).catch(() => {});
  }, 240000); // every 4 minutes

  return () => clearInterval(ping);
}, []);


  /* =========================================================
     HUD TELEMETRY (STATIC DEMO DATA)
     ========================================================= */

  const hud = useMemo(() => ({
    orbitTime: "92.7 min",
    altitude: "408 km",
    velocity: "7.66 km/s",
    status: "NOMINAL",
  }), []);


  /* =========================================================
     FETCH NASA DATA
     ========================================================= */

  useEffect(() => {

    let cancelled = false;

    async function fetchAPOD() {
      try {
        const res = await fetch(`${API_BASE}/apod`);
        const data = await res.json();

        if (cancelled) return;

        if (data?.media_type === "image" && data?.url) {
          setApod(data.url);
        } else {
          setApod(null);
        }

      } catch (err) {
        console.error("APOD fetch failed:", err);
        if (!cancelled) setApod(null);
      }
    }


    async function fetchEPIC() {
      try {
        const res = await fetch(`${API_BASE}/epic`);
        const data = await res.json();

        const urls = Array.isArray(data)
          ? data
          : data?.images || [];

        /* Preload images for smoother playback */

        urls.forEach(url => {
          const img = new Image();
          img.src = url;
        });

        if (!cancelled) {
          setEpicUrls(urls);
          setFrameIndex(0);
        }

      } catch (err) {
        console.error("EPIC fetch failed:", err);
        if (!cancelled) setEpicUrls([]);
      }
    }

    fetchAPOD();
    fetchEPIC();

    return () => {
      cancelled = true;
    };

  }, []);


  /* =========================================================
     EPIC FRAME LOOP
     ========================================================= */

  useEffect(() => {

    if (!epicUrls.length) return;

    frameTimer.current = setInterval(() => {
      setFrameIndex(i => (i + 1) % epicUrls.length);
    }, 1000);

    return () => {
      if (frameTimer.current) clearInterval(frameTimer.current);
    };

  }, [epicUrls]);


  /* =========================================================
     IMAGE SOURCE SELECTION
     ========================================================= */

  let mode;

  if (!useFallback && epicUrls.length > 0) {
    mode = "epic";
  }
  else if (apod) {
    mode = "apod";
  }
  else {
    mode = "fallback";
  }

  let imageSrc;
  let sourceLabel;
  let sourceUrl;

  if (mode === "epic") {

    imageSrc = epicUrls[frameIndex];
    sourceLabel = "EPIC PROXY (EARTH)";
    sourceUrl = epicUrls[frameIndex];

  } else if (mode === "apod") {

    imageSrc = apod;
    sourceLabel = "APOD (DEEP SPACE / SKY)";
    sourceUrl = apod;

  } else {

    imageSrc = FALLBACK_IMAGE;
    sourceLabel = "STATIC EARTH BACKDROP";
    sourceUrl = null;

  }


  /* =========================================================
     STATUS MESSAGE
     ========================================================= */

  const statusText =
    mode === "epic"
      ? "SPACE FEED: EPIC LIVE EARTH FRAMES (NASA DSCOVR)"
      : mode === "apod"
      ? "SPACE FEED: EPIC OFFLINE – DISPLAYING NASA APOD"
      : "SPACE FEED: EPIC & APOD UNAVAILABLE – DISPLAYING EARTH FALLBACK";


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <ConsoleFrame
      title="EARTH TELEMETRY CORE"
      subtitle="EPIC • APOD • FALLBACK"
      right={
        <button
          className="crt-button"
          type="button"
          onClick={onBack}
        >
          ⟵ RETURN TO MENU
        </button>
      }
    >

      <div className="earth-main-panel" style={{ paddingTop: "8px" }}>

        {imageSrc ? (

          <img
            key={imageSrc}
            src={imageSrc}
            alt="Space feed"
            className="space-feed-image"
            style={{
              maxWidth: "80vw",
              maxHeight: "60vh",
              borderRadius: "12px",
              border: "2px solid rgba(248,179,25,0.6)",
              boxShadow: "0 0 25px rgba(0,0,0,0.75)",
            }}
            onError={() => {
              console.error("Image failed — switching to fallback");
              setUseFallback(true);
            }}
          />

        ) : (

          <div className="loading boot-white">
            ACQUIRING FRAMES…
          </div>

        )}


        <div className="space-feed-status">
          {statusText}
        </div>


        <div className="space-feed-source">
          Space feed source – {sourceLabel}
          {sourceUrl
            ? ` · ${sourceUrl}`
            : " · (static image)"}
        </div>


        <div className="space-feed-hud">

          <div>ORBIT TIME: {hud.orbitTime}</div>
          <div>ALTITUDE: {hud.altitude}</div>
          <div>VELOCITY: {hud.velocity}</div>
          <div>STATUS: {hud.status}</div>

        </div>

      </div>

    </ConsoleFrame>
  );
}