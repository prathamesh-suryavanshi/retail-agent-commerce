import { useEffect, useState } from 'react'
import { api } from '../api'
import { money } from '../components'
import { Card, CardGrid } from '../widgets'

export default function GiftOptions({ ids }) {
  const [products, setProducts] = useState(null)

  useEffect(() => {
    let active = true
    setProducts(null)
    const productIds = ids.split(',').filter((id) => /^\d+$/.test(id)).map(Number).slice(0, 2)
    Promise.all(productIds.map((id) => api.getProduct(id).catch(() => null)))
      .then((items) => { if (active) setProducts(items.filter(Boolean)) })
    return () => { active = false }
  }, [ids])

  return (
    <section className="page">
      <h1>Gift ideas for you</h1>
      <p>Compare these options and open either product to learn more.</p>
      {products === null ? <p>Loading gift ideas…</p> : products.length === 0 ? <p>These gift ideas are unavailable. Try your search again.</p> : (
        <CardGrid min={230}>
          {products.map((product) => (
            <Card key={product.id} image={product.image} title={product.name} eyebrow={product.category}
              href={'#/product/' + product.id} price={'From ' + money(product.price_from)}
              text={product.delivery_promise}
              actions={<a className="w-btn outline block" href={'#/product/' + product.id}>View product</a>} />
          ))}
        </CardGrid>
      )}
    </section>
  )
}
