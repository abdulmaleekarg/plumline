'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/components/CartProvider'
import SignInButton from '@/components/SignInButton'
import { money } from '@/lib/format'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clear, ready } = useCart()
  const [user, setUser] = useState(undefined) // undefined = loading
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', city: '', postal_code: '', country: '' })

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUser(data.user || null)
      const name = data.user?.user_metadata?.full_name
      if (name) setForm((f) => ({ ...f, name: f.name || name }))
    })
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map((i) => ({ id: i.id, quantity: i.quantity })), shipping: form }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(data.error || 'Something went wrong. Try again.')
    clear()
    router.push(`/orders/${data.id}?placed=1${data.emailSent ? '&emailed=1' : ''}`)
  }

  if (!ready || user === undefined) return null
  if (items.length === 0) {
    return (
      <div className="narrow">
        <h1>Nothing to check out</h1>
        <Link className="btn" href="/">Browse products</Link>
      </div>
    )
  }
  if (!user) {
    return (
      <div className="narrow">
        <h1>Sign in to check out</h1>
        <p>We use your Google account to save your order and email the confirmation.</p>
        <SignInButton next="/checkout" />
      </div>
    )
  }

  return (
    <div className="checkout">
      <form onSubmit={submit}>
        <h1>Shipping</h1>
        <label>Full name<input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
        <label>Address<input required value={form.address} onChange={set('address')} autoComplete="street-address" /></label>
        <label>City<input required value={form.city} onChange={set('city')} autoComplete="address-level2" /></label>
        <div className="row">
          <label>Postal code<input required value={form.postal_code} onChange={set('postal_code')} autoComplete="postal-code" /></label>
          <label>Country<input required value={form.country} onChange={set('country')} autoComplete="country-name" /></label>
        </div>
        <p className="muted">Confirmation goes to {user.email}</p>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Placing order…' : `Place order · ${money(total)}`}</button>
      </form>
      <aside>
        <h2>Order summary</h2>
        {items.map((i) => (
          <div className="sumline" key={i.id}>
            <span>{i.name} × {i.quantity}</span>
            <span>{money(i.price_cents * i.quantity)}</span>
          </div>
        ))}
        <div className="total"><span>Total</span><span>{money(total)}</span></div>
      </aside>
    </div>
  )
}
