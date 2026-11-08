import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {graderCases} from '@/lib/grader-cases';
import {gradeInSandbox} from '@/lib/sandbox-grader';
export const maxDuration=60;
export async function POST(request:Request){
 const authUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,authKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!authUrl||!authKey)return NextResponse.json({error:'Cloud authentication must be configured before remote execution.'},{status:503});
 const token=request.headers.get('authorization')?.replace(/^Bearer /,'');if(!token)return NextResponse.json({error:'Sign in to run tests in an isolated microVM. Your device drafts are preserved.'},{status:401});
 const db=createClient(authUrl,authKey,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
 const {data:{user},error:authError}=await db.auth.getUser(token);if(authError||!user)return NextResponse.json({error:'Your session expired. Sign in again before running tests.'},{status:401});
 let raw='';try{const reader=request.body?.getReader();if(!reader)throw Error('Missing request body');const parts:Uint8Array[]=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>100000){await reader.cancel();return NextResponse.json({error:'Source exceeds the 100 KB request limit.'},{status:413})}parts.push(value)}raw=Buffer.concat(parts).toString('utf8')}catch{return NextResponse.json({error:'Invalid request body.'},{status:400})}
 let body:{exerciseId:string;source:string;language:string;engine?:string};try{body=JSON.parse(raw)}catch{return NextResponse.json({error:'Invalid JSON.'},{status:400})}
 if(!body||typeof body!=='object')return NextResponse.json({error:'Invalid request object.'},{status:400});
 const spec=typeof body.exerciseId==='string'&&Object.hasOwn(graderCases,body.exerciseId)?graderCases[body.exerciseId]:null;if(!spec||typeof body.source!=='string'||!body.source.trim()||!['iverilog','verilator','cocotb',undefined].includes(body.engine))return NextResponse.json({error:'This exercise has no registered executable contract, or the source/engine is invalid. Use Save evidence for design reviews.'},{status:400});
 if(body.engine==='cocotb'&&body.exerciseId!=='mux2')return NextResponse.json({error:'Cocotb currently supports the mux2 contract.'},{status:400});
 if((spec.language==='python'?body.language!=='python':!['verilog','systemverilog'].includes(body.language)))return NextResponse.json({error:'Language does not match the exercise contract.'},{status:400});
 if(process.env.RUNNER_PROVIDER!=='vercel'||!process.env.RUNNER_SNAPSHOT_ID)return NextResponse.json({error:'The isolated toolchain is not ready. Your source can still be saved or downloaded.'},{status:503});
 const reservation=await db.rpc('reserve_simulation',{p_exercise:body.exerciseId});if(reservation.error)return NextResponse.json({error:reservation.error.message},{status:429});
 try{const result=await gradeInSandbox(body.exerciseId,body.source,body.engine==='cocotb'?'cocotb':body.engine==='verilator'?'verilator':'iverilog');console.info('siliconpath.simulation.completed',{runId:reservation.data,exerciseId:body.exerciseId,passed:result.passed});return NextResponse.json({...result,runId:reservation.data})}catch(error){console.error('siliconpath.simulation.error',{runId:reservation.data,exerciseId:body.exerciseId,message:error instanceof Error?error.message:'Unknown sandbox error'});return NextResponse.json({error:'The isolated simulation could not finish. No assessment result was assigned. Retry after 45 seconds or save your evidence.'},{status:502})}
}
export async function GET(request:Request){const id=new URL(request.url).searchParams.get('exercise');if(id){const spec=Object.hasOwn(graderCases,id)?graderCases[id]:null;return spec?NextResponse.json({language:spec.language,source:spec.testbench,tests:spec.tests}):NextResponse.json({error:'No executable contract for this exercise.'},{status:404})}return NextResponse.json({available:process.env.RUNNER_PROVIDER==='vercel'&&!!process.env.RUNNER_SNAPSHOT_ID,authenticationRequired:true,engines:['iverilog','verilator','cocotb','python'],exercises:Object.keys(graderCases),limits:{requestBytes:100000,perUserPerDay:20,cooldownSeconds:45},isolation:'One network-disabled microVM per evaluation; fixed server-owned tests.'})}
