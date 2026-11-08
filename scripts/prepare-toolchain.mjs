import {Sandbox,Snapshot} from '@vercel/sandbox';
import {writeFile} from 'node:fs/promises';
let snapshotId=process.env.RUNNER_SNAPSHOT_ID??'';
if(process.env.VERCEL&&snapshotId){
 const current=await Snapshot.get({snapshotId});
 if(current.expiresAt){
  const copy=await Sandbox.create({source:{type:'snapshot',snapshotId},networkPolicy:'deny-all',persistent:false,timeout:30000,resources:{vcpus:1}});
  try{const stable=await copy.snapshot({expiration:0});snapshotId=stable.snapshotId}catch(error){await copy.stop();throw error}
  console.log('Prepared a non-expiring, network-disabled toolchain snapshot.');
 }
}
await writeFile(new URL('../lib/toolchain.generated.json',import.meta.url),JSON.stringify({snapshotId}));
