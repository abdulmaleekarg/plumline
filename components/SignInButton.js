'use client'
import { createClient } from '@/lib/supabase/client'

export default function SignInButton({ next = '/', className = 'btn' }) {
  const signIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
  }
  return (
    <button className={className} onClick={signIn}>
      Sign in with Google
    </button>
  )
}
