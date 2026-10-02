'use client'
import { useState } from 'react'
import { useCart } from './CartProvider'

export default function AddToCart({ product }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  return (
    <button
      className="btn"
      onClick={() => {
        add(product)
        setAdded(true)
        setTimeout(() => setAdded(false), 1200)
      }}
    >
      {added ? 'Added to cart' : 'Add to cart'}
    </button>
  )
}
