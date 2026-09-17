const html = await (await fetch("https://launchixis.vercel.app", { cache: "no-store" })).text();
const need = [
  "https://launchixis.vercel.app",
  "https://apixis-dev-1iqh-313aidaroos-projects.vercel.app",
  "https://socixis-313aidaroos-projects.vercel.app",
  "https://awadbot.vercel.app",
  "https://awad-command.vercel.app",
  "https://personalcontentbot.vercel.app",
  "https://contraxis-dev.vercel.app",
  "https://halaxis.vercel.app",
  "https://lyrixis.vercel.app",
  "https://qahwahworld.vercel.app",
  "https://rawixis.vercel.app",
  "https://recovra-three.vercel.app",
];
const missing = need.filter((u) => !html.includes(`href="${u}"`));
const dns = ["href=\"https://apixis.dev\"", "href=\"https://socixis.dev\""].filter((s) =>
  html.includes(s)
);
console.log("vercel_hrefs", need.length - missing.length, "/", need.length);
if (missing.length) {
  console.error("missing", missing.join(", "));
  process.exit(1);
}
if (dns.length) {
  console.error("custom_dns_hrefs_still_present");
  process.exit(1);
}
const nolive = (html.match(/No live site/g) || []).length;
console.log("nolive", nolive);
if (nolive < 1) {
  console.error("geoxis_should_have_nolive");
  process.exit(1);
}
console.log("ok");
