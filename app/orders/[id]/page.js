import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { money } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function OrderPage({ params, searchParams }) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()
  const { data: order } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle()
  if (!order) notFound()
  return (
    <div className="narrow">
      {sp.placed && (
        <div className="notice">
          Order placed. {sp.emailed ? `A confirmation was sent to ${order.email}.` : 'We could not send the confirmation email, but your order is saved.'}
        </div>
      )}
      <h1>Order #{order.number}</h1>
      <p className="muted">
        Ships to {order.name}, {order.address}, {order.city} {order.postal_code}, {order.country}
      </p>
      {order.order_items.map((i) => (
        <div className="sumline" key={i.id}>
          <span>{i.name} × {i.quantity}</span>
          <span>{money(i.unit_price_cents * i.quantity)}</span>
        </div>
      ))}
      <div className="total"><span>Total</span><span>{money(order.total_cents)}</span></div>
    </div>
  )
}
