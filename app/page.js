import Link from 'next/link'
import { getAllPosts, getPostsByCategory, getCategories } from '@/lib/posts'
import { format } from 'date-fns'

export default async function Home({ searchParams }) {
  const params = await searchParams
  const category = params?.category || null
  const categories = getCategories()
  const posts = category
    ? await getPostsByCategory(category)
    : await getAllPosts()

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-eyebrow">A Journal of Things Well Used</div>
        <h1>
          Things worn<br />
          <em>beautifully</em> by living.
        </h1>
        <p className="hero-standfirst">
          Stories about the watches, cars, pens, cameras, and boats
          that carry our lives in their scratches, patina, and wear.
        </p>
      </section>

      {/* CATEGORY BAR */}
      <div className="category-bar">
        <Link
          href="/"
          className={`cat-pill ${!category ? 'active' : ''}`}
        >
          All Stories
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/?category=${cat.slug}`}
            className={`cat-pill ${category === cat.slug ? 'active' : ''}`}
          >
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {/* POSTS */}
      <div className="posts-grid">
        {posts.length === 0 && (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic', padding: '40px 0' }}>
            No stories yet in this category.
          </p>
        )}
        {posts.map(post => {
          const author = post.authors || {}
          return (
            <article key={post.id} className="post-card">
              <div className="post-card-body">
                <div className="post-card-meta">
                  <span className="post-card-category">
                    {categories.find(c => c.slug === post.category)?.icon}{' '}
                    {post.category}
                  </span>
                  <span className="post-card-date">
                    {post.published_at
                      ? format(new Date(post.published_at), 'd MMM yyyy')
                      : 'Draft'}
                  </span>
                </div>
                <h2 className="post-card-title">
                  <Link href={`/post/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="post-card-excerpt">{post.excerpt}</p>
                <div className="post-card-author">
                  <div
                    className="avatar"
                    style={{ backgroundColor: author.avatar_color || '#666' }}
                  >
                    {author.avatar_letter || '?'}
                  </div>
                  <Link
                    href={`/author/${author.slug || '#'}`}
                    className="post-card-author-name"
                  >
                    {author.name || 'Unknown'}
                  </Link>
                </div>
              </div>
              <div className="post-card-reading-time">
                {post.reading_time || 4} min read
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
