import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*').order('created_at')
  return (
    <>
      <section className="hero">
        <h1>Paper and pens for people who still write things down.</h1>
        <p>Notebooks, fountain pens and ink, shipped in plain cardboard.</p>
      </section>
      <section className="grid">
        {(products || []).map((p) => <ProductCard key={p.id} p={p} />)}
      </section>
      {(!products || products.length === 0) && <p className="muted">No products yet. Run supabase/schema.sql.</p>}
    </>
  )
}
