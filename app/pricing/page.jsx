"use client";

import { walletBuyUrl, walletHomeUrl } from "../../lib/wallet.js";

const buyHref = walletBuyUrl("/pricing");
const walletHref = walletHomeUrl("/pricing");

export default function PricingPage() {
  return (
    <div className="shell">
      <header className="top">
        <div>
          <div className="logo">LAUNCHIXIS</div>
          <h1>Pricing in Ixis Points</h1>
          <p className="lede">
            100 Ixis = $1. Buy Ixis in Apixis Wallet, redeem here. Paid Ixis
            never expires.
          </p>
        </div>
        <div className="row">
          <a className="btn" href={buyHref} style={{ textDecoration: "none" }}>
            Buy Ixis
          </a>
          <a
            className="btn ghost"
            href={walletHref}
            style={{ textDecoration: "none" }}
          >
            Open Wallet
          </a>
        </div>
      </header>

      <div className="pricing-grid">
        <div className="pricing-card">
          <h2>Launch Checklist Template</h2>
          <div className="price">
            <span className="ixis">1,000 Ixis</span>
            <span className="usd">≈ $10</span>
          </div>
          <p className="pricing-desc">
            One-time purchase. Complete 13-step launch template for a single
            Apixis-family product. Includes domain strategy, Vercel setup, auth
            gates, support routing.
          </p>
          <button className="btn" disabled>
            Redeem · 1,000 Ixis
          </button>
        </div>

        <div className="pricing-card">
          <h2>Brand Kit One-off</h2>
          <div className="price">
            <span className="ixis">1,000 Ixis</span>
            <span className="usd">≈ $10</span>
          </div>
          <p className="pricing-desc">
            One-time brand setup: logo guidelines, color palette (Special Elite
            typewriter font included), family chrome ("A Apixis Company" badge).
          </p>
          <button className="btn" disabled>
            Redeem · 1,000 Ixis
          </button>
        </div>

        <div className="pricing-card featured">
          <h2>Launch Ops Seat</h2>
          <div className="price">
            <span className="ixis">10,000 Ixis/mo</span>
            <span className="usd">≈ $100/mo</span>
          </div>
          <p className="pricing-desc">
            Monthly. One dedicated launch operator managing your product's board,
            checklist progress, blockers log, and Cixy launch AI access. Priority
            support from awad@apixis.dev.
          </p>
          <button className="btn" disabled>
            Redeem · 10,000 Ixis
          </button>
        </div>

        <div className="pricing-card">
          <h2>Enterprise Launch Suite</h2>
          <div className="price">
            <span className="ixis">30,000 Ixis/mo</span>
            <span className="usd">≈ $300/mo</span>
          </div>
          <p className="pricing-desc">
            Monthly. Full-service launch operations for 3+ sister companies
            simultaneously. Includes multi-board view, family-wide GTM
            sequencing, shared Cixy context.
          </p>
          <button className="btn" disabled>
            Redeem · 30,000 Ixis
          </button>
        </div>
      </div>

      <div className="pricing-notes">
        <h3>About Ixis Points</h3>
        <ul>
          <li>
            <strong>100 Ixis = $1 USD</strong> — stable conversion rate
          </li>
          <li>
            <strong>Paid Ixis never expires</strong> — use them across every
            Apixis-family product
          </li>
          <li>
            <strong>Buy in Apixis Wallet</strong> — one account, all companies.
            Purchase via card at{" "}
            <a href={buyHref}>apixis-wallet.vercel.app</a>
          </li>
          <li>
            <strong>Redeem here</strong> — stays off until a Wallet session
            exists. Launchixis does not spend Ixis in this pass.
          </li>
          <li>
            <strong>No Launchixis-owned Stripe Checkout</strong> — all payments
            flow through Apixis Wallet for family-wide point tracking
          </li>
        </ul>
      </div>

      <footer className="foot">
        <span>LAUNCHIXIS · A Apixis Company</span>
        <span>
          <a href="/">← Back to board</a>
        </span>
      </footer>
    </div>
  );
}
