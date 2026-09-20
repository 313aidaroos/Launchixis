"use client";

import { useEffect, useMemo, useState } from "react";
import { LAUNCH_STEPS, liveUrl } from "../lib/steps.js";
import ProgressCard from "./progress-card.jsx";

function doneCount(items) {
  return (items || []).filter((i) => i.done).length;
}

export default function Board({ initialLaunches = [] }) {
  const [launches, setLaunches] = useState(initialLaunches);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(initialLaunches.length > 0);
  const [draft, setDraft] = useState({ name: "", one_liner: "" });
  const [note, setNote] = useState("");

  async function load() {
    setError("");
    const res = await fetch("/api/launches", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "load_failed");
    setLaunches(data.launches || []);
    return data.launches || [];
  }

  useEffect(() => {
    load()
      .then(() => setLoaded(true))
      .catch((e) => {
        setError(e.message);
        setLoaded(true);
      });
  }, []);

  const current = useMemo(
    () => launches.find((l) => l.id === selected) || null,
    [launches, selected]
  );

  useEffect(() => {
    setNote(current?.notes || "");
  }, [current?.id]);

  async function patch(body) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/launches", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save_failed");
      setLaunches((prev) =>
        prev.map((l) => (l.id === data.launch.id ? data.launch : l))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function createLaunch(e) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/launches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "create_failed");
      setLaunches((prev) => [...prev, data.launch]);
      setSelected(data.launch.id);
      setDraft({ name: "", one_liner: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function field(key, value) {
    if (!current) return;
    setLaunches((prev) =>
      prev.map((l) => (l.id === current.id ? { ...l, [key]: value } : l))
    );
  }

  function persistField(key) {
    if (!current) return;
    patch({ id: current.id, [key]: current[key] });
  }

  const total = LAUNCH_STEPS.length;

  return (
    <div className="shell">
      <header className="top">
        <div>
          <div className="logo">LAUNCHIXIS</div>
          <h1>
            All companies. <em>One screen.</em>
          </h1>
          <p className="lede">
            Family launch board. Every company visible. Open one to work the
            checklist. Checks persist. One active launch at a time.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <a href="/pricing" className="pill" style={{ textDecoration: "none" }}>
            Pricing
          </a>
          <div className="pill">A Apixis Company</div>
        </div>
      </header>

      {error ? <p className="err">{error}</p> : null}
      {!loaded ? <p className="save">Loading board…</p> : null}

      <p className="count">{launches.length} companies</p>

      <form className="new" onSubmit={createLaunch}>
        <input
          placeholder="New company name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <input
          placeholder="One-sentence product"
          value={draft.one_liner}
          onChange={(e) => setDraft({ ...draft, one_liner: e.target.value })}
        />
        <button className="btn" type="submit" disabled={saving}>
          Start this launch
        </button>
      </form>

      <div className="family">
        {launches.map((l) => {
          const n = doneCount(l.items);
          const href = l.live_url || liveUrl(l);
          const host = href.replace(/^https?:\/\//, "");
          return (
            <div
              key={l.id}
              className={"card" + (l.id === selected ? " active" : "")}
              onClick={() => setSelected(l.id === selected ? null : l.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(l.id === selected ? null : l.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="name">{l.name}</div>
              <div className="one">{l.one_liner || "No one-liner yet."}</div>
              {href ? (
                <a
                  className="live"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {host}
                </a>
              ) : (
                <span className="nolive">No live site</span>
              )}
              <div className="dots">
                {LAUNCH_STEPS.map((s) => {
                  const on = Boolean(
                    (l.items || []).find((i) => i.id === s.id)?.done
                  );
                  return (
                    <span
                      key={s.id}
                      className={"dot" + (on ? " on" : "")}
                      title={s.label}
                    />
                  );
                })}
              </div>
              <div className="meta">
                <span className={"status " + l.status}>{l.status}</span>
                <span>
                  {n}/{total}
                </span>
              </div>
              <div className="progress">
                <span style={{ width: `${(n / total) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {current ? (
        <section className="panel">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2>{current.name}</h2>
            <span className="save">
              {saving ? "Saving…" : "Saved to Supabase"}
            </span>
          </div>
          <div className="fields">
            <div>
              <label>One-sentence product</label>
              <input
                value={current.one_liner}
                onChange={(e) => field("one_liner", e.target.value)}
                onBlur={() => persistField("one_liner")}
              />
            </div>
            <div>
              <label>Status</label>
              <select
                value={current.status}
                onChange={(e) =>
                  patch({ id: current.id, status: e.target.value })
                }
              >
                <option value="not_started">not started</option>
                <option value="active">active</option>
                <option value="launched">launched</option>
                <option value="blocked">blocked</option>
              </select>
            </div>
            <div>
              <label>Domain</label>
              <input
                value={current.domain}
                onChange={(e) => field("domain", e.target.value)}
                onBlur={() => persistField("domain")}
                placeholder="example.dev"
              />
            </div>
            <div>
              <label>GitHub repo</label>
              <input
                value={current.repo}
                onChange={(e) => field("repo", e.target.value)}
                onBlur={() => persistField("repo")}
                placeholder="313aidaroos/Name"
              />
            </div>
            <div>
              <label>Vercel project</label>
              <input
                value={current.vercel_project}
                onChange={(e) => field("vercel_project", e.target.value)}
                onBlur={() => persistField("vercel_project")}
              />
            </div>
          </div>

          <div className="steps">
            {LAUNCH_STEPS.map((step) => {
              const item = (current.items || []).find((i) => i.id === step.id);
              const done = Boolean(item?.done);
              return (
                <label
                  key={step.id}
                  className={"step" + (done ? " done" : "")}
                >
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) =>
                      patch({
                        id: current.id,
                        toggle: { id: step.id, done: e.target.checked },
                      })
                    }
                  />
                  <div>
                    <h3>{step.label}</h3>
                    <p>{step.hint}</p>
                  </div>
                </label>
              );
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Notes / blockers</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() =>
                note !== current.notes &&
                patch({ id: current.id, notes: note })
              }
              placeholder="DNS he owns, App Store, legal — log it, keep shipping the rest."
            />
          </div>

          <ProgressCard launch={current} />
        </section>
      ) : (
        <p className="lede">Click a company to work its checklist.</p>
      )}

      <footer className="foot">
        <span>LAUNCHIXIS · A Apixis Company</span>
        <span>One company at a time unless Awad names two.</span>
      </footer>
    </div>
  );
}
