import type {Track} from './types';
export type ReadingState={section:string;progress:number;updated:string;read:boolean;bookmark:boolean;note:string};
export type PracticeEvidence={checks:string[];selfVerified:boolean;sourceUrl:string;repository:string;log:string;notes:string;mistakes:string;lessons:string;documentIds:string[];updated:string};
export type PersonalDocument={id:string;name:string;source:string;subject:string;added:string;path:string;mime:string;size:number};
export type LearningData={readings:Record<string,ReadingState>;bookmarks:string[];practice:Record<string,PracticeEvidence>;documents:PersonalDocument[];lastUnit?:string};
export type Resource={id:string;title:string;organization:string;section:string;type:'Course'|'Documentation'|'Exercise'|'Specification'|'Article';level:'Beginner'|'Intermediate'|'Advanced';minutes:number;url:string;description:string;topics:string[];checked:string};
export type StudyUnit={id:string;parentId:string;title:string;track:Track;minutes:number;prerequisites:string[];objectives:string[];explanation:string;example:string;code?:string;language?:string;pitfall:string;task:string;vi:string;resourceIds:string[];exerciseIds:string[];diagram?:'fsm'|'logic'|'pipeline'|'verification'|'timing';formula?:string;table?:{headers:string[];rows:string[][]}};
