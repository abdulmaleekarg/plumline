import Link from 'next/link'
import { money } from '@/lib/format'

export default function ProductCard({ p }) {
  return (
    <Link href={`/products/${p.id}`} className="card">
      <div className="swatch" style={{ background: p.color }} />
      <h3>{p.name}</h3>
      <p>{money(p.price_cents)}</p>
    </Link>
  )
}
