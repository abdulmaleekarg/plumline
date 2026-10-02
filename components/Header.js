import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CartLink from './CartLink'
import SignInButton from './SignInButton'
import SignOutButton from './SignOutButton'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <header className="header">
      <Link href="/" className="logo">Plumline</Link>
      <nav>
        <CartLink />
        {user ? (
          <>
            <Link href="/orders">My orders</Link>
            <SignOutButton />
          </>
        ) : (
          <SignInButton className="linklike" />
        )}
      </nav>
    </header>
  )
}
