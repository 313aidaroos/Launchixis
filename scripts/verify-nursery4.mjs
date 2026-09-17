const urls = [
  "https://launchixis.vercel.app",
  "https://launchixis-hw2hji98s-313aidaroos-projects.vercel.app",
];
for (const url of urls) {
  const res = await fetch(url + "?n=" + Date.now(), { cache: "no-store" });
  const html = await res.text();
  const names = [...html.matchAll(/class="name">([^<]+)/g)].map((m) => m[1]);
  console.log(
    url.split("//")[1].slice(0, 48),
    res.status,
    "cards",
    names.length,
    "nursery",
    names.includes("Nursery Toons"),
    "href",
    html.includes("nurserytoons.vercel.app"),
    "cache",
    res.headers.get("x-vercel-cache")
  );
  if (names.includes("Nursery Toons") || names.length) {
    console.log(" ", names.join(" | "));
  }
}
