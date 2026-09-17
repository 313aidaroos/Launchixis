const html = await (await fetch("https://launchixis.vercel.app", { cache: "no-store" })).text();
const need = [
  "https://launchixis.vercel.app",
  "https://apixis.dev",
  "https://socixis.dev",
  "https://awadbot.vercel.app",
  "https://awad-command.vercel.app",
  "https://contraxis-dev.vercel.app",
  "https://halaxis.vercel.app",
  "https://lyrixis.vercel.app",
  "https://qahwahworld.vercel.app",
  "https://rawixis.vercel.app",
  "https://recovra-three.vercel.app",
];
const missing = need.filter((u) => !html.includes(`href="${u}"`));
console.log("hrefs", need.length - missing.length, "/", need.length);
if (missing.length) {
  console.error("missing", missing.join(", "));
  process.exit(1);
}
if (!html.includes("No live site")) {
  console.error("expected_nolive_for_geoxis_or_contentbot");
  process.exit(1);
}
console.log("ok");
