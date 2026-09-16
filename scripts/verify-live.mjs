const base = "https://launchixis.vercel.app";

async function main() {
  const home = await fetch(base, { cache: "no-store" });
  const html = await home.text();
  console.log("home", home.status, html.includes("Launch one company") ? "board_html" : "unexpected_html");

  const get1 = await fetch(base + "/api/launches", { cache: "no-store" });
  const d1 = await get1.json();
  if (!get1.ok) {
    console.error("get_failed", get1.status, d1);
    process.exit(1);
  }
  const launches = d1.launches || [];
  console.log("count", launches.length);
  console.log("names", launches.map((l) => l.slug).join(","));
  const board = launches.find((l) => l.slug === "launchixis");
  if (!board) {
    console.error("missing_launchixis_row");
    process.exit(1);
  }
  console.log("launchixis_status", board.status);

  const chrome = (board.items || []).find((i) => i.id === "chrome");
  const nextDone = !chrome?.done;
  const patch = await fetch(base + "/api/launches", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: board.id,
      toggle: { id: "chrome", done: nextDone },
    }),
  });
  const d2 = await patch.json();
  if (!patch.ok) {
    console.error("patch_failed", patch.status, d2);
    process.exit(1);
  }
  const after = (d2.launch.items || []).find((i) => i.id === "chrome");
  console.log("toggled_chrome", after?.done);

  const get2 = await fetch(base + "/api/launches", { cache: "no-store" });
  const d3 = await get2.json();
  const again = (d3.launches || []).find((l) => l.slug === "launchixis");
  const persisted = (again.items || []).find((i) => i.id === "chrome");
  console.log("persisted_chrome", persisted?.done);
  if (Boolean(persisted?.done) !== Boolean(nextDone)) {
    console.error("persist_mismatch");
    process.exit(1);
  }

  // restore chrome to true for live site (family chrome is on the board)
  await fetch(base + "/api/launches", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: board.id,
      toggle: { id: "chrome", done: true },
      domain: "launchixis.vercel.app",
    }),
  });
  const usable = await fetch(base + "/api/launches", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: board.id,
      toggle: { id: "usable_site", done: true },
      items: undefined,
    }),
  });
  // also mark vercel done
  await fetch(base + "/api/launches", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: board.id,
      toggle: { id: "vercel", done: true },
    }),
  });
  console.log("marked_live_steps");
  console.log("ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
