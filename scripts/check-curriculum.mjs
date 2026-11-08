// Local evidence only; never writes account progress or cloud assessment results.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),{graderCases:g}=require('../.test-build/lib/grader-cases.js');
const root=path.resolve(process.argv[2]??path.join(os.tmpdir(),'siliconpath-curriculum-qa'));
fs.mkdirSync(root,{recursive:true});const results=[],marker='curriculum-local-check';
function cmd(bin,args,cwd){return execFileSync(bin,args,{cwd,timeout:15000,encoding:'utf8',maxBuffer:200000,windowsHide:true,stdio:['ignore','pipe','pipe']});}
function record(group,id,fn){try{results.push({group,id,passed:true,evidence:fn()});console.log(`PASS ${group}: ${id}`)}catch(e){results.push({group,id,passed:false,error:String(e),stdout:e.stdout?.toString(),stderr:e.stderr?.toString()});console.log(`FAIL ${group}: ${id}: ${e.message}`)}}
function hdl(id,source,tb){const dir=path.join(root,id);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'solution.sv'),source);fs.writeFileSync(path.join(dir,'tb.sv'),tb);const compile=cmd(process.env.IVERILOG_BIN??'iverilog',['-g2012','-s','tb','-o',path.join(dir,'sim.vvp'),'solution.sv','tb.sv'],dir);const output=compile+cmd(process.env.VVP_BIN??'vvp',[path.join(dir,'sim.vvp')],dir);fs.writeFileSync(path.join(dir,'run.log'),output);return output;}
function py(id,source){const dir=path.join(root,id);fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,'check.py');fs.writeFileSync(file,source);const out=cmd(process.env.PYTHON_BIN??'python',['-I',file],dir);fs.writeFileSync(path.join(dir,'run.log'),out);return out;}
function contract(id,source,prefix='contract-'){const spec=g[id],dir=path.join(root,prefix+id);fs.mkdirSync(dir,{recursive:true});let out;
 if(spec.language==='verilog')out=hdl(prefix+id,source,spec.testbench.replaceAll('@@MARK@@',marker));
 else{const sol=path.join(dir,'solution.py');fs.writeFileSync(sol,source);out=py(prefix+id,spec.testbench.replaceAll('/vercel/sandbox/solution.py',sol.replaceAll('\\','/')).replaceAll('@@MARK@@',marker));}
 assert.ok(out.includes('SP_DONE:'+marker),'No completion marker');return out.trim();
}
for(const [id,spec] of Object.entries(g))record('executable contract',id,()=>({engine:spec.language==='verilog'?'Icarus Verilog':'Python',checks:spec.tests,log:contract(id,spec.reference)}));
const mutants={mux2:'module mux2(input a,b,sel,output y);assign y=sel?a:b;endmodule',latch:'module latch_bug(input en,a,output reg y);always @(*) if(en)y=a;endmodule',counter:'module counter #(parameter WIDTH=8)(input clk,rst,en,output reg [WIDTH-1:0] count);always @(posedge clk)if(rst)count<=0;else count<=count+1;endmodule',alu4:g.alu4.reference.replace('1:y=a-b','1:y=a+b'),'py-scoreboard':'def compare_transactions(expected,actual):\n    return []\n','py-coverage':'def covered_bins(samples,bins):\n    return set(bins)\n'};
for(const [id,source] of Object.entries(mutants))record('mutation rejected',id,()=>{let rejected=false;try{contract(id,source,'mutation-')}catch(e){rejected=/FATAL:|AssertionError/.test(String(e.stdout??'')+String(e.stderr??''));fs.writeFileSync(path.join(root,'mutation-'+id,'mutation-error.log'),String(e)+'\n'+(e.stdout??'')+'\n'+(e.stderr??''))}assert.ok(rejected,'Incorrect behavior escaped');return 'Intentionally wrong implementation rejected by executable contract';});
record('lesson review','number-systems',()=>{for(let w=1;w<=8;w++)for(let raw=0;raw<2**w;raw++){const value=raw>=2**(w-1)?raw-2**w:raw;assert.equal((value+2**w)%2**w,raw)}for(let a=0;a<256;a++)for(let b=0;b<256;b++){const sa=a<128?a:a-256,sb=b<128?b:b-256,r=(a+b)&255,sr=r<128?r:r-256;assert.equal(sa+sb!==sr,sa+sb< -128||sa+sb>127)}assert.equal(0xb6-256,-74);return 'All words at widths 1..8; 65,536 eight-bit signed addition pairs';});
record('lesson review','boolean-algebra',()=>{for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++){assert.equal(!!((a&&b)||(a&&!b)||(!a&&c)),!!(a||c));assert.equal([0,2,5,7].includes((a<<2)|(b<<1)|c),a===c)}return 'All 8 Boolean and 8 K-map rows';});
record('lesson review','truth-tables',()=>{const expected=[0,0,0,1,1,0,1,1];let i=0;for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let s=0;s<2;s++)assert.equal(s?b:a,expected[i++]);return '8 independent mux rows plus actual HDL contract';});
record('lesson review','parameterized-design',()=>{const widths=[1,3,4,5],decl=widths.map(w=>`wire [${w-1}:0] q${w};counter #(.WIDTH(${w})) c${w}(clk,rst,en,q${w});`).join('\n'),checks=widths.map(w=>`if(q${w} !== (expected % ${2**w})) $fatal(1,"WIDTH=${w}");`).join('\n');const tb=`module tb;reg clk=0,rst=1,en=0;always #5 clk=~clk;${decl}integer i,expected=0;initial begin for(i=0;i<100;i=i+1)begin @(negedge clk);rst=(i==0||i==60);en=(i%7!=2);@(posedge clk);if(rst)expected=0;else if(en)expected=expected+1;#1;${checks}end $display("COUNTER_REVIEW_OK 400 observations");$finish;end endmodule`;const out=hdl('review-counter',g.counter.reference,tb);assert.ok(out.includes('COUNTER_REVIEW_OK'));return out.trim();});
record('lesson review','finite-state-machines',()=>{const tb=`module tb;reg clk=0,rst=1,bit_in=0;wire detected;sequence_detector dut(clk,rst,bit_in,detected);always #5 clk=~clk;integer stream,i,history,count,expected,n=0;initial begin for(stream=0;stream<1024;stream=stream+1)begin @(negedge clk);rst=1;@(posedge clk);#1;history=0;count=0;for(i=9;i>=0;i=i-1)begin @(negedge clk);rst=0;bit_in=(stream>>i)&1;#1;expected=(count>=3&&((history*2+bit_in)%16)==11);if(detected!==expected[0])$fatal(1,"stream=%d bit=%d",stream,i);@(posedge clk);#1;history=(history*2+bit_in)%16;count=count+1;n=n+1;end end $display("FSM_REVIEW_OK %0d observations",n);$finish;end endmodule`;const out=hdl('review-fsm',g.fsm.reference,tb);assert.ok(out.includes('10240 observations'));return out.trim();});
record('lesson review','assignment-semantics',()=>{const source='module pipeline(input clk,input [3:0] din,output reg [3:0] a,b);always @(posedge clk)begin a<=din;b<=a;end endmodule',tb='module tb;reg clk=0;reg [3:0] din=0;wire [3:0] a,b;pipeline p(clk,din,a,b);always #5 clk=~clk;initial begin @(negedge clk);din=5;@(posedge clk);#1;if(a!==5||b!==0)$fatal;@(negedge clk);din=8;@(posedge clk);#1;if(a!==8||b!==5)$fatal;@(negedge clk);din=3;@(posedge clk);#1;if(a!==3||b!==8)$fatal;$display("NBA_REVIEW_OK (5,0),(8,5),(3,8)");$finish;end endmodule';const out=hdl('review-nba',source,tb);assert.ok(out.includes('NBA_REVIEW_OK'));return out.trim();});
record('lesson review','python-oop-basics',()=>py('review-oop',`from collections import deque
from copy import deepcopy
class Scoreboard:
    def __init__(self): self.pending=deque()
    def expect(self, value): self.pending.append(deepcopy(value))
    def observe(self, value):
        if not self.pending: raise AssertionError('extra')
        assert self.pending[0] == value, 'mismatch'
        self.pending.popleft()
    def finish(self): assert not self.pending, 'missing'
a,b=Scoreboard(),Scoreboard()
packet={'data':[7]};a.expect(packet);packet['data'][0]=9
assert not b.pending
a.observe({'data':[7]});a.finish();b.finish()
for expected,actual in [([2,2,9],[2,9,2]),([2,2,9],[2,2]),([2,2,9],[2,2,9,9])]:
    checker=Scoreboard()
    for value in expected: checker.expect(value)
    failed=False
    try:
        for value in actual: checker.observe(value)
        checker.finish()
    except AssertionError: failed=True
    assert failed
print('OOP_REVIEW_OK independent ownership; ordering/missing/extra rejected')
`));
record('lesson review','scoreboards',()=>contract('py-scoreboard',g['py-scoreboard'].reference));
record('lesson review','assertions',()=>{const check=(req,ack)=>{let attempts=0,failures=0;for(let k=0;k<req.length-1;k++)if(req[k]){attempts++;if(!ack[k+1])failures++}return {attempts,failures}};assert.deepEqual(check([1,0,0],[0,1,0]),{attempts:1,failures:0});assert.deepEqual(check([0,1,0],[0,1,0]),{attempts:1,failures:1});assert.deepEqual(check([0,0,0],[0,0,0]),{attempts:0,failures:0});return 'Discrete sampled-trace oracle for the published one-cycle examples and vacuity; NOT native SVA execution. Incomplete final obligations excluded.';});
record('lesson review','functional-coverage',()=>py('review-coverage',`events=[(0,False),(0,True),(1,True),(4,True)]
bins=set()
for occupancy,accepted in events:
    if accepted: bins.add('empty' if occupancy==0 else 'full' if occupancy==4 else 'middle')
assert bins=={'empty','middle','full'}
expected=[0,7,3];broken=[0,7,99]
assert not all(a==b for a,b in zip(expected,broken))
print('COVERAGE_REVIEW_OK all bins hit; broken data still fails comparison; Python model, not SV covergroup execution')
`));
const report={created:new Date().toISOString(),platform:process.platform,node:process.version,results,passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,scope:'Local execution and mathematical/sampled-model checks. No authenticated cloud run, native SVA or covergroup execution claim.'};
fs.writeFileSync(path.join(root,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed,report:path.join(root,'report.json')}));if(report.failed)process.exitCode=1;
