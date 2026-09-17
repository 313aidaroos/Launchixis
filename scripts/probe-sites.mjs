const urls = {
  launchixis: "https://launchixis.vercel.app",
  apixis: "https://apixis.dev",
  socixis: "https://socixis.dev",
  awadbot: "https://awadbot.vercel.app",
  "awad-command": "https://awad-command.vercel.app",
  contraxis: "https://contraxis-dev.vercel.app",
  geoxis: "https://geoxis.vercel.app",
  contentbot: "https://personalcontentbot.vercel.app",
  halaxis: "https://halaxis.vercel.app",
  lyrixis: "https://lyrixis.vercel.app",
  qahwahworld: "https://qahwahworld.vercel.app",
  rawixis: "https://rawixis.vercel.app",
  recovra: "https://recovra-three.vercel.app",
};

const rows = await Promise.all(
  Object.entries(urls).map(async ([slug, url]) => {
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      return { slug, url, status: res.status, ok: res.ok };
    } catch (e) {
      return { slug, url, status: 0, ok: false, err: e.message };
    }
  })
);
for (const r of rows) {
  console.log(r.slug, r.status, r.ok ? "live" : "down");
}
