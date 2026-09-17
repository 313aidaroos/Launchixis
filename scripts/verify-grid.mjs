const url = "https://launchixis.vercel.app";
const names = [
  "Launchixis",
  "Apixis",
  "Socixis",
  "AwadBot",
  "Awad Command",
  "PersonalContentBot",
  "Contraxis",
  "Geoxis",
  "Halaxis",
  "Lyrixis",
  "Qahwahworld",
  "Rawixis",
  "Recovra",
];

const res = await fetch(url, { cache: "no-store" });
const html = await res.text();
console.log("home", res.status);
const missing = names.filter((n) => !html.includes(n));
console.log("found", names.length - missing.length, "/", names.length);
if (missing.length) {
  console.error("missing", missing.join(", "));
  process.exit(1);
}
if (!html.includes("13 companies") && !html.includes("All companies")) {
  console.error("missing_overview_copy");
  process.exit(1);
}
console.log("ok");
