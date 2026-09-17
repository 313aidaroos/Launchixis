const api = await fetch("https://launchixis.vercel.app/api/launches?x=1", {
  cache: "no-store",
});
const data = await api.json();
const n = (data.launches || []).find((l) => l.slug === "nurserytoons");
console.log("nursery_row", JSON.stringify(n, null, 2));
console.log("total", (data.launches || []).length);

for (const url of [
  "https://launchixis.vercel.app/?v=nursery",
  "https://launchixis-m8s0fmvqo-313aidaroos-projects.vercel.app/?v=nursery",
]) {
  const res = await fetch(url, { cache: "no-store" });
  const html = await res.text();
  const names = [...html.matchAll(/class="name">([^<]+)/g)].map((m) => m[1]);
  console.log(url.split("//")[1].slice(0, 40), res.status, names.length, names.includes("Nursery Toons"), res.headers.get("x-vercel-cache"));
}
