"use client";

import {
  CUSTOMIZE_OPTIONS,
  wardrobeSections,
} from "../lib/cixy-cosmetics.js";

export default function CixyWardrobe() {
  const sections = wardrobeSections();

  return (
    <div className="cixy-wardrobe">
      <p className="cixy-wardrobe-note">
        Wallet buy grants the wardrobe entitlement. Equip lands on your
        signature Cixy when Wallet entitlement read ships. Prices stay unset
        until Awad locks Ixis integers.
      </p>

      <section className="cixy-wardrobe-block" aria-label="Customize">
        <h4>Customize</h4>
        <ul className="cixy-customize">
          {CUSTOMIZE_OPTIONS.map((option) => (
            <li key={option.key}>
              <span>{option.label}</span>
              <span className="cixy-placeholder">Placeholder</span>
            </li>
          ))}
        </ul>
      </section>

      {sections.map((section) => (
        <section
          key={section.category}
          className="cixy-wardrobe-block"
          aria-label={section.label}
        >
          <h4>{section.label}</h4>
          <ul className="cixy-cosmetic-list">
            {section.items.map((item) => (
              <li key={item.unlockAssetId}>
                <div className="cixy-cosmetic-name">
                  <strong>{item.label}</strong>
                  <code>{item.unlockAssetId}</code>
                </div>
                <p className="cixy-ownership">{item.ownershipLabel}</p>
                {item.priceLabel ? (
                  <p className="cixy-price">{item.priceLabel}</p>
                ) : null}
                <div className="cixy-cosmetic-actions">
                  {item.buyHref ? (
                    <a href={item.buyHref}>Buy on Wallet</a>
                  ) : null}
                  <button type="button" disabled>
                    Equip
                  </button>
                </div>
                <p className="cixy-equip-note">{item.equipNote}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <style jsx>{`
        .cixy-wardrobe-note,
        .cixy-ownership,
        .cixy-price,
        .cixy-equip-note {
          margin: 4px 0 0;
          color: var(--muted, #6b7280);
          font-size: 12px;
          line-height: 1.4;
        }

        .cixy-wardrobe-block {
          margin-top: 14px;
        }

        .cixy-wardrobe-block h4 {
          margin: 0 0 8px;
          font-size: 13px;
          letter-spacing: 0.04em;
          color: var(--gold, #6d28d9);
        }

        .cixy-customize,
        .cixy-cosmetic-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cixy-customize li,
        .cixy-cosmetic-list li {
          border: 1px solid var(--line, #e5e7eb);
          border-radius: 10px;
          padding: 8px 10px;
          background: var(--card, #10131a);
          color: var(--text, #e8e6e1);
        }

        .cixy-customize li {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font-size: 13px;
        }

        .cixy-placeholder {
          color: var(--dim, #9ca3af);
          font-size: 12px;
        }

        .cixy-cosmetic-name {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cixy-cosmetic-name strong {
          font-size: 13px;
        }

        .cixy-cosmetic-name code {
          font-size: 10px;
          color: var(--dim, #6b7280);
          word-break: break-all;
        }

        .cixy-cosmetic-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 8px;
        }

        .cixy-cosmetic-actions a {
          color: #1a1408;
          background: var(--gold, #667eea);
          text-decoration: none;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
        }

        .cixy-cosmetic-actions button {
          background: transparent;
          color: var(--muted, #6b7280);
          border: 1px solid var(--line, #d1d5db);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
        }

        .cixy-cosmetic-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
