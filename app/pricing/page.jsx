"use client";

import { useState } from "react";
import { walletBuyUrl, walletHomeUrl } from "../../lib/wallet.js";

const buyHref = walletBuyUrl("/pricing");
const walletHref = walletHomeUrl("/pricing");

const PRODUCTS = [
  {
    key: "launchixis.template.checklist",
    name: "Launch Checklist Template",
    ixis: 1000,
    usd: 10,
    desc: "One-time purchase. Complete 13-step launch template for a single Apixis-family product. Includes domain strategy, Vercel setup, auth gates, support routing.",
  },
  {
    key: "launchixis.brandkit",
    name: "Brand Kit One-off",
    ixis: 1000,
    usd: 10,
    desc: 'One-time brand setup: logo guidelines, color palette (Special Elite typewriter font included), family chrome ("A Apixis Company" badge).',
  },
  {
    key: "launchixis.seat.monthly",
    name: "Launch Ops Seat",
    ixis: 10000,
    usd: 100,
    recurring: true,
    desc: "Monthly. One dedicated launch operator managing your product's board, checklist progress, blockers log, and Cixy launch AI access. Priority support from awad@apixis.dev.",
    featured: true,
  },
  {
    key: "launchixis.suite.monthly",
    name: "Enterprise Launch Suite",
    ixis: 30000,
    usd: 300,
    recurring: true,
    desc: "Monthly. Full-service launch operations for 3+ sister companies simultaneously. Includes multi-board view, family-wide GTM sequencing, shared Cixy context.",
  },
];

function RedeemButton({ product }) {
  // Not on sale: every SKU here would take Ixis and deliver nothing yet — provision() is a no-op
  // and there is no file, seat or access behind any key. Sells the day the product is defined.
  return (
    <div>
      <button type="button" disabled className="btn ghost" aria-disabled="true">
        Not on sale yet · {product.ixis.toLocaleString()} Ixis
      </button>
      <p className="muted" style={{ marginTop: 8, fontSize: "0.9em" }}>
        We only take Ixis for things you can use today. {product.name} opens when it is ready.
      </p>
    </div>
  );
}

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
        {PRODUCTS.map((product) => (
          <div key={product.key} className={`pricing-card${product.featured ? " featured" : ""}`}>
            <h2>{product.name}</h2>
            <div className="price">
              <span className="ixis">
                {product.ixis.toLocaleString()} Ixis{product.recurring ? "/mo" : ""}
              </span>
              <span className="usd">≈ ${product.usd}{product.recurring ? "/mo" : ""}</span>
            </div>
            <p className="pricing-desc">{product.desc}</p>
            <RedeemButton product={product} />
          </div>
        ))}
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
            <strong>Redeem here</strong> — sign in, click Redeem. If you don't
            have enough Ixis, you'll be sent to Buy.
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
