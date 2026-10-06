"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { LAUNCH_STEPS } from "../lib/steps.js";
import LaunchHero, { AskCixy } from "../components/LaunchHero";

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
  const dirtyRef = useRef(false);
  const [revision, setRevision] = useState(0);
  const current = launches.find(l => l.id === selected);
  const load = useCallback(async () => {
    if (dirtyRef.current && !window.confirm("Reload and discard your unsaved changes?")) return;
    dirtyRef.current = false; setRevision(v=>v+1);
    setLoading(true); setError("");
    try { const data = await request(); setLaunches(data.launches); setSelected(prev=>data.launches.some(l=>l.id===prev)?prev:data.launches[0]?.id || null); setUnlocked(data.unlocked); setAccessError(data.accessError); setNewTickets(data.newTickets); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(()=>{if(current?.id && window.location.hash){document.getElementById(window.location.hash.slice(1))?.scrollIntoView({behavior:"instant",block:"start"});}},[current?.id]);
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
      dirtyRef.current = false; setSelected(data.launch.id); return true;
    } catch (e) { setError(e.message); return false; }
    finally { busy.current = false; setSaving(false); }
  }
  async function create(e) {
    e.preventDefault();
    if (dirtyRef.current && !window.confirm("Create a new workspace and discard your unsaved changes?")) return;
    if (await save(draft)) setDraft({ name: "", one_liner: "" });
  }
  return <main className="home-page"><LaunchHero signedIn/>
    <section className="workspace-surface pearl" id="workspace">
    <div className="workspace-toolbar"><div><p className="eyebrow">Your launch, in motion</p><h2>{admin ? "Private launch operations" : "Your private launch workspace"}</h2></div>
    <div className="row">{admin && <a className="btn ghost" href="/admin/support">Support queue · {newTickets} new</a>}<button className="btn ghost" onClick={load} disabled={loading || saving}>Reload board</button></div></div>
    {error && <p className="err" role="alert">{error}</p>}
    {loading && <p role="status">Loading your launches…</p>}
    {accessError ? <p role="alert">We could not verify your checklist access. Reload to try again; your saved work is safe.</p> : !unlocked && <section className="locked-message"><h3>Start with your company</h3><p>Create your workspace below, then unlock the Launch Checklist to edit milestones, keep notes, and download the launch guide.</p><a className="btn" href="/pricing">Unlock the checklist</a></section>}
    {unlocked && <p className="download-row"><a href="/api/checklist">↓ Download your launch guide</a></p>}
    {!loading && (admin || launches.length === 0) && <form className="new" onSubmit={create}>
      <label>Company name<input required maxLength={120} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
      <label>One-sentence product<input maxLength={500} value={draft.one_liner} onChange={e => setDraft({ ...draft, one_liner: e.target.value })} /></label>
      <button className="btn" disabled={saving}>Create workspace</button>
    </form>}
    <div className="family">{launches.map(l => <button type="button" key={l.id} className={"card" + (selected === l.id ? " active" : "")} disabled={saving} onClick={() => { if(selected===l.id)return; if(dirtyRef.current && !window.confirm("Switch launches and discard your unsaved changes?")) return; dirtyRef.current=false; setSelected(l.id); }}>
      <span className="name">{l.name}</span><span className="one">{l.one_liner}</span><span className="meta">{l.status.replaceAll("_", " ")} · {l.items.filter(i => i.done).length}/{LAUNCH_STEPS.length}</span>{admin && l.owner_id && <span className="pill">Customer workspace</span>}
    </button>)}</div>
    {current ? <LaunchEditor key={`${current.id}:${current.version}:${revision}`} launch={current} editable={unlocked} saving={saving} save={save} onDirty={value=>{dirtyRef.current=value;}} /> : <section id="milestones"><h3>Your launch plan starts here</h3><p className="lede" id="notes">Create your company workspace above to open your checklist, downloads, and launch notes.</p></section>}
    <p className="privacy-foot">Private workspace · Visible to you and Launchixis administrators.</p></section>
  </main>;
}
const STAGES = [
  { name:"Foundation", ids:["name","one_liner","domain"] },
  { name:"Build", ids:["repo","vercel","usable_site"] },
  { name:"Prepare", ids:["waitlist","chrome","ixis_pricing"] },
  { name:"Launch", ids:["auth","admin","support","env_isolated"] },
];
function LaunchEditor({ launch, editable, saving, save, onDirty }) {
  const [fields, setFields] = useState({ name: launch.name, one_liner: launch.one_liner, domain: launch.domain, repo: launch.repo, vercel_project: launch.vercel_project, status: launch.status, notes: launch.notes });
  const [dirty, setDirty] = useState(false);
  useEffect(()=>{if(!dirty)return;const warn=e=>{e.preventDefault();e.returnValue="";};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  function field(key, value) { setFields(prev => ({ ...prev, [key]: value })); setDirty(true); onDirty(true); }
  const completed = launch.items.filter(i=>i.done).length;
  const next = LAUNCH_STEPS.find(step=>!launch.items.find(i=>i.id===step.id)?.done);
  return <section className="launch-editor">
    <div className="editor-head"><h2>{launch.name}</h2><div className="progress-copy" role="status">{completed} of {LAUNCH_STEPS.length} milestones complete<div className="segments" aria-hidden="true">{LAUNCH_STEPS.map((step,i)=><span key={step.id} className={i<completed?"complete":""}/>)}</div></div></div>
    <nav className="roadmap" aria-label="Launch stages">{STAGES.map((stage,i)=><a href={`#step-${stage.ids[0]}`} key={stage.name}><span className="stage-number">0{i+1}</span><span>{stage.name}<small>{stage.ids.filter(id=>launch.items.find(item=>item.id===id)?.done).length}/{stage.ids.length} complete</small></span></a>)}</nav>
    <div className="editor-grid" id="milestones">
      <fieldset className="steps" disabled={!editable || saving || dirty} style={{border:0}}><legend>Make your next move</legend>{STAGES.flatMap(stage=>stage.ids).map(id=>LAUNCH_STEPS.find(s=>s.id===id)).map(step=><label className="step" key={step.id} id={`step-${step.id}`}>
        <input type="checkbox" checked={Boolean(launch.items.find(i=>i.id===step.id)?.done)} onChange={e=>save({id:launch.id,version:launch.version,toggle:{id:step.id,done:e.target.checked}})}/>
        <span><strong>{step.label}</strong><span style={{display:"block"}}>{step.hint}</span></span>
      </label>)}</fieldset>
      <aside className="focus-panel"><p className="eyebrow">{next?"Next up":"All milestones complete"}</p><h3>{next?next.label:"Look at what you’ve built."}</h3><p>{next?next.hint:"Your checklist is complete. Review your evidence and decide when you’re ready to launch."}</p><a className="btn cyan" href={editable?"#notes":"/pricing"}>{editable?"Add notes & evidence ↗":"Unlock the checklist ↗"}</a><p>Need a second perspective?</p><AskCixy className="btn ghost"/></aside>
    </div>
    <div className="editor-details" id="notes"><h3>Company details & launch notes</h3>{editable&&<p className="download-row"><a href="/api/checklist">↓ Download your launch guide</a></p>}
    <p className="save-message" role="status">{saving?"Saving…":dirty?"Unsaved changes — use Save details.":"Showing saved details."}</p>
    <form onSubmit={async e=>{e.preventDefault();await save({id:launch.id,version:launch.version,...fields});}}>
      <fieldset disabled={!editable || saving} style={{border:0,padding:0}}>
        <div className="fields">{[["name","Company name",120],["one_liner","One-sentence product",500],["domain","Domain",253],["repo","GitHub repo",200],["vercel_project","Vercel project",100]].map(([key,label,max])=><label key={key}>{label}<input required={key==="name"} maxLength={max} value={fields[key]} onChange={e=>field(key,e.target.value)}/></label>)}
          <label>Status<select value={fields.status} onChange={e=>field("status",e.target.value)}>{["not_started","active","blocked","launched"].map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></label>
        </div><label>Notes and evidence<textarea maxLength={5000} value={fields.notes} onChange={e=>field("notes",e.target.value)}/></label>
        <button className="btn" disabled={!dirty}>Save details</button>
      </fieldset>
    </form>
    {dirty&&<p className="save-message">Save your details before updating milestones.</p>}
    {!editable&&<p><a href="/pricing">Unlock your checklist</a> to save changes.</p>}
    </div>
  </section>;
}
