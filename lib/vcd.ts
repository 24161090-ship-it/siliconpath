export type VcdSignal={code:string;name:string;width:number;changes:{time:number;value:string}[]};
export function parseVcd(text:string){
 if(text.length>1_000_000)throw new Error('VCD must be smaller than 1 MB.');
 const signals:VcdSignal[]=[],scope:string[]=[];let time=0,endTime=0,timescale='simulation units',definitions=true;
 const lines=text.replace(/\r/g,'').split('\n');
 for(let index=0;index<lines.length;index++){
  const line=lines[index].trim();if(!line)continue;
  if(definitions){
   if(line.startsWith('$timescale')){let block=line;while(!block.includes('$end')&&index+1<lines.length)block+=' '+lines[++index].trim();timescale=block.replace('$timescale','').replace('$end','').trim()}
   else if(line.startsWith('$scope'))scope.push(line.split(/\s+/)[2]);
   else if(line.startsWith('$upscope'))scope.pop();
   else if(line.startsWith('$var')){const p=line.split(/\s+/);if(signals.length<128)signals.push({code:p[3],name:[...scope,p[4]].join('.'),width:Number(p[2]),changes:[]})}
   else if(line.startsWith('$enddefinitions'))definitions=false;
   continue;
  }
  if(line.startsWith('#')){time=Number(line.slice(1));if(Number.isFinite(time))endTime=Math.max(endTime,time);continue}
  let code='',value='';if(/^[01xz]/i.test(line)){value=line[0].toLowerCase();code=line.slice(1)}else if(/^[bB]/.test(line)){const p=line.slice(1).split(/\s+/);value=p[0].toLowerCase();code=p[1]??''}else continue;
  for(const signal of signals)if(signal.code===code&&signal.changes.length<20000)signal.changes.push({time,value});
 }
 return {signals,endTime:Math.max(1,endTime),timescale};
}
