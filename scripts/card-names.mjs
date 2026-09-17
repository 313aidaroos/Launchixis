const html = await (await fetch("https://launchixis.vercel.app", { cache: "no-store" })).text();
const names = [...html.matchAll(/class="name">([^<]+)/g)].map((m) => m[1]);
console.log("cards", names.length);
console.log(names.join(" | "));
console.log("href_nursery", html.includes("nurserytoons.vercel.app"));
