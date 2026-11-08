import type {LearningData,ReadingState,PracticeEvidence} from './learning-types';
import type {WorkspaceData} from './types';
export const emptyLearning=():LearningData=>({readings:{},bookmarks:[],practice:{},documents:[]});
export const blankReading=():ReadingState=>({section:'introduction',progress:0,updated:'',read:false,bookmark:false,note:''});
export const blankEvidence=():PracticeEvidence=>({checks:[],selfVerified:false,sourceUrl:'',repository:'',log:'',notes:'',mistakes:'',lessons:'',documentIds:[],updated:''});
export const completionChecks=['Understood the problem','Completed the design','Implemented the solution','Created checks or a testbench','Verified expected behavior','Reviewed corner cases','Documented the results'];
export function practiceStatus(d:WorkspaceData,id:string){
 const e=d.learning?.practice[id];
 const latest=d.submissions.filter(s=>s.exerciseId===id).at(-1);
 if(latest?.status==='Passed')return latest.engine==='Knowledge checkpoint'||latest.score!==undefined?'Passed – Knowledge Check':'Passed – Automated Test';
 if(latest?.status==='Failed'&&(!e?.updated||Date.parse(latest.date)>Date.parse(e.updated)))return 'Needs Review';
 if(e?.selfVerified&&completionChecks.every(c=>e.checks.includes(c))&&!!(e.log.trim()||safeResourceUrl(e.sourceUrl)||safeResourceUrl(e.repository)||e.documentIds.length))return 'Completed – Self Verified';
 if(latest?.status==='Needs review')return 'Needs Review';
 if(e||d.drafts[id]||latest)return 'In Progress';return 'Not Started';
}
export function validLearning(raw:unknown):raw is LearningData{
 const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
 const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(x=>typeof x==='string');
 if(!record(raw)||!record(raw.readings)||!record(raw.practice)||!strings(raw.bookmarks)||!Array.isArray(raw.documents)||(raw.lastUnit!==undefined&&typeof raw.lastUnit!=='string'))return false;
 return Object.values(raw.readings).every(r=>record(r)&&typeof r.section==='string'&&typeof r.progress==='number'&&Number.isFinite(r.progress)&&r.progress>=0&&r.progress<=100&&typeof r.updated==='string'&&typeof r.read==='boolean'&&typeof r.bookmark==='boolean'&&typeof r.note==='string')
 &&Object.values(raw.practice).every(e=>record(e)&&strings(e.checks)&&typeof e.selfVerified==='boolean'&&['sourceUrl','repository','log','notes','mistakes','lessons','updated'].every(k=>typeof e[k]==='string')&&strings(e.documentIds))
 &&raw.documents.every(d=>record(d)&&['id','name','source','subject','added','path','mime'].every(k=>typeof d[k]==='string')&&typeof d.size==='number'&&d.size>0&&d.size<=10000000&&['application/pdf','image/png','image/jpeg','text/plain'].includes(String(d.mime)));
}
export function safeResourceUrl(raw:string){try{const u=new URL(raw);return u.protocol==='https:'?u.href:null}catch{return null}}
