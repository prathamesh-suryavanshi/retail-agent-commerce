import assert from 'node:assert/strict'
import { createServer } from 'vite'

const vite = await createServer({
  configFile: false,
  root: process.cwd(),
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
})

try {
  const { createStore } = await vite.ssrLoadModule('/src/services/store.js')
  const { createTools } = await vite.ssrLoadModule('/agent/tools.js')
  const data = new Map()
  const store = createStore({
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  })
  store.reset()
  const api = { ...store, searchProducts: store.search }
  const calls = []
  const tools = new Map(createTools(api, (event) => calls.push(event)).map((tool) => [tool.name, tool]))
  const call = (name, args = {}) => tools.get(name).run(args)

  const recommendations = await call('recommend_two_gift_options')
  assert.equal(recommendations.options.length, 2)
  assert.deepEqual(recommendations.options.map((option) => option.product_id), [33, 35])
  assert.deepEqual(calls.at(-1), { view: 'gift-options', productIds: [33, 35] })
  assert.equal(recommendations.options[0].url, 'https://retail-agent-commerce.vercel.app/#/product/33')
  const localTools = createTools(api, undefined, { storefrontUrl: 'http://localhost:5173/' })
  const localRecommendations = await localTools.find((tool) => tool.name === 'recommend_two_gift_options').run()
  assert.equal(localRecommendations.options[0].url, 'http://localhost:5173/#/product/33')
  assert.match(recommendations.instruction, /exactly these two/i)
  assert.equal(recommendations.demo_postal_code, '560001')
  assert(recommendations.options.every((option) => option.available_variants.some((v) => v.delivery.serviceable)))

  const watches = await call('search_products', { query: 'smartwatch', max_price: 6000, status: 'in_stock' })
  assert(watches.some((p) => p.id === 33 && p.name.startsWith('Pulse 2')))
  const watchSearchResult = watches.find((p) => p.id === 33)
  assert.equal(watchSearchResult.delivery_promise, 'Delivered by Friday for demo postcode 560001.')
  assert.deepEqual(watchSearchResult.gift_alternatives.map((option) => option.id), [35])
  const headphones = await call('search_products', { query: 'headphones', max_price: 6000, status: 'in_stock' })
  assert.deepEqual(headphones.map((p) => p.id), [35])
  assert.equal(headphones[0].delivery_promise, 'Delivered by Friday for demo postcode 560001.')
  assert.deepEqual(headphones[0].gift_alternatives.map((option) => option.id), [33])
  const watch = await call('get_product', { product_id: 33 })
  const phones = await call('get_product', { product_id: 35 })
  assert.match(watch.specs.compatibility, /iOS 14\+/)
  assert.match(phones.specs.compatibility, /iOS 14\+/)
  assert(watch.aeo.faqs.some((faq) => /delivered by Friday/i.test(`${faq.q} ${faq.a}`)))
  assert(phones.aeo.faqs.some((faq) => /delivered by Friday/i.test(`${faq.q} ${faq.a}`)))
  assert.equal(watch.variants.find((v) => v.id === 64).quantity, 1)
  assert.equal(watch.variants.find((v) => v.id === 65).quantity, 6)
  assert.equal(phones.variants[0].price, 4499)

  const postalCode = '560001'
  const initialBlack = await call('check_availability', { variant_id: 64, postal_code: postalCode })
  const initialBlue = await call('check_availability', { variant_id: 65, postal_code: postalCode })
  const initialHeadphones = await call('check_availability', { variant_id: 68, postal_code: postalCode })
  assert.equal(initialBlack.status, 'low_stock')
  assert.equal(initialBlack.quantity, 1)
  assert.equal(initialBlack.delivery.serviceable, true)
  assert.match(initialBlack.delivery.estimated_delivery_date, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(initialBlue.delivery.estimated_delivery_date, initialBlack.delivery.estimated_delivery_date)
  assert.equal(initialHeadphones.quantity, 8)
  assert.equal(initialHeadphones.delivery.estimated_delivery_date, initialBlack.delivery.estimated_delivery_date)
  assert.equal((await call('check_availability', { variant_id: 64, postal_code: '000000' })).delivery.serviceable, false)

  // One shopper chooses the watch after comparing both gift options.
  await call('add_to_cart', { variant_id: 64, quantity: 1 })
  const initialCart = await call('get_cart')
  assert.equal(initialCart.items[0].product_id, 33)
  assert.equal(initialCart.items[0].label, 'Black strap')
  assert.equal(initialCart.total, 4999)

  // The last black watch sells while it is in the shopper's cart.
  const sale = store.simulateCompetingSale()
  assert.equal(sale.quantity, 0)
  assert.equal(sale.status, 'out_of_stock')
  const affectedCart = await call('get_cart', { postal_code: postalCode })
  assert.equal(affectedCart.items[0].available, 0)
  assert.deepEqual(affectedCart.items[0].alternatives.map((v) => [v.variant_id, v.label, v.price, v.available]), [[65, 'Blue strap', 4999, 6]])
  assert.equal(affectedCart.items[0].alternatives[0].delivery.estimated_delivery_date, initialBlack.delivery.estimated_delivery_date)
  assert.equal((await call('get_cart')).items[0].variant_id, 64)
  assert.throws(() => store.simulateCompetingSale(), /Expected one black watch/)
  const soldOutBlack = await call('check_availability', { variant_id: 64, postal_code: postalCode })
  assert.equal(soldOutBlack.status, 'out_of_stock')
  assert.equal(soldOutBlack.delivery.estimated_delivery_date, null)
  const availableBlue = await call('check_availability', { variant_id: 65, postal_code: postalCode })
  assert.equal(availableBlue.status, 'in_stock')
  assert.equal(availableBlue.delivery.estimated_delivery_date, initialBlack.delivery.estimated_delivery_date)

  // Following the shopper's approval, replace black with blue and place one order.
  await call('replace_cart_variant', { variant_id: 64, replacement_variant_id: 65 })
  const finalCart = await call('get_cart')
  assert.equal(finalCart.items[0].label, 'Blue strap')
  assert.equal(finalCart.total, 4999)
  const testCustomer = {
    name: 'Riya Demo', email: 'riya.demo@example.test', phone: '+91 9000000000',
    address: '1 Demo Lane', city: 'Bengaluru', postal_code: postalCode,
  }
  const order = await call('place_order', testCustomer)
  assert.equal(order.items[0].label, 'Blue strap')
  assert.equal(order.delivery.postal_code, postalCode)
  assert.equal(order.delivery.estimated_delivery_date, initialBlack.delivery.estimated_delivery_date)
  assert.equal((await call('get_cart')).items.length, 0)
  assert.equal((await call('get_orders')).length, 1)
  assert.equal((await call('check_availability', { variant_id: 64 })).quantity, 0)
  assert.equal((await call('check_availability', { variant_id: 65 })).quantity, 5)

  // The existing reset operation restores scenario stock, cart, and orders.
  store.reset()
  assert.equal((await call('check_availability', { variant_id: 64 })).quantity, 1)
  assert.equal((await call('check_availability', { variant_id: 65 })).quantity, 6)
  assert.equal((await call('get_cart')).items.length, 0)
  assert.equal((await call('get_orders')).length, 0)
  assert(calls.some((event) => event.view === 'cart'))
  assert(calls.some((event) => event.view === 'orders'))

  console.log('Retail gift demo flow passed: paired recommendations, watch selection, simulated sellout, blue substitution, one order, postcode ETA, and reset.')
} finally {
  await vite.close()
}
