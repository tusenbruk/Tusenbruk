import Link from 'next/link'
import { getAuthorBySlug, getPostsByAuthor, getAllAuthors, getCategories } from '@/lib/posts'
import { format } from 'date-fns'

export async function generateStaticParams() {
  const authors = await getAllAuthors()
  return authors.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return { title: 'Not Found — Tusenbruk' }
  return {
    title: `${author.name} — Tusenbruk`,
    description: author.bio,
  }
}

export default async function AuthorPage({ params }) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)

  if (!author) {
    return (
      <div className="author-header" style={{ flexDirection: 'column' }}>
        <h1>Author not found</h1>
        <p style={{ color: 'var(--muted)', marginTop: 16 }}>
          <Link href="/" style={{ color: 'var(--red)' }}>← Back to stories</Link>
        </p>
      </div>
    )
  }

  const posts = await getPostsByAuthor(slug)
  const categories = getCategories()

  return (
    <>
      <div className="author-header">
        <div
          className="author-avatar-lg"
          style={{ backgroundColor: author.avatar_color || '#666' }}
        >
          {author.avatar_letter || '?'}
        </div>
        <div>
          <h1>{author.name}</h1>
          <div className="author-header-location">{author.location}</div>
          <p className="author-header-bio">{author.bio}</p>
        </div>
      </div>

      <div className="author-posts">
        <div className="author-posts-label">
          {posts.length} {posts.length === 1 ? 'Story' : 'Stories'}
        </div>
        {posts.map(post => {
          const cat = categories.find(c => c.slug === post.category)
          return (
            <article key={post.id} className="post-card">
              <div className="post-card-body">
                <div className="post-card-meta">
                  <span className="post-card-category">
                    {cat?.icon} {post.category}
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
