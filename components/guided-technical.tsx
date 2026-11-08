import type {StudyDepth} from '@/lib/study-depth';
import Markdown from './markdown';
export default function GuidedTechnical({depth}:{depth:StudyDepth}){
 return <>{depth.flow&&<figure className="guided-flow"><div role="img" aria-label={depth.flow.join(' then ')}>{depth.flow.map((label,i)=><div key={label}><span className="eyebrow">{String(i+1).padStart(2,'0')}</span><strong>{label}</strong>{i<depth.flow!.length-1&&<span aria-hidden="true">↓</span>}</div>)}</div><figcaption>{depth.caption}</figcaption></figure>}
 {depth.trace&&<div className="reader-table"><table><caption>Contract trace — compare each row before writing code</caption><thead><tr>{depth.trace.headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{depth.trace.rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
 {depth.code&&<><p className="muted small">Study snippet: run with a simulator supporting the shown SystemVerilog features. Reading this example does not create a test result.</p><Markdown>{'```systemverilog\n'+depth.code+'\n```'}</Markdown></>}
 </>;
}
