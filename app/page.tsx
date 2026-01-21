import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/check-eligibility')
}

export const dynamic = 'force-dynamic'
