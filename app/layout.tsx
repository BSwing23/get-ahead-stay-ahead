export const metadata = { title: 'Get Ahead Stay Ahead' }

import Link from 'next/link'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{margin:0, fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Arial'}}>
        <header style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 16px', borderBottom:'1px solid #e5e7eb', background:'#fff',
          position:'sticky', top:0, zIndex:50
        }}>
          <div style={{fontWeight:800}}>Get Ahead Stay Ahead</div>
          <nav style={{display:'flex', gap:14}}>
            <Link href="/setup">Setup</Link>
            <Link href="/live">Live</Link>
            <Link href="/summary">Summary</Link>
            <Link href="/season">Season</Link>
          </nav>
        </header>
        <main style={{padding:'16px'}}>{children}</main>
      </body>
    </html>
  )
}
