import Link from "next/link";

export default function Home() {
  return (
    <main>
      <ul>
        <Link href="/sign-in">Sign In</Link>
        <Link href="/sign-up">Sign Up</Link>
        <Link href="/dashboard">Dashboard</Link>
      </ul>
    </main>
  )
}
