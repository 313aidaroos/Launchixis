"use client";

import { useEffect, useMemo, useState } from "react";
import { LAUNCH_STEPS } from "../lib/steps.js";

function doneCount(items) {
  return (items || []).filter((i) => i.done).length;
}

export default function Board() {
  const [launches, setLaunches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
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
      .then((rows) => {
        const active = rows.find((r) => r.status === "active") || rows[0];
        setSelected(active?.id || null);
        setLoaded(true);
      })
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

  return (
    <div className="shell">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <header className="top">
        <div>
          <div className="logo">LAUNCHIXIS</div>
          <h1>
            Launch one company. <em>Finish the board.</em>
          </h1>
          <p className="lede">
            Live checklist for Apixis-family launches. Checks persist. One
            active company at a time.
          </p>
        </div>
        <div className="pill">A Apixis Company</div>
      </header>

      {error ? <p className="err">{error}</p> : null}
      {!loaded ? <p className="save">Loading board…</p> : null}

      <div className="board">
        <aside className="panel">
          <div className="list">
            {launches.map((l) => {
              const n = doneCount(l.items);
              const t = LAUNCH_STEPS.length;
              return (
                <button
                  key={l.id}
                  className={"company" + (l.id === selected ? " active" : "")}
                  onClick={() => setSelected(l.id)}
                  type="button"
                >
                  <div className="name">{l.name}</div>
                  <div className="meta">
                    <span className={"status " + l.status}>{l.status}</span>
                    {"  "}
                    {n}/{t}
                  </div>
                  <div className="progress">
                    <span style={{ width: `${(n / t) * 100}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
          <form className="new" onSubmit={createLaunch}>
            <input
              placeholder="New company name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <input
              placeholder="One-sentence product"
              value={draft.one_liner}
              onChange={(e) =>
                setDraft({ ...draft, one_liner: e.target.value })
              }
            />
            <button className="btn" type="submit" disabled={saving}>
              Start this launch
            </button>
          </form>
        </aside>

        <section className="panel">
          {!current ? (
            <p className="lede">Pick a company or start a launch.</p>
          ) : (
            <>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h2>{current.name}</h2>
                <span className="save">{saving ? "Saving…" : "Saved to Supabase"}</span>
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
                  placeholder="DNS he owns, App Store, legal, live Stripe — log it, keep shipping the rest."
                />
              </div>
            </>
          )}
        </section>
      </div>

      <footer className="foot">
        <span>LAUNCHIXIS · A Apixis Company</span>
        <span>One company at a time unless Awad names two.</span>
      </footer>
    </div>
  );
}
