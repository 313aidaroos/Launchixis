import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { fixtureServer, sessionCookie, users } from './fixture.mjs';

test('production routes: private workspaces, purchase retries, download, conflicts, support, redirects', {timeout:90000},async()=>{
 const fixture=await fixtureServer(); const port=3198, base=`http://127.0.0.1:${port}`;
 const proc=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port)],{env:{...process.env,NEXT_TELEMETRY_DISABLED:'1',SUPABASE_URL:fixture.url,SUPABASE_ANON_KEY:'fixture-anon',SUPABASE_SERVICE_ROLE_KEY:'fixture-service',APIXIS_WALLET_API_URL:fixture.url,WALLET_API_KEY:'fixture-wallet-key-long-enough',APP_URL:base}});
 let logs='';proc.stdout.on('data',d=>logs+=d);proc.stderr.on('data',d=>logs+=d);
 const call=async(path,user,method='GET',body)=>{const res=await fetch(base+path,{method,redirect:'manual',headers:{...(user?{cookie:sessionCookie(user)}:{}),...(body?{'content-type':'application/json',origin:base}:{})},...(body?{body:JSON.stringify(body)}:{})});let text=await res.text();let data;try{data=JSON.parse(text);}catch{}return {status:res.status,headers:res.headers,data,text};};
 try {
   let ready=false;
   for(let i=0;i<100;i++){try{await fetch(base);ready=true;break;}catch{await new Promise(r=>setTimeout(r,200));}}
   assert.ok(ready,logs);
   assert.equal((await call('/api/launches')).status,401);
   assert.equal((await call('/api/checklist')).status,401);
   const home=await call('/');assert.equal(home.status,200);assert.ok(!home.text.includes('CONFIDENTIAL_INTERNAL_NOTE'));assert.ok(home.text.includes('Your launch'));
   const owner=await call('/api/launches',users.owner);assert.equal(owner.status,200,owner.text);assert.equal(owner.data.launches.length,1);
   const empty=await call('/api/launches',users.alice);assert.equal(empty.status,200,empty.text);assert.equal(empty.data.launches.length,0);
   const created=await call('/api/launches',users.alice,'POST',{name:'Alice company',one_liner:'A real plan',owner_id:users.bob.id});assert.equal(created.status,201,created.text);
   let launch=created.data.launch;assert.equal(launch.owner_id,users.alice.id);
   assert.equal((await call('/api/launches',users.alice,'POST',{name:'Second workspace'})).status,409);
   assert.equal((await call('/api/launches',users.bob)).data.launches.length,0);
   assert.equal((await call('/api/launches',users.bob,'PATCH',{id:launch.id,version:launch.version,notes:'steal'})).status,404);
   assert.equal((await call('/api/launches',users.alice,'PATCH',{id:launch.id,version:launch.version,notes:'locked'})).status,402);
   assert.equal((await call('/api/checklist',users.alice)).status,402);
   fixture.state.failCaptureResponse=true;
   const attemptId=randomUUID(); const purchase=await call('/api/redeem',users.alice,'POST',{productKey:'launchixis.template.checklist',attemptId});assert.equal(purchase.status,200,purchase.text);assert.equal(fixture.state.charges,1);
   assert.equal((await call('/api/redeem',users.alice,'POST',{productKey:'launchixis.template.checklist',attemptId:randomUUID()})).status,200);assert.equal(fixture.state.charges,1);
   const guide=await call('/api/checklist',users.alice);assert.equal(guide.status,200,guide.text);assert.ok(guide.text.includes('## 13.'));assert.match(guide.headers.get('content-disposition'),/attachment/);
   const saved=await call('/api/launches',users.alice,'PATCH',{id:launch.id,version:launch.version,notes:'Customer secret'});assert.equal(saved.status,200,saved.text);
   assert.equal((await call('/api/launches',users.alice,'PATCH',{id:launch.id,version:launch.version,notes:'stale'})).status,409);
   assert.equal((await call('/api/launches',users.alice)).data.launches[0].notes,'Customer secret');
   assert.equal((await call('/api/launches',users.bob)).data.launches.length,0);
   const callback=await call('/auth/callback?next=%2F%2Fevil.example');assert.equal(callback.status,307);assert.equal(callback.headers.get('location'),'/login?error=login_expired');
   const ticket=await call('/api/support',null,'POST',{email:'alice@example.test',subject:'Help',message:'Please help with my launch.'});assert.equal(ticket.status,201,ticket.text);
   assert.equal((await call('/api/support',users.alice)).status,403);
   const queue=await call('/api/support',users.owner);assert.equal(queue.status,200);assert.equal(queue.data.tickets.length,1);
   assert.equal((await call('/api/support',users.owner,'PATCH',{id:queue.data.tickets[0].id,updated_at:queue.data.tickets[0].updated_at,status:'done'})).status,200);
   assert.equal((await call('/api/support',users.owner)).data.tickets.length,0);
   assert.equal((await call('/api/launches',users.owner)).data.launches.length,2);
 } finally { proc.kill('SIGTERM');await once(proc,'exit');await new Promise(r=>fixture.server.close(r)); }
});
