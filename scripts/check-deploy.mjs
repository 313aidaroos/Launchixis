const urls = [
  "https://launchixis.vercel.app",
  "https://launchixis-32ddu194a-313aidaroos-projects.vercel.app",
];
for (const url of urls) {
  const res = await fetch(url, { cache: "no-store" });
  const html = await res.text();
  const names = [...html.matchAll(/class="name">([^<]+)/g)].map((m) => m[1]);
  console.log(
    url.replace("https://", ""),
    res.status,
    "cards",
    names.length,
    "nursery",
    names.includes("Nursery Toons"),
    "cache",
    res.headers.get("x-vercel-cache") || res.headers.get("cache-control")
  );
}
const api = await fetch("https://launchixis.vercel.app/api/launches", {
  cache: "no-store",
});
const data = await api.json();
console.log(
  "api",
  (data.launches || []).length,
  (data.launches || []).some((l) => l.slug === "nurserytoons")
);
