import test from 'node:test';
import assert from 'node:assert/strict';
import {initialData,validateBackup} from '../lib/model';
import {emptyLearning,blankReading,blankEvidence,toggleUnitRead,forgetDocument,ownedDocumentPath} from '../lib/learning-state';
import {removeOwnedDocument} from '../lib/document-storage';
import {mergeWorkspaces} from '../lib/workspace-merge';
import {studyUnits} from '../lib/study-units';
import {resources} from '../lib/resources';
import {exercises} from '../lib/content';

test('parent read marker follows siblings in both directions and preserves notes',()=>{
 let data=initialData();const unit=studyUnits.find(u=>u.id==='assertions')!,siblings=studyUnits.filter(u=>u.parentId===unit.parentId);
 data.readLessons=['digital'];data.learning=emptyLearning();data.learning.readings[unit.id]={...blankReading(),bookmark:true,note:'Keep this derivation'};
 for(const sibling of siblings)data=toggleUnitRead(data,sibling,studyUnits);
 assert.ok(data.readLessons.includes(unit.parentId));
 data=toggleUnitRead(data,unit,studyUnits);assert.ok(!data.readLessons.includes(unit.parentId));assert.ok(data.readLessons.includes('digital'));
 assert.equal(data.learning!.readings[unit.id].note,'Keep this derivation');assert.equal(data.learning!.readings[unit.id].bookmark,true);
 data=toggleUnitRead(data,unit,studyUnits);assert.equal(data.readLessons.filter(id=>id===unit.parentId).length,1);
 const legacy={id:'module-custom',parentId:'custom'};data=toggleUnitRead(data,legacy,studyUnits);assert.ok(data.readLessons.includes('custom'));data=toggleUnitRead(data,legacy,studyUnits);assert.ok(!data.readLessons.includes('custom'));
});
test('partial siblings clear a stale legacy parent instead of falsely completing it',()=>{
 const unit=studyUnits.find(u=>u.id==='systemverilog-oop')!,data=initialData();data.readLessons=[unit.parentId];
 const result=toggleUnitRead(data,unit,studyUnits);assert.equal(result.learning!.readings[unit.id].read,true);assert.ok(!result.readLessons.includes(unit.parentId));
});
test('deleted documents and their evidence links cannot reappear through old backups',()=>{
 const data=initialData();data.learning=emptyLearning();const doc={id:'file',name:'Trace',source:'Own',subject:'FIFO',added:'2026-11-08',path:'owner/file.pdf',mime:'application/pdf',size:100};data.learning.documents=[doc];data.learning.practice.fifo={...blankEvidence(),selfVerified:true,documentIds:['file']};data.learning.practice.other={...blankEvidence(),selfVerified:true,log:'Keep separate evidence'};
 const removed=forgetDocument(data,'file');assert.equal(removed.learning!.documents.length,0);assert.equal(removed.learning!.practice.fifo.selfVerified,false);assert.deepEqual(removed.learning!.practice.fifo.documentIds,[]);assert.equal(removed.learning!.practice.other.selfVerified,true);assert.equal(data.learning.documents.length,1);
 assert.ok(validateBackup(removed));for(const merged of [mergeWorkspaces(removed,data),mergeWorkspaces(data,removed)]){assert.equal(merged.learning!.documents.length,0);assert.deepEqual(merged.learning!.practice.fifo.documentIds,[]);assert.equal(merged.learning!.practice.fifo.selfVerified,false)}
 assert.equal(validateBackup({...removed,learning:{...removed.learning,documentDeletions:{bad:'not-a-date'}}}),false);
});
test('Storage removal rejects wrong owners and silent RLS no-ops',async()=>{
 let calls=0;
 const fake=(user:{id:string}|null,names:string[],error:{message:string}|null=null)=>({
  auth:{getUser:async()=>({data:{user},error:null})},
  storage:{from:(bucket:string)=>{
   assert.equal(bucket,'learning-documents');
   return {remove:async(paths:string[])=>{
    calls++;assert.deepEqual(paths,['owner/file.pdf']);return {data:names.map(name=>({name})),error};
   }};
  }}
 });
 await assert.rejects(()=>removeOwnedDocument(fake(null,[]),'owner/file.pdf'),/Sign in/);await assert.rejects(()=>removeOwnedDocument(fake({id:'other'},[]),'owner/file.pdf'),/different account/);assert.equal(calls,0);
 for(const path of ['owner/../other','owner/file/extra','owner\\file','other/file.pdf'])assert.equal(ownedDocumentPath(path,'owner'),false);
 await assert.rejects(()=>removeOwnedDocument(fake({id:'owner'},[]),'owner/file.pdf'),/did not confirm/);
 await assert.rejects(()=>removeOwnedDocument(fake({id:'owner'},[],{message:'Network failed'}),'owner/file.pdf'),/Network failed/);
 await removeOwnedDocument(fake({id:'owner'},['owner/file.pdf']),'owner/file.pdf');assert.equal(calls,3);
});
test('24 guided units have distinct derivations, reasoning questions and resolved resources',()=>{
 const deep=studyUnits.filter(u=>u.depth);assert.equal(deep.length,24);
 for(const unit of deep){const depth=unit.depth!;assert.equal(depth.cases.length,2,unit.id);assert.equal(depth.questions.length,2,unit.id);assert.ok(depth.minutes>=45);for(const c of depth.cases){assert.ok(c.steps.length>=3,unit.id);assert.equal(new Set(c.steps).size,c.steps.length)}for(const q of depth.questions)assert.ok(q.prompt&&q.hint&&q.answer,unit.id);for(const id of depth.resources)assert.ok(resources.some(r=>r.id===id),id)}
 assert.equal(resources.length,52);assert.equal(exercises.length,94);
});
