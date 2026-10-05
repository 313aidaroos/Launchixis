import LaunchixisFeed from "./LaunchixisFeed";
import { walletBuyUrl } from "../../lib/wallet.js";
import { ApixisWalletChip } from "@/components/ApixisWalletChip";
import "./feed.css";

export const metadata = {
  title: "Feed — Launchixis",
  description: "Posts from every Apixis company, in one feed.",
};

// Same header pills and footer as the launch board (app/board.jsx); Feed is the current pill.
export default function FeedPage() {
  return (
    <div className="shell">
      <header className="top">
        <div>
          <div className="logo">LAUNCHIXIS</div>
          <h1>
            Every company. <em>One feed.</em>
          </h1>
          <p className="lede">
            What people across the Apixis family are sharing. Sign in with your Apixis ID to post, follow, comment and tip in Ixis.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <ApixisWalletChip />
          <a href={walletBuyUrl("/feed")} className="pill" style={{ textDecoration: "none" }}>Buy Ixis</a>
          <a href="/" className="pill" style={{ textDecoration: "none" }}>Launch board</a>
          <a href="/companies" className="pill" style={{ textDecoration: "none" }}>Apixis Companies</a>
          <a href="/feed" className="pill lx-pill-on" aria-current="page" style={{ textDecoration: "none" }}>Feed</a>
          <a href="/pricing" className="pill" style={{ textDecoration: "none" }}>Pricing</a>
          <a href="/support" className="pill" style={{ textDecoration: "none" }}>Support</a>
          <a href="/login" className="pill" style={{ textDecoration: "none" }}>Sign In</a>
          <div className="pill">A Apixis Company</div>
        </div>
      </header>

      <LaunchixisFeed />

      <footer className="foot">
        <span>LAUNCHIXIS · A Apixis Company</span>
        <span>One company at a time unless Awad names two.</span>
      </footer>
    </div>
  );
}
