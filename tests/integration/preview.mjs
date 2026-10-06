// Local test fixture only. No production application imports this file.
import { fixtureServer } from "./fixture.mjs";
import { spawn } from "node:child_process";
const fixture = await fixtureServer();
fixture.state.previewUrl = "http://127.0.0.1:3199";
const proc = spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","3199"],{stdio:"inherit",env:{...process.env,NEXT_TELEMETRY_DISABLED:"1",SUPABASE_URL:fixture.url,SUPABASE_ANON_KEY:"fixture-anon",SUPABASE_SERVICE_ROLE_KEY:"fixture-service",APIXIS_WALLET_API_URL:fixture.url,WALLET_API_KEY:"fixture-wallet-key-long-enough",APP_URL:fixture.state.previewUrl}});
console.log(`Customer preview: ${fixture.url}/test-sign-in?user=alice`);
console.log(`Admin preview: ${fixture.url}/test-sign-in?user=owner`);
process.on("SIGTERM",()=>{proc.kill();fixture.server.close();});
process.on("SIGINT",()=>{proc.kill();fixture.server.close();});
