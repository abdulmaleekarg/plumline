'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()
  return (
    <button
      className="linklike"
      onClick={async () => {
        await createClient().auth.signOut()
        router.refresh()
      }}
    >
      Sign out
    </button>
  )
}
