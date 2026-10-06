"use client";

import { useEffect, useRef, useState } from "react";

// The original illustrations are always present below these optional videos.
export default function CompanyMotion({ children }) {
  const root = useRef(null);
  const [paused, setPaused] = useState(false);
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    try { setPaused(localStorage.getItem("launchixis-company-motion") === "paused"); } catch {}
  }, []);

  useEffect(() => {
    const videos = [...root.current.querySelectorAll("video[data-src]")];
    const visible = new Set();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection;
    let disposed = false;
    const isRestricted = () => reducedMotion.matches || Boolean(connection?.saveData) || ["slow-2g", "2g"].includes(connection?.effectiveType);
    const sync = () => {
      const blocked = isRestricted();
      setRestricted(blocked);
      for (const video of videos) {
        if (blocked) {
          video.pause();
          delete video.dataset.ready;
          if (video.hasAttribute("src")) { video.removeAttribute("src"); video.load(); }
        } else if (!paused && !document.hidden && visible.has(video) && !video.dataset.failed) {
          if (!video.hasAttribute("src")) video.src = video.dataset.src;
          video.play().catch(() => { /* Still artwork remains if autoplay is unavailable. */ });
        } else video.pause();
      }
    };
    const ready = event => { if (!disposed) event.currentTarget.dataset.ready = "true"; };
    const failed = event => { event.currentTarget.dataset.failed = "true"; delete event.currentTarget.dataset.ready; };
    videos.forEach(video => { video.addEventListener("playing", ready); video.addEventListener("error", failed); });
    // Only cards actually on screen request video bytes or consume decoder time.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); });
      sync();
    }, { threshold: 0.1 });
    videos.forEach(video => observer.observe(video));
    reducedMotion.addEventListener("change", sync);
    connection?.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disposed = true;
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
      connection?.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      videos.forEach(video => { video.pause(); video.removeEventListener("playing", ready); video.removeEventListener("error", failed); });
    };
  }, [paused]);

  function toggle() {
    const next = !paused;
    setPaused(next);
    try { localStorage.setItem("launchixis-company-motion", next ? "paused" : "playing"); } catch {}
  }

  return <div ref={root} className="company-motion">
    <div className="company-motion-controls">
      {restricted ? <p>Still artwork · respecting your device’s motion or data settings.</p> : <button type="button" className="btn ghost" aria-pressed={paused} onClick={toggle}>{paused ? "Play animations" : "Pause animations"}</button>}
    </div>
    {children}
  </div>;
}
