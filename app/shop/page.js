import Link from 'next/link'
import { getShopItems, getCategories } from '@/lib/posts'

export const metadata = {
  title: 'The Shop — Tusenbruk',
  description: 'Curated things we use and recommend. Watches, cars, pens, cameras, boats.',
}

export default async function ShopPage() {
  const items = await getShopItems()
  const categories = getCategories()

  // Group by category
  const grouped = {}
  items.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })

  return (
    <>
      <div className="shop-header">
        <div className="hero-eyebrow">The Shop</div>
        <h1 className="shop-title">Things We Use</h1>
        <p className="shop-intro">
          A curated selection of the things we own, recommend, and believe in.
          Every item here has been used, tested, or coveted by our writers.
        </p>
      </div>

      <div className="shop-sections">
        {categories.map(cat => {
          const catItems = grouped[cat.slug]
          if (!catItems || catItems.length === 0) return null
          return (
            <section key={cat.slug} className="shop-section">
              <div className="section-header">
                <h3 className="section-title">{cat.icon} {cat.name}</h3>
              </div>
              <div className="shop-grid">
                {catItems.map(item => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shop-card"
                  >
                    <div className="shop-card-top">
                      <div className="shop-card-category">
                        {cat.icon} {cat.name}
                      </div>
                      {item.price && (
                        <div className="shop-card-price">{item.price}</div>
                      )}
                    </div>
                    <h3 className="shop-card-name">{item.name}</h3>
                    <p className="shop-card-note">{item.note}</p>
                    <div className="shop-card-cta">
                      View →
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )
        })}

        {items.length === 0 && (
          <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '40px 48px' }}>
            <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
              The shop is being curated. Check back soon.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
