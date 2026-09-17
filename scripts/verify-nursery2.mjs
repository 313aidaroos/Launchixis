const urls = [
  "https://launchixis.vercel.app",
  "https://launchixis-m8s0fmvqo-313aidaroos-projects.vercel.app",
];
for (const url of urls) {
  const res = await fetch(url, { cache: "no-store", headers: { pragma: "no-cache" } });
  const html = await res.text();
  const names = [...html.matchAll(/class="name">([^<]+)/g)].map((m) => m[1]);
  console.log(
    url.split("//")[1],
    res.status,
    "cards",
    names.length,
    "nursery",
    names.includes("Nursery Toons"),
    "href",
    html.includes("https://nurserytoons.vercel.app"),
    "cache",
    res.headers.get("x-vercel-cache")
  );
  if (!names.includes("Nursery Toons")) console.log(" names", names.join(", "));
}
