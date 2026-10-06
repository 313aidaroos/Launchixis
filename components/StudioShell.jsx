"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ApixisWalletChip } from "./ApixisWalletChip";
import { walletBuyUrl } from "../lib/wallet.js";
const links = [
  ["Overview", "/", "home"], ["My launch", "/#workspace", "launch"],
  ["My checklist", "/#milestones", "check"], ["Files & notes", "/#notes", "file"],
  ["Apixis Companies", "/companies", "grid"], ["Community", "/feed", "people"],
  ["Pricing", "/pricing", "wallet"], ["Support", "/support", "help"],
];
export function Icon({ name }) {
  const paths = { home:"m3 10 9-7 9 7v10H3Zm6 10v-7h6v7", launch:"M5 18 7 9l10-5 3 3-5 10-9 2Zm5-5 3 3M4 20l3-1", check:"M4 4h16v16H4Zm4 8 3 3 6-7", file:"M5 3h9l5 5v13H5Zm9 0v6h5M9 13h6m-6 4h6", grid:"M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z", people:"M15 21v-3a6 6 0 0 0-12 0v3m14-9a5 5 0 0 1 4 5v4M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 0a4 4 0 0 1 0 8", wallet:"M3 6h17v14H3Zm0 0V3h14v3m-2 6h6v4h-6Z", help:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-3 6a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v.1" };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.home}/></svg>;
}
export default function StudioShell({ children }) {
  const pathname = usePathname();
  const [hash,setHash] = useState("");
  const [menu,setMenu] = useState(false);
  const [session,setSession] = useState(null);
  const [error,setError] = useState("");
  useEffect(()=>{const sync=()=>setHash(window.location.hash);sync();window.addEventListener("hashchange",sync);return()=>window.removeEventListener("hashchange",sync);},[]);
  useEffect(()=>{let active=true;fetch("/api/auth/me",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(active)setSession(d);}).catch(()=>{});return()=>{active=false;};},[pathname]);
  useEffect(()=>{const close=e=>{if(e.key==="Escape")setMenu(false);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[]);
  const current=pathname+hash;
  async function signOut(){const res=await fetch("/api/auth/logout",{method:"POST"}).catch(()=>null);if(res?.ok)window.location.assign("/");else setError("Could not sign out. Please try again.");}
  return <div className="studio-app">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="studio-sidebar">
      <a className="brand" href="/" aria-label="Launchixis home"><img src="/brand/launchixis.png" alt="Launchixis" width="200" height="168" /></a>
      <button className="menu-toggle btn ghost" aria-expanded={menu} aria-controls="studio-nav" onClick={()=>setMenu(!menu)}>{menu?"Close menu":"Menu ☰"}</button>
      <nav id="studio-nav" className={menu?"studio-nav is-open":"studio-nav"} aria-label="Main navigation">
        {links.map(([label,href,icon])=><a key={label} href={href} aria-current={current===href?"page":undefined} onClick={()=>setMenu(false)}><Icon name={icon}/><span>{label}</span></a>)}
        <a href={walletBuyUrl("/")}><Icon name="wallet"/><span>Buy Ixis ↗</span></a>
        {session?.admin&&<a href="/admin/support" aria-current={pathname==="/admin/support"?"page":undefined}><Icon name="help"/><span>Support queue</span></a>}
      </nav>
      <div className="sidebar-end"><span className="family-mark">A</span><span>Apixis Company</span></div>
    </aside>
    <div className="studio-body">
      <header className="studio-topbar"><span className="eyebrow">Your launch studio</span><div className="row">{session?.user&&<ApixisWalletChip/>}{session?.user?<button className="account-button" onClick={signOut}>Sign out</button>:<a className="account-button" href="/login">Sign in</a>}</div></header>
      {error&&<p className="err" role="alert">{error}</p>}
      <div id="main-content" tabIndex={-1}>{children}</div>
      <footer className="studio-footer"><span>Launchixis · A Apixis Company</span><a href="/support">A little help, whenever you need it ↗</a></footer>
    </div>
  </div>;
}
