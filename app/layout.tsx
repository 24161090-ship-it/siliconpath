import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
export const metadata: Metadata = {title: 'SiliconPath — Your path to engineering',description:'A personal engineering workspace. Learn, practice, verify and build your way to Design Verification.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
