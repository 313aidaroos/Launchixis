import { db, ensureSeed } from "../lib/db.js";
await ensureSeed(db());
console.log("Family seed checked. Existing records were preserved.");
