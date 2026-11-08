'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="empty"><h1>The workspace could not render.</h1><p>Your saved data has not been deleted. Reload or restore a backup from Settings if the problem persists.</p><button className="btn primary" onClick={reset}>Try again</button></div>}
