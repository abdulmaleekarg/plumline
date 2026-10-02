import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SignInButton from '@/components/SignInButton'
import { money } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function Orders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="narrow">
        <h1>Sign in to see your orders</h1>
        <SignInButton next="/orders" />
      </div>
    )
  }
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  return (
    <div className="narrow">
      <h1>My orders</h1>
      {(orders || []).length === 0 && <p className="muted">No orders yet.</p>}
      {(orders || []).map((o) => (
        <Link key={o.id} href={`/orders/${o.id}`} className="line">
          <div className="grow"><strong>Order #{o.number}</strong><div className="muted">{new Date(o.created_at).toLocaleDateString()}</div></div>
          <div className="amount">{money(o.total_cents)}</div>
        </Link>
      ))}
    </div>
  )
}
