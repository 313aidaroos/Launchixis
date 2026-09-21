// Canonical Cixy cosmetic unlockAssetIds for the wardrobe stub.
// Schema reference: docs/CIXY_COSMETICS.md (Wallet; doc may still be in flight).
// Ixis prices stay null until Awad locks integers — UI shows Coming soon.
// Product billing SKUs stay on /pricing and are not mapped into this catalog.

import { walletCosmeticBuyUrl } from "./wallet.js";

export const CUSTOMIZE_OPTION_KEYS = Object.freeze([
  "skin",
  "hairStyle",
  "hairColor",
  "eyes",
  "outfit",
  "office",
]);

export const CUSTOMIZE_OPTIONS = Object.freeze([
  Object.freeze({ key: "skin", label: "Skin" }),
  Object.freeze({ key: "hairStyle", label: "Hair style" }),
  Object.freeze({ key: "hairColor", label: "Hair color" }),
  Object.freeze({ key: "eyes", label: "Eyes" }),
  Object.freeze({ key: "outfit", label: "Outfit" }),
  Object.freeze({ key: "office", label: "Office" }),
]);

export const EQUIP_STUB_NOTE = "Equip when Wallet entitlement read ships";

export const COSMETIC_PRICE_IXIS = null;

export const COSMETIC_CATEGORY_ORDER = Object.freeze([
  "outfit",
  "theme",
  "template",
  "office",
]);

export const COSMETIC_CATEGORY_LABELS = Object.freeze({
  outfit: "Outfits",
  theme: "Themes",
  template: "Templates",
  office: "Offices",
});

function cosmetic(unlockAssetId, label, essential = false) {
  return Object.freeze({
    unlockAssetId,
    label,
    essential,
    priceIxis: COSMETIC_PRICE_IXIS,
  });
}

export const CIXY_COSMETIC_CATALOG = Object.freeze({
  outfit: Object.freeze([
    cosmetic("cixy.cosmetic.outfit.starter", "Starter", true),
    cosmetic("cixy.cosmetic.outfit.executive", "Executive"),
    cosmetic("cixy.cosmetic.outfit.street", "Street"),
    cosmetic("cixy.cosmetic.outfit.formal", "Formal"),
  ]),
  theme: Object.freeze([
    cosmetic("cixy.cosmetic.theme.midnight", "Midnight"),
    cosmetic("cixy.cosmetic.theme.dawn", "Dawn"),
    cosmetic("cixy.cosmetic.theme.neon", "Neon"),
    cosmetic("cixy.cosmetic.theme.paper", "Paper", true),
  ]),
  template: Object.freeze([
    cosmetic("cixy.cosmetic.template.brief", "Brief", true),
    cosmetic("cixy.cosmetic.template.standup", "Standup"),
    cosmetic("cixy.cosmetic.template.client", "Client"),
    cosmetic("cixy.cosmetic.template.ops", "Ops"),
  ]),
  office: Object.freeze([
    cosmetic("cixy.cosmetic.office.desk", "Desk", true),
    cosmetic("cixy.cosmetic.office.warroom", "War Room"),
    cosmetic("cixy.cosmetic.office.lounge", "Lounge"),
    cosmetic("cixy.cosmetic.office.studio", "Studio"),
  ]),
});

export function allCosmeticItems() {
  return COSMETIC_CATEGORY_ORDER.flatMap((category) =>
    CIXY_COSMETIC_CATALOG[category].map((item) =>
      Object.freeze({ ...item, category })
    )
  );
}

export const ALL_UNLOCK_ASSET_IDS = Object.freeze(
  allCosmeticItems().map((item) => item.unlockAssetId)
);

export const ESSENTIAL_UNLOCK_ASSET_IDS = Object.freeze(
  allCosmeticItems()
    .filter((item) => item.essential)
    .map((item) => item.unlockAssetId)
);

export function wardrobeItemState(item) {
  const owned = item.essential === true;
  return Object.freeze({
    unlockAssetId: item.unlockAssetId,
    label: item.label,
    category: item.category,
    owned,
    ownershipLabel: owned ? "Essentials · always owned" : "Unowned",
    priceIxis: COSMETIC_PRICE_IXIS,
    priceLabel: owned ? null : "Coming soon",
    buyHref: owned ? null : walletCosmeticBuyUrl(item.unlockAssetId),
    equipEnabled: false,
    equipNote: EQUIP_STUB_NOTE,
  });
}

export function wardrobeSections() {
  return COSMETIC_CATEGORY_ORDER.map((category) =>
    Object.freeze({
      category,
      label: COSMETIC_CATEGORY_LABELS[category],
      items: Object.freeze(
        CIXY_COSMETIC_CATALOG[category].map((item) =>
          wardrobeItemState({ ...item, category })
        )
      ),
    })
  );
}
