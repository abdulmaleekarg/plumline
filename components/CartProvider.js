'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

// Cart lines are { id, name, price_cents, color, quantity }.
// The cart only lives in the browser until checkout; orders are stored in Supabase.
export default function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem('cart') || '[]'))
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch {}
  }, [items, ready])

  const add = (p) =>
    setItems((cur) => {
      const found = cur.find((i) => i.id === p.id)
      if (found) return cur.map((i) => (i.id === p.id ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i))
      return [...cur, { id: p.id, name: p.name, price_cents: p.price_cents, color: p.color, quantity: 1 }]
    })
  const setQty = (id, q) =>
    setItems((cur) => (q <= 0 ? cur.filter((i) => i.id !== id) : cur.map((i) => (i.id === id ? { ...i, quantity: Math.min(99, q) } : i))))
  const clear = () => setItems([])

  const count = items.reduce((n, i) => n + i.quantity, 0)
  const total = items.reduce((n, i) => n + i.quantity * i.price_cents, 0)

  return (
    <CartContext.Provider value={{ items, add, setQty, clear, count, total, ready }}>
      {children}
    </CartContext.Provider>
  )
}
