'use client';
import {useState,useEffect,useCallback,useRef} from 'react';
import type {User} from '@supabase/supabase-js';
import type {WorkspaceData} from './types';
import {initialData,validateBackup,uid,today} from './model';
import {supabase} from './supabase';
import {hasLearningData,mergeWorkspaces} from './workspace-merge';
const guestKey='siliconpath:guest:v1';
export function useWorkspace(){
 const [data,setData]=useState<WorkspaceData>(initialData),[ready,setReady]=useState(false),[user,setUser]=useState<User|null>(null),[sync,setSync]=useState('Loading workspace…'),[error,setError]=useState(''),[deviceCopy,setDeviceCopy]=useState<WorkspaceData|null>(null);
 const key=useRef(guestKey),revision=useRef<number|null>(null),generation=useRef(0),dirty=useRef(false),changeNumber=useRef(0),cloudWritable=useRef(false),identity=useRef<string|undefined>(undefined),queue=useRef(Promise.resolve());
 useEffect(()=>{
  let live=true;
  async function load(next:User|null,force=false){
   const id=next?.id??'guest';if(!force&&identity.current===id)return;identity.current=id;
   const g=++generation.current;setReady(false);cloudWritable.current=false;key.current=`siliconpath:${id}:v1`;revision.current=null;dirty.current=false;setUser(next);setError('');
   let local=initialData();
   try{const raw=localStorage.getItem(key.current);if(raw){const parsed=JSON.parse(raw);if(validateBackup(parsed))local=parsed;else setError('A saved copy is invalid. Export or restore a valid backup before closing.')}if(next){const guest=localStorage.getItem(guestKey);if(guest){const parsed=JSON.parse(guest);setDeviceCopy(validateBackup(parsed)&&hasLearningData(parsed)?parsed:null)}}else setDeviceCopy(null)}catch{setError('Browser storage is unavailable. Export your work before closing.')}
   if(next&&supabase){
    const result=await supabase.from('workspaces').select('data,revision').eq('user_id',next.id).maybeSingle();
    if(!live||g!==generation.current)return;
    if(result.error){setError('Could not load cloud data. Local copy is retained; cloud writes are paused.');setSync('Cloud unavailable');setData(local);setReady(true);return}
    if(result.data){if(!validateBackup(result.data.data)){setError('Cloud workspace has an invalid format. Cloud writes are paused.');setSync('Sync paused');setData(local);setReady(true);return}local=result.data.data;revision.current=result.data.revision}
    cloudWritable.current=true;setSync('Cloud connected');
   }else setSync('Saved on this device');
   if(!live||g!==generation.current)return;setData(local);setReady(true);
  }
  void (async()=>{if(supabase){const {data:session,error}=await supabase.auth.getSession();if(error&&live)setError('Could not restore the account session. Device data remains available.');if(live)await load(session.session?.user??null)}else await load(null)})();
  const listener=supabase?.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT')setTimeout(()=>{if(live)void load(session?.user??null)},0)});
  return()=>{live=false;generation.current++;listener?.data.subscription.unsubscribe()};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  try{localStorage.setItem(key.current,JSON.stringify(data))}catch{setError('Could not save locally. Export a backup now; browser storage may be full.')}
  if(!user||!supabase||!cloudWritable.current||!dirty.current)return;
  setSync('Saving…');const g=generation.current,n=changeNumber.current;
  const timeout=setTimeout(()=>{queue.current=queue.current.then(async()=>{
   if(g!==generation.current||!cloudWritable.current||!supabase)return;
   const expected=revision.current;
   const result=expected===null?await supabase.from('workspaces').insert({user_id:user.id,data,revision:1}).select('revision').single():await supabase.from('workspaces').update({data,revision:expected+1,updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('revision',expected).select('revision').maybeSingle();
   if(g!==generation.current)return;
   if(result.error||!result.data){cloudWritable.current=false;setError('Cloud save failed or another device has changed this workspace. Export your local backup, then reload to reconcile. Your local copy is retained.');setSync('Sync paused');return}
   revision.current=result.data.revision;if(n===changeNumber.current){dirty.current=false;setSync('Synced to cloud')}
  }).catch(()=>{cloudWritable.current=false;setSync('Sync paused');setError('Could not reach cloud storage. Export a local backup before reloading.')})},700);
  return()=>clearTimeout(timeout);
 },[data,ready,user]);
 useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(user&&dirty.current){event.preventDefault();event.returnValue=''}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[user]);
 const update=useCallback((fn:(d:WorkspaceData)=>WorkspaceData)=>{dirty.current=true;changeNumber.current++;setData(fn)},[]);
 const replace=useCallback((next:WorkspaceData)=>{dirty.current=true;changeNumber.current++;setData(next)},[]);
 useEffect(()=>{if(!ready||!data.timer.endsAt)return;const end=data.timer.endsAt;const id=setInterval(()=>{if(Date.now()<end)return;update(d=>!d.timer.endsAt||d.timer.endsAt!==end?d:{...d,timer:{...d.timer,endsAt:null,remaining:0},sessions:[...d.sessions,{id:uid(),date:today(new Date(end)),minutes:25,topic:d.timer.topic||'Focus session'}]})},1000);return()=>clearInterval(id)},[ready,data.timer.endsAt,update]);
 const importDevice=useCallback(()=>{if(deviceCopy){update(d=>mergeWorkspaces(d,deviceCopy));setDeviceCopy(null)}},[deviceCopy,update]);
 return {data,update,replace,ready,user,sync,error,clearError:()=>setError(''),deviceCopy,importDevice};
}
