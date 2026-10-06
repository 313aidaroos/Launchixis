"use client";
import { useCallback, useEffect, useState } from "react";
export default function SupportQueue() {
  const [tickets,setTickets] = useState([]), [status,setStatus] = useState("new"), [error,setError] = useState(""), [busy,setBusy] = useState(false), [loaded,setLoaded] = useState(false);
  const load = useCallback(async () => {
    try { const res = await fetch(`/api/support?status=${status}`, { cache: "no-store" }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setTickets(data.tickets); setError(""); }
    catch(e) { setError(e.message); } finally { setLoaded(true); }
  },[status]);
  useEffect(() => { void load(); const id = setInterval(load, 30000); return () => clearInterval(id); },[load]);
  async function update(ticket, value) {
    setBusy(true); setError("");
    try { const res = await fetch("/api/support", { method:"PATCH", headers:{"content-type":"application/json"}, body:JSON.stringify({ id:ticket.id, status:value, updated_at:ticket.updated_at }) }); const data=await res.json(); if(!res.ok) throw new Error(data.error); await load(); }
    catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="shell"><div className="logo">LAUNCHIXIS</div><h1>Support queue</h1><p><a href="/">Back to private board</a></p>
    <p className="lede">New requests appear here automatically. Review the request, contact the customer from your support mailbox, and update its status.</p>
    <label>Show tickets<select value={status} onChange={e=>setStatus(e.target.value)}>{["new","in_progress","done","all"].map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></label>
    <button className="btn ghost" onClick={load}>Refresh queue</button>
    {error && <p className="err" role="alert">{error}</p>}
    <p role="status">{loaded ? `${tickets.length} ${status === "all" ? "recent" : status.replaceAll("_"," ")} tickets (up to 100)` : "Loading tickets…"}</p>
    {tickets.map(t=><article className="panel" key={t.id}><h2>{t.subject}</h2><p>{t.email} · {new Date(t.created_at).toLocaleString()}</p><p style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{t.message}</p><p>Reference: {t.id}</p>
      <a className="btn ghost" href={`mailto:${encodeURIComponent(t.email)}?subject=${encodeURIComponent(`Re: ${t.subject} [${t.id}]`)}`}>Reply from your mailbox</a>
      <label>Status<select disabled={busy} value={t.status} onChange={e=>update(t,e.target.value)}>{["new","in_progress","done"].map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></label>
    </article>)}
  </main>;
}
