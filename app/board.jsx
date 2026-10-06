"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { LAUNCH_STEPS } from "../lib/steps.js";
import { walletBuyUrl } from "../lib/wallet.js";
import { ApixisWalletChip } from "@/components/ApixisWalletChip";

async function request(body) {
  const response = await fetch("/api/launches", body ? { method: body.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || "Could not save. Please try again."), { status: response.status });
  return data;
}
export default function Board({ admin = false }) {
  const [launches, setLaunches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unlocked, setUnlocked] = useState(admin);
  const [accessError, setAccessError] = useState(false);
  const [newTickets, setNewTickets] = useState(0);
  const [draft, setDraft] = useState({ name: "", one_liner: "" });
  const busy = useRef(false);
  const current = launches.find(l => l.id === selected);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const data = await request(); setLaunches(data.launches); setUnlocked(data.unlocked); setAccessError(data.accessError); setNewTickets(data.newTickets); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("launchixis:selection", { detail: current ? { id: current.id, name: current.name } : null }));
    return () => window.dispatchEvent(new CustomEvent("launchixis:selection", { detail: null }));
  }, [current?.id, current?.name]);
  async function save(body) {
    if (busy.current) return false;
    busy.current = true; setSaving(true); setError("");
    try {
      const data = await request(body);
      setLaunches(prev => body.id ? prev.map(l => l.id === data.launch.id ? data.launch : l) : [...prev, data.launch]);
      setSelected(data.launch.id); return true;
    } catch (e) { setError(e.message); return false; }
    finally { busy.current = false; setSaving(false); }
  }
  async function create(e) {
    e.preventDefault();
    if (await save(draft)) setDraft({ name: "", one_liner: "" });
  }
  return <main className="shell">
    <header className="top"><div><div className="logo">LAUNCHIXIS</div><h1>{admin ? "Private launch operations" : "Your private launch workspace"}</h1><p className="lede">{admin ? "Manage family launches and customer workspaces. Only administrators can see the full board." : "Your company, milestones, and notes are visible to you and Launchixis administrators."}</p></div>
      <nav className="row" aria-label="Workspace"><ApixisWalletChip /><a className="pill" href={walletBuyUrl("/")}>Buy Ixis</a><a className="pill" href="/pricing">Checklist</a><a className="pill" href="/feed">Feed</a><a className="pill" href="/support">Support</a>
        {admin && <a className="pill" href="/admin/support">Support queue · {newTickets} new</a>}
        <button className="btn ghost" onClick={async () => { const res = await fetch("/api/auth/logout", { method: "POST" }); if (res.ok) window.location.assign("/"); else setError("Could not sign out. Try again."); }}>Sign out</button>
      </nav>
    </header>
    {error && <p className="err" role="alert">{error}</p>}
    <button className="btn ghost" onClick={load} disabled={loading || saving}>Reload board</button>
    {loading && <p role="status">Loading your launches…</p>}
    {accessError ? <p role="alert">We could not verify your checklist access. Reload to try again; your saved work is safe.</p> : !unlocked && <section className="panel"><h2>Start with your company</h2><p>Create your workspace below, then unlock the Launch Checklist to edit milestones, keep notes, and download the launch guide.</p><a className="btn" href="/pricing">Unlock the checklist</a></section>}
    {unlocked && <p><a href="/api/checklist">Download your launch guide</a></p>}
    {!loading && (admin || launches.length === 0) && <form className="new" onSubmit={create}>
      <label>Company name<input required maxLength={120} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
      <label>One-sentence product<input maxLength={500} value={draft.one_liner} onChange={e => setDraft({ ...draft, one_liner: e.target.value })} /></label>
      <button className="btn" disabled={saving}>Create workspace</button>
    </form>}
    <div className="family">{launches.map(l => <button type="button" key={l.id} className={"card" + (selected === l.id ? " active" : "")} disabled={saving} onClick={() => setSelected(l.id)}>
      <span className="name">{l.name}</span><span className="one">{l.one_liner}</span><span className="meta">{l.status.replaceAll("_", " ")} · {l.items.filter(i => i.done).length}/{LAUNCH_STEPS.length}</span>{admin && l.owner_id && <span className="pill">Customer workspace</span>}
    </button>)}</div>
    {current ? <LaunchEditor key={`${current.id}:${current.version}`} launch={current} editable={unlocked} saving={saving} save={save} /> : <p className="lede">Choose a company to open its launch plan.</p>}
    <footer className="foot">LAUNCHIXIS · A Apixis Company</footer>
  </main>;
}
function LaunchEditor({ launch, editable, saving, save }) {
  const [fields, setFields] = useState({ name: launch.name, one_liner: launch.one_liner, domain: launch.domain, repo: launch.repo, vercel_project: launch.vercel_project, status: launch.status, notes: launch.notes });
  const [dirty, setDirty] = useState(false);
  function field(key, value) { setFields(prev => ({ ...prev, [key]: value })); setDirty(true); }
  return <section className="panel"><h2>{launch.name}</h2>
    <p role="status">{saving ? "Saving…" : dirty ? "Unsaved changes — use Save details." : "Showing saved details."}</p>
    <form onSubmit={async e => { e.preventDefault(); await save({ id: launch.id, version: launch.version, ...fields }); }}>
      <fieldset disabled={!editable || saving} style={{ border: 0, padding: 0 }}>
        <div className="fields">{[["name", "Company name",120],["one_liner","One-sentence product",500],["domain","Domain",253],["repo","GitHub repo",200],["vercel_project","Vercel project",100]].map(([key,label,max]) => <label key={key}>{label}<input required={key === "name"} maxLength={max} value={fields[key]} onChange={e => field(key,e.target.value)} /></label>)}
          <label>Status<select value={fields.status} onChange={e => field("status",e.target.value)}>{["not_started","active","blocked","launched"].map(s => <option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></label>
        </div><label>Notes and evidence<textarea maxLength={5000} value={fields.notes} onChange={e => field("notes",e.target.value)} /></label>
        <button className="btn" disabled={!dirty}>Save details</button>
      </fieldset>
    </form>
    <fieldset className="steps" disabled={!editable || saving || dirty} style={{ border: 0 }}><legend>Launch milestones</legend>{LAUNCH_STEPS.map(step => <label className="step" key={step.id}>
      <input type="checkbox" checked={Boolean(launch.items.find(i => i.id === step.id)?.done)} onChange={e => save({ id: launch.id, version: launch.version, toggle: { id: step.id, done: e.target.checked } })} />
      <span><strong>{step.label}</strong><span style={{ display: "block" }}>{step.hint}</span></span>
    </label>)}</fieldset>
    {dirty && <p>Save your details before updating milestones. Reloading discards unsaved edits.</p>}
    {!editable && <p><a href="/pricing">Unlock your checklist</a> to save changes.</p>}
  </section>;
}
