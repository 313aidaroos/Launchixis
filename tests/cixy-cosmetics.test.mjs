import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ALL_UNLOCK_ASSET_IDS,
  CIXY_COSMETIC_CATALOG,
  COSMETIC_PRICE_IXIS,
  CUSTOMIZE_OPTION_KEYS,
  ESSENTIAL_UNLOCK_ASSET_IDS,
  wardrobeItemState,
  wardrobeSections,
} from "../lib/cixy-cosmetics.js";
import { walletBuyUrl, walletCosmeticBuyUrl } from "../lib/wallet.js";

const EXPECTED_IDS = [
  "cixy.cosmetic.outfit.starter",
  "cixy.cosmetic.outfit.executive",
  "cixy.cosmetic.outfit.street",
  "cixy.cosmetic.outfit.formal",
  "cixy.cosmetic.theme.midnight",
  "cixy.cosmetic.theme.dawn",
  "cixy.cosmetic.theme.neon",
  "cixy.cosmetic.theme.paper",
  "cixy.cosmetic.template.brief",
  "cixy.cosmetic.template.standup",
  "cixy.cosmetic.template.client",
  "cixy.cosmetic.template.ops",
  "cixy.cosmetic.office.desk",
  "cixy.cosmetic.office.warroom",
  "cixy.cosmetic.office.lounge",
  "cixy.cosmetic.office.studio",
];

test("customize option keys match the Wallet UI contract", () => {
  assert.deepEqual(CUSTOMIZE_OPTION_KEYS, [
    "skin",
    "hairStyle",
    "hairColor",
    "eyes",
    "outfit",
    "office",
  ]);
});

test("catalog unlockAssetIds are the canonical set, in category order", () => {
  assert.deepEqual(ALL_UNLOCK_ASSET_IDS, EXPECTED_IDS);
  assert.deepEqual(
    CIXY_COSMETIC_CATALOG.outfit.map((item) => item.unlockAssetId),
    EXPECTED_IDS.slice(0, 4)
  );
  assert.deepEqual(
    CIXY_COSMETIC_CATALOG.theme.map((item) => item.unlockAssetId),
    EXPECTED_IDS.slice(4, 8)
  );
  assert.deepEqual(
    CIXY_COSMETIC_CATALOG.template.map((item) => item.unlockAssetId),
    EXPECTED_IDS.slice(8, 12)
  );
  assert.deepEqual(
    CIXY_COSMETIC_CATALOG.office.map((item) => item.unlockAssetId),
    EXPECTED_IDS.slice(12, 16)
  );
});

test("essentials are starter, paper, brief, and desk only", () => {
  assert.deepEqual(ESSENTIAL_UNLOCK_ASSET_IDS, [
    "cixy.cosmetic.outfit.starter",
    "cixy.cosmetic.theme.paper",
    "cixy.cosmetic.template.brief",
    "cixy.cosmetic.office.desk",
  ]);
});

test("prices stay null until Awad locks Ixis integers", () => {
  assert.equal(COSMETIC_PRICE_IXIS, null);
  for (const item of wardrobeSections().flatMap((section) => section.items)) {
    assert.equal(item.priceIxis, null);
    if (item.owned) {
      assert.equal(item.priceLabel, null);
    } else {
      assert.equal(item.priceLabel, "Coming soon");
    }
  }
});

test("unowned cosmetics buy on Wallet with product=launchixis and the exact sku", () => {
  const executive = wardrobeItemState({
    unlockAssetId: "cixy.cosmetic.outfit.executive",
    label: "Executive",
    essential: false,
    category: "outfit",
  });
  const url = new URL(executive.buyHref);
  assert.equal(url.origin + url.pathname, "https://apixis-wallet.vercel.app/");
  assert.equal(url.searchParams.get("tab"), "buy");
  assert.equal(url.searchParams.get("origin"), "launchixis");
  assert.equal(url.searchParams.get("product"), "launchixis");
  assert.equal(url.searchParams.get("sku"), "cixy.cosmetic.outfit.executive");
  assert.equal(
    url.searchParams.get("return_url"),
    "https://launchixis.vercel.app/"
  );
  assert.equal(
    executive.buyHref,
    "https://apixis-wallet.vercel.app?tab=buy&origin=launchixis&product=launchixis&sku=cixy.cosmetic.outfit.executive&return_url=https%3A%2F%2Flaunchixis.vercel.app%2F"
  );

  for (const item of wardrobeSections().flatMap((section) => section.items)) {
    assert.equal(item.equipEnabled, false);
    assert.equal(item.equipNote, "Equip when Wallet entitlement read ships");
    if (item.owned) {
      assert.equal(item.buyHref, null);
      assert.equal(item.ownershipLabel, "Essentials · always owned");
      continue;
    }
    const buy = new URL(item.buyHref);
    assert.equal(buy.searchParams.get("product"), "launchixis");
    assert.equal(buy.searchParams.get("origin"), "launchixis");
    assert.equal(buy.searchParams.get("sku"), item.unlockAssetId);
    assert.equal(EXPECTED_IDS.includes(item.unlockAssetId), true);
  }
});

test("existing Buy Ixis links stay free of a cosmetic sku", () => {
  const pricing = new URL(walletBuyUrl("/pricing"));
  assert.equal(pricing.searchParams.get("product"), null);
  assert.equal(pricing.searchParams.get("sku"), null);
  assert.equal(pricing.searchParams.get("origin"), "launchixis");
});

test("cosmetic buy helper refuses an empty sku", () => {
  assert.throws(() => walletCosmeticBuyUrl(""), TypeError);
  assert.throws(() => walletCosmeticBuyUrl("   "), TypeError);
});

test("wardrobe stub is text and buy links, with no invented art or payment machine", () => {
  const wardrobe = readFileSync(
    new URL("../app/cixy-wardrobe.jsx", import.meta.url),
    "utf8"
  );
  const widget = readFileSync(new URL("../app/cixy.jsx", import.meta.url), "utf8");
  const catalog = readFileSync(
    new URL("../lib/cixy-cosmetics.js", import.meta.url),
    "utf8"
  );
  const pricing = readFileSync(
    new URL("../app/pricing/page.jsx", import.meta.url),
    "utf8"
  );

  assert.match(widget, /Wardrobe/);
  assert.match(widget, /CixyWardrobe/);
  assert.match(wardrobe, /Buy on Wallet/);
  assert.equal(/<svg[\s>]/i.test(wardrobe), false);
  assert.equal(/<svg[\s>]/i.test(widget), false);
  assert.equal(/stripe/i.test(wardrobe + catalog), false);
  assert.equal(catalog.includes("Launch Ops"), false);
  assert.equal(catalog.includes("Enterprise"), false);
  assert.equal(catalog.includes("Brand Kit"), false);
  assert.equal(catalog.includes("Checklist"), false);
  assert.match(pricing, /Launch Ops Seat/);
  assert.match(pricing, /Enterprise Launch Suite/);
  assert.match(pricing, /Launch Checklist Template/);
  assert.match(pricing, /Brand Kit One-off/);
});
