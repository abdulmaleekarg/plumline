import { NextResponse } from 'next/server'
import { createClient, createAdmin } from '@/lib/supabase/server'
import { sendOrderConfirmation } from '@/lib/mailgun'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to place an order.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const items = Array.isArray(body?.items) ? body.items : []
  const s = body?.shipping || {}

  const required = ['name', 'address', 'city', 'postal_code', 'country']
  for (const f of required) {
    if (!String(s[f] || '').trim()) {
      return NextResponse.json({ error: `Please fill in ${f.replace('_', ' ')}.` }, { status: 400 })
    }
  }
  if (items.length === 0) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })

  const admin = createAdmin()

  // Prices come from the database, never from the browser
  const ids = items.map((i) => i.id)
  const { data: products, error: pErr } = await admin.from('products').select('*').in('id', ids)
  if (pErr) return NextResponse.json({ error: 'Could not load products.' }, { status: 500 })

  const lines = []
  for (const i of items) {
    const p = products.find((x) => x.id === i.id)
    const qty = Math.floor(Number(i.quantity))
    if (!p || !(qty > 0) || qty > 99) {
      return NextResponse.json({ error: 'Some items in your cart are no longer available.' }, { status: 400 })
    }
    lines.push({ product_id: p.id, name: p.name, unit_price_cents: p.price_cents, quantity: qty })
  }
  const total = lines.reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0)

  const { data: order, error: oErr } = await admin
    .from('orders')
    .insert({
      user_id: user.id,
      email: user.email,
      name: s.name.trim(),
      address: s.address.trim(),
      city: s.city.trim(),
      postal_code: s.postal_code.trim(),
      country: s.country.trim(),
      total_cents: total,
    })
    .select()
    .single()
  if (oErr) return NextResponse.json({ error: 'Could not save your order.' }, { status: 500 })

  const { error: iErr } = await admin
    .from('order_items')
    .insert(lines.map((l) => ({ ...l, order_id: order.id })))
  if (iErr) {
    await admin.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: 'Could not save your order.' }, { status: 500 })
  }

  // The order is saved. A failed email must not undo it.
  let emailSent = false
  try {
    await sendOrderConfirmation({ to: user.email, order, items: lines })
    emailSent = true
    await admin.from('orders').update({ email_sent: true }).eq('id', order.id)
  } catch (e) {
    console.error('Confirmation email failed:', e.message)
  }

  return NextResponse.json({ id: order.id, number: order.number, emailSent })
}
