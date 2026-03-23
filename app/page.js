import Link from 'next/link'
import { getAllPosts, getPostsByCategory, getCategories } from '@/lib/posts'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }) {
  const params = await searchParams
  const category = params?.category || null
  const categories = getCategories()
  const posts = category
    ? await getPostsByCategory(category)
    : await getAllPosts()

  const leadPost = !category && posts.length > 0 ? posts[0] : null
  const remainingPosts = leadPost ? posts.slice(1) : posts

  // Group remaining posts by category for magazine-style sections
  const grouped = {}
  if (!category) {
    remainingPosts.forEach(post => {
      if (!grouped[post.category]) grouped[post.category] = []
      grouped[post.category].push(post)
    })
  }

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
        <Link href="/" className={`cat-pill ${!category ? 'active' : ''}`}>
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
        <Link href="/shop" className="cat-pill">
          ◈ Shop
        </Link>
      </div>

      {/* LEAD STORY */}
      {leadPost && (
        <div className="lead-story">
          <div className="lead-story-inner">
            <div className="lead-meta">
              <span className="post-card-category">
                {categories.find(c => c.slug === leadPost.category)?.icon}{' '}
                {leadPost.category}
              </span>
              <span className="post-card-date">
                {leadPost.published_at
                  ? format(new Date(leadPost.published_at), 'd MMMM yyyy')
                  : 'Draft'}
              </span>
            </div>
            <h2 className="lead-title">
              <Link href={`/post/${leadPost.slug}`}>{leadPost.title}</Link>
            </h2>
            <p className="lead-excerpt">{leadPost.excerpt}</p>
            <div className="lead-author">
              <div
                className="avatar"
                style={{ backgroundColor: leadPost.authors?.avatar_color || '#666' }}
              >
                {leadPost.authors?.avatar_letter || '?'}
              </div>
              <div className="lead-author-info">
                <Link href={`/author/${leadPost.authors?.slug || '#'}`} className="post-card-author-name">
                  {leadPost.authors?.name || 'Unknown'}
                </Link>
                <span className="lead-reading-time">{leadPost.reading_time || 4} min read</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY SECTIONS (magazine layout) or FILTERED LIST */}
      {!category ? (
        <div className="magazine-sections">
          {categories.map(cat => {
            const catPosts = grouped[cat.slug]
            if (!catPosts || catPosts.length === 0) return null
            return (
              <section key={cat.slug} className="magazine-section">
                <div className="section-header">
                  <h3 className="section-title">{cat.icon} {cat.name}</h3>
                  <Link href={`/?category=${cat.slug}`} className="section-see-all">
                    All {cat.name} →
                  </Link>
                </div>
                <div className="section-posts">
                  {catPosts.slice(0, 3).map(post => (
                    <PostCard key={post.id} post={post} categories={categories} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="posts-grid">
          {posts.length === 0 && (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic', padding: '40px 0' }}>
              No stories yet in this category.
            </p>
          )}
          {posts.map(post => (
            <PostCard key={post.id} post={post} categories={categories} />
          ))}
        </div>
      )}
    </>
  )
}

function PostCard({ post, categories }) {
  const author = post.authors || {}
  return (
    <article className="post-card">
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
}
