import Link from 'next/link'
import { getPostBySlug, getCategories } from '@/lib/posts'
import { format } from 'date-fns'
import { marked } from 'marked'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Not Found \u2014 Tusenbruk' }
  return {
    title: `${post.title} \u2014 Tusenbruk`,
    description: post.excerpt,
    openGraph: post.cover_image ? { images: [{ url: post.cover_image }] } : undefined,
  }
}

function splitBodySections(body) {
  if (!body) return ['']
  const parts = body.split(/(?=^## )/m)
  return parts.filter(p => p.trim())
}

function renderMarkdown(text) {
  try {
    return marked(text, { gfm: true, breaks: false })
  } catch {
    return `<p>${text}</p>`
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
          <Link href="/" style={{ color: 'var(--red)' }}>{'\u2190'} Back to stories</Link>
        </p>
      </div>
    )
  }

  const author = post.authors || {}
  const categories = getCategories()
  const cat = categories.find(c => c.slug === post.category)
  const images = post.images || []
  const coverImage = post.cover_image || null
  const sections = splitBodySections(post.body)

  return (
    <>
      {coverImage && (
        <div className="post-cover">
          <img
            src={coverImage}
            alt={post.title}
            className="post-cover-img"
          />
        </div>
      )}

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

      <div className="post-editorial">
        {sections.map((section, i) => {
          const sectionHtml = renderMarkdown(section)
          const image = images[i] || null

          return (
            <div key={i}>
              <div
                className="post-body"
                dangerouslySetInnerHTML={{ __html: sectionHtml }}
              />

              {image && (
                <figure className={`post-figure ${image.position === 'wide' ? 'post-figure-wide' : 'post-figure-inline'}`}>
                  <img
                    src={image.url}
                    alt={image.caption || ''}
                    loading="lazy"
                  />
                  {image.caption && (
                    <figcaption className="post-figure-caption">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ maxWidth: 'var(--max-w-narrow)', margin: '0 auto', padding: '0 24px 80px' }}>
        <Link href="/" style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--red)' }}>
          {'\u2190'} All Stories
        </Link>
      </div>
    </>
  )
}
