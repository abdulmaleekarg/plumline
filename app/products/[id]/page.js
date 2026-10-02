import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddToCart from '@/components/AddToCart'
import { money } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: p } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  if (!p) notFound()
  return (
    <div className="detail">
      <div className="swatch big" style={{ background: p.color }} />
      <div>
        <h1>{p.name}</h1>
        <p className="price">{money(p.price_cents)}</p>
        <p>{p.description}</p>
        <AddToCart product={p} />
      </div>
    </div>
  )
}
