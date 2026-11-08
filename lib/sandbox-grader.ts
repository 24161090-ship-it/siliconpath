import {Sandbox} from '@vercel/sandbox';
import {createHash,randomBytes} from 'node:crypto';
import {graderCases} from './grader-cases';
import toolchain from './toolchain.generated.json';
import {cocotbHarness,cocotbTest} from './cocotb-contract';

export async function gradeInSandbox(exerciseId:string,source:string,engine:'iverilog'|'verilator'|'cocotb'='iverilog'){
 const spec=graderCases[exerciseId];if(!spec)throw new Error('This exercise uses evidence review; no executable test contract is registered.');
 const snapshotId=toolchain.snapshotId||process.env.RUNNER_SNAPSHOT_ID;if(!snapshotId)throw new Error('Toolchain snapshot is not configured.');
 const marker=randomBytes(16).toString('hex');
 const sandbox=await Sandbox.create({source:{type:'snapshot',snapshotId},networkPolicy:'deny-all',persistent:false,timeout:45000,resources:{vcpus:1}});
 try{
  const base='/vercel/sandbox';
  const sourceName=spec.language==='python'?'solution.py':'solution.sv';
  const fixtureName=spec.language==='python'?'grade.py':'tb.sv';
  await sandbox.writeFiles([{path:`${base}/${sourceName}`,content:Buffer.from(source)},{path:`${base}/${fixtureName}`,content:Buffer.from(spec.testbench.replaceAll('@@MARK@@',marker))}]);
  if(engine==='cocotb')await sandbox.writeFiles([{path:`${base}/cocotb_mux.py`,content:Buffer.from(cocotbTest)},{path:`${base}/cocotb_run.py`,content:Buffer.from(cocotbHarness.replaceAll('@@MARK@@',marker))}]);
  const script=spec.language==='python'?`timeout -k 1 10 python3 -I ${base}/grade.py > ${base}/run.log 2>&1`:
   engine==='cocotb'?`timeout -k 1 20 python3 ${base}/cocotb_run.py > ${base}/run.log 2>&1`:engine==='verilator'?`timeout -k 1 20 verilator --binary --timing --trace --trace-depth 3 --top-module tb -Wno-fatal --Mdir ${base}/obj ${base}/solution.sv ${base}/tb.sv > ${base}/compile.log 2>&1 && timeout -k 1 10 ${base}/obj/Vtb > ${base}/run.log 2>&1`:
   `timeout -k 1 10 iverilog -g2012 -s tb -o ${base}/simulation ${base}/solution.sv ${base}/tb.sv > ${base}/compile.log 2>&1 && timeout -k 1 10 vvp ${base}/simulation > ${base}/run.log 2>&1`;
  const command=await sandbox.runCommand({cmd:'bash',args:['-lc',`ulimit -f 2048; ulimit -u 128; ulimit -t 25; cd ${base}; ${script}`],cwd:base});
  const [compile,run,wave]=await Promise.all([sandbox.readFileToBuffer({path:`${base}/compile.log`}),sandbox.readFileToBuffer({path:`${base}/run.log`}),spec.language==='verilog'?sandbox.readFileToBuffer({path:`${base}/wave.vcd`}):Promise.resolve(null)]);
  const rawRun=run?.toString('utf8')??'';
  const passed=command.exitCode===0&&rawRun.includes(`SP_DONE:${marker}`);
  const output=[`${spec.language==='python'?'Python':engine==='cocotb'?'Cocotb + Icarus':engine==='verilator'?'Verilator':'Icarus Verilog'} · isolated microVM · exit ${command.exitCode}`,compile?.toString('utf8')??'',rawRun.replaceAll(`SP_DONE:${marker}`,passed?'All contract checks completed.':'')].filter(Boolean).join('\n').slice(0,50000);
  return {passed,output,engine:spec.language==='python'?'Python (Vercel Sandbox)':`${engine==='cocotb'?'Cocotb + Icarus':engine==='verilator'?'Verilator':'Icarus Verilog'} (Vercel Sandbox)`,sourceHash:createHash('sha256').update(source).digest('hex'),testResults:spec.tests.map(name=>({name,passed})),waveform:wave&&wave.byteLength<=300000?wave.toString('utf8'):undefined};
 }finally{await sandbox.stop()}
}
