import Link from 'next/link'
import { getPostBySlug, getAllPosts, getCategories } from '@/lib/posts'
import { format } from 'date-fns'
import { marked } from 'marked'

// Generate static params for demo data
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Not Found — Tusenbruk' }
  return {
    title: `${post.title} — Tusenbruk`,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return (
      <div className="post-header" style={{ paddingBottom: 80 }}>
        <h1>Post not found</h1>
        <p style={{ color: 'var(--muted)', marginTop: 16 }}>
          <Link href="/" style={{ color: 'var(--red)' }}>← Back to stories</Link>
        </p>
      </div>
    )
  }

  const author = post.authors || {}
  const categories = getCategories()
  const cat = categories.find(c => c.slug === post.category)

  // Render markdown body to HTML
  const bodyHtml = marked(post.body || '', {
    gfm: true,
    breaks: false,
  })

  return (
    <>
      <div className="post-header">
        <div className="post-header-meta">
          <span className="post-card-category">
            {cat?.icon} {post.category}
          </span>
          <span className="post-card-date">
            {post.published_at
              ? format(new Date(post.published_at), 'd MMMM yyyy')
              : 'Draft'}
          </span>
          <span className="post-card-date">
            {post.reading_time || 4} min read
          </span>
        </div>
        <h1>{post.title}</h1>
        <p className="post-header-excerpt">{post.excerpt}</p>
        <div className="post-header-author">
          <div
            className="avatar"
            style={{ backgroundColor: author.avatar_color || '#666', width: 36, height: 36, fontSize: 13 }}
          >
            {author.avatar_letter || '?'}
          </div>
          <div className="post-header-author-info">
            <strong>
              <Link href={`/author/${author.slug || '#'}`} style={{ borderBottom: '1px solid var(--rule)' }}>
                {author.name || 'Unknown'}
              </Link>
            </strong>
            <br />
            <span>{author.location || ''}</span>
          </div>
        </div>
      </div>

      <div
        className="post-body"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      <div style={{ maxWidth: 'var(--max-w-narrow)', margin: '0 auto', padding: '0 24px 80px' }}>
        <Link href="/" style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--red)' }}>
          ← All Stories
        </Link>
      </div>
    </>
  )
}
