// Deep link into Apixis Wallet. Sister sites already use ?tab=redeem&product=
// on this host; buy uses the same query shape. Cash credit stays on Wallet.

export const WALLET_HOST = "https://apixis-wallet.vercel.app";
export const LAUNCHIXIS_HOST = "https://launchixis.vercel.app";
export const WALLET_ORIGIN_SLUG = "launchixis";
export const WALLET_PRODUCT = "launchixis";

const RETURN_URLS = {
  "/": `${LAUNCHIXIS_HOST}/`,
  "/pricing": `${LAUNCHIXIS_HOST}/pricing`,
};

export function launchixisReturnUrl(returnPath = "/pricing") {
  return RETURN_URLS[returnPath] || RETURN_URLS["/pricing"];
}

export function walletBuyUrl(returnPath = "/pricing", options = {}) {
  const params = new URLSearchParams();
  params.set("tab", "buy");
  params.set("origin", WALLET_ORIGIN_SLUG);
  if (options.product) params.set("product", options.product);
  if (options.sku) params.set("sku", options.sku);
  params.set("return_url", launchixisReturnUrl(returnPath));
  return `${WALLET_HOST}?${params.toString()}`;
}

// Unowned Cixy cosmetics. Wallet owns quote → reserve → grant → capture.
export function walletCosmeticBuyUrl(sku, returnPath = "/") {
  if (typeof sku !== "string" || sku.trim() === "") {
    throw new TypeError("cosmetic sku required");
  }
  return walletBuyUrl(returnPath, {
    product: WALLET_PRODUCT,
    sku,
  });
}

export function walletHomeUrl(returnPath = "/pricing") {
  const params = new URLSearchParams({
    origin: WALLET_ORIGIN_SLUG,
    return_url: launchixisReturnUrl(returnPath),
  });
  return `${WALLET_HOST}?${params.toString()}`;
}
