
import Link from "next/link"
export default function Home(){
  return (
    <main className="container col">
      <h1>Get Ahead Stay Ahead</h1>
      <p>Win More Matches, Intelligently</p>
      <div className="row">
        <Link className="btn btn-ghost" href="/setup">Setup</Link>
        <Link className="btn btn-primary" href="/live">Live</Link>
        <Link className="btn btn-ghost" href="/summary">Summary</Link>
      </div>
    </main>
  )
}
