"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { walletBuyUrl } from "../../lib/wallet.js";
import { CHECKLIST_PRODUCT } from "../../lib/product.js";

const buyHref = walletBuyUrl("/pricing");
export default function PricingPage() {
  const [product,setProduct] = useState(null), [error,setError] = useState(""), [busy,setBusy] = useState(false);
  const attempt = useRef(null);
  const refresh = useCallback(async()=>{
    try { const res = await fetch("/api/product",{cache:"no-store"}); const data=await res.json(); if(!res.ok) throw new Error(data.error); setProduct(data); setError(""); }
    catch(e){setError(e.message);}
  },[]);
  useEffect(()=>{ void refresh(); },[refresh]);
  async function buy() {
    if(busy) return; setBusy(true); setError("");
    try {
      attempt.current ||= sessionStorage.getItem("lx-checklist-attempt") || crypto.randomUUID();
      sessionStorage.setItem("lx-checklist-attempt",attempt.current);
      const res=await fetch("/api/redeem",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({productKey:CHECKLIST_PRODUCT,attemptId:attempt.current})});
      const data=await res.json();
      if(!res.ok){
        if(res.status===402 || (res.status===409 && data.error?.includes("released"))) { sessionStorage.removeItem("lx-checklist-attempt"); attempt.current=null; }
        throw new Error(data.error || "Purchase status is unavailable. Retry to check the same purchase safely.");
      }
      sessionStorage.removeItem("lx-checklist-attempt"); attempt.current=null;
      setProduct(prev=>({...prev,owned:true}));
    } catch(e) {setError(e.message);} finally {setBusy(false);}
  }
  return <main className="shell"><header className="top"><div><div className="logo">LAUNCHIXIS</div><h1>Launch Checklist</h1><p className="lede">One company. A practical plan you can keep and work through.</p></div></header>
    <section className="panel product-panel"><h2>Launch Checklist Template</h2><p className="price">{product ? `${product.price.toLocaleString()} Ixis · one-time purchase` : "Checking price…"}</p>
      <ul><li>Downloadable 13-step launch guide with actions and evidence for every milestone.</li><li>One private company workspace with an editable checklist, status, and notes.</li><li>Launch advice from Cixy and support when you need it.</li></ul>
      <p>This is a planning tool. It does not include an operator, brand design, deployment work, or guaranteed launch results. Your workspace is accessible to you and Launchixis administrators.</p>
      {error && <p className="err" role="alert">{error}</p>}
      {product?.owned ? <p role="status">Your checklist is ready. <a className="btn" href="/api/checklist">Download guide</a> <a className="btn ghost" href="/">Open workspace</a></p> : product?.signedIn ? <button className="btn" disabled={busy} onClick={buy}>{busy ? "Checking your purchase…" : `Unlock for ${product.price.toLocaleString()} Ixis`}</button> : product ? <a className="btn" href="/auth/apixis/start?next=%2Fpricing">Sign in with Apixis to purchase</a> : <button className="btn ghost" onClick={refresh}>Retry price check</button>}
      <p>Payment uses your shared Apixis Wallet. Already purchased? <button className="btn ghost" disabled={busy} onClick={refresh}>Refresh access</button></p>
      <a href={buyHref}>Buy Ixis in Apixis Wallet</a>
    </section>
    <p>Brand kits, operator seats, and enterprise services are not on sale. We will offer them when their delivery workflows are ready.</p>
    <nav className="row"><a href="/">Workspace</a><a href="/support">Support</a><a href="/feed">Feed</a></nav><footer className="foot">LAUNCHIXIS · A Apixis Company</footer>
  </main>;
}
