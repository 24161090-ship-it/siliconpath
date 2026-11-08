import {emptyLearning} from './learning-state';
import type {WorkspaceData} from './types';
/** Restoring JSON cannot restore a deleted Storage binary. Retain known deletion markers. */
export function restoreWorkspace(current:WorkspaceData,backup:WorkspaceData):WorkspaceData{
 const deleted={...backup.learning?.documentDeletions,...current.learning?.documentDeletions};
 if(!Object.keys(deleted).length)return backup;
 const l=backup.learning??emptyLearning();
 const practice=Object.fromEntries(Object.entries(l.practice).map(([id,e])=>{const documentIds=e.documentIds.filter(key=>!deleted[key]);return [id,documentIds.length===e.documentIds.length?e:{...e,documentIds,selfVerified:false}]}));
 return {...backup,learning:{...l,practice,documentDeletions:deleted,documents:l.documents.filter(doc=>!deleted[doc.id])}};
}
export function hasLearningData(d:WorkspaceData){return !!(d.profile.name||d.notes.length||d.projects.length||d.sessions.length||d.submissions.length||d.readLessons.length||d.applications.length||d.customLessons.length||d.customExercises.length||Object.keys(d.drafts).length||!!d.learning&&(Object.keys(d.learning.readings).length||d.learning.documents.length||d.learning.bookmarks.length||Object.keys(d.learning.practice).length)||d.tasks.some(t=>t.done||!t.id.startsWith('mission-')))}
/** Explicit user-triggered import. Existing cloud records win ID conflicts. */
export function mergeWorkspaces(current:WorkspaceData,incoming:WorkspaceData):WorkspaceData{
 const byId=<T extends {id:string}>(a:T[],b:T[])=>[...a,...b.filter(x=>!a.some(y=>y.id===x.id))];
 const a=current.learning??emptyLearning(),b=incoming.learning??emptyLearning();
 const documentDeletions={...b.documentDeletions,...a.documentDeletions};
 const practice=Object.fromEntries(Object.entries({...b.practice,...a.practice}).map(([id,e])=>{const documentIds=e.documentIds.filter(key=>!documentDeletions[key]);return [id,documentIds.length===e.documentIds.length?e:{...e,documentIds,selfVerified:false}]}));
 return {...current,learning:{readings:{...b.readings,...a.readings},practice,bookmarks:[...new Set([...a.bookmarks,...b.bookmarks])],documentDeletions,documents:byId(a.documents,b.documents).filter(doc=>!documentDeletions[doc.id]),lastUnit:a.lastUnit??b.lastUnit},profile:{...current.profile,name:current.profile.name||incoming.profile.name,email:current.profile.email||incoming.profile.email,education:current.profile.education||incoming.profile.education,skills:current.profile.skills||incoming.profile.skills},tasks:byId(current.tasks,incoming.tasks),notes:byId(current.notes,incoming.notes),submissions:byId(current.submissions,incoming.submissions),projects:byId(current.projects,incoming.projects),sessions:byId(current.sessions,incoming.sessions),applications:byId(current.applications,incoming.applications),customLessons:byId(current.customLessons,incoming.customLessons),customExercises:byId(current.customExercises,incoming.customExercises),readLessons:Array.from(new Set([...current.readLessons,...incoming.readLessons])),drafts:{...incoming.drafts,...current.drafts},interviews:{...incoming.interviews,...current.interviews},hiddenLessons:Array.from(new Set([...current.hiddenLessons,...incoming.hiddenLessons])),hiddenExercises:Array.from(new Set([...current.hiddenExercises,...incoming.hiddenExercises]))};
}
