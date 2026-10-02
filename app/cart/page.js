'use client'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { money } from '@/lib/format'

export default function CartPage() {
  const { items, setQty, total, ready } = useCart()
  if (!ready) return null
  if (items.length === 0) {
    return (
      <div className="narrow">
        <h1>Your cart is empty</h1>
        <Link className="btn" href="/">Browse products</Link>
      </div>
    )
  }
  return (
    <div className="narrow">
      <h1>Your cart</h1>
      {items.map((i) => (
        <div className="line" key={i.id}>
          <div className="swatch tiny" style={{ background: i.color }} />
          <div className="grow">
            <strong>{i.name}</strong>
            <div className="muted">{money(i.price_cents)}</div>
          </div>
          <div className="qty">
            <button aria-label="Decrease" onClick={() => setQty(i.id, i.quantity - 1)}>−</button>
            <span>{i.quantity}</span>
            <button aria-label="Increase" onClick={() => setQty(i.id, i.quantity + 1)}>+</button>
          </div>
          <div className="amount">{money(i.price_cents * i.quantity)}</div>
        </div>
      ))}
      <div className="total"><span>Total</span><span>{money(total)}</span></div>
      <Link className="btn" href="/checkout">Go to checkout</Link>
    </div>
  )
}
