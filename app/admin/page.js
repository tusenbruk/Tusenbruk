'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  { slug: 'watches', name: 'Watches' },
  { slug: 'cars', name: 'Cars' },
  { slug: 'pens', name: 'Pens' },
  { slug: 'cameras', name: 'Cameras' },
  { slug: 'boats', name: 'Boats' },
]

export default function AdminPage() {
  const [authors, setAuthors] = useState([])
  const [posts, setPosts] = useState([])
  const [mode, setMode] = useState('list') // 'list' | 'write' | 'author'
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Post form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('watches')
  const [authorId, setAuthorId] = useState('')
  const [published, setPublished] = useState(false)

  // Author form state
  const [authorName, setAuthorName] = useState('')
  const [authorSlug, setAuthorSlug] = useState('')
  const [authorBio, setAuthorBio] = useState('')
  const [authorLocation, setAuthorLocation] = useState('')
  const [authorLetter, setAuthorLetter] = useState('')
  const [authorColor, setAuthorColor] = useState('#2d5a7b')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [authorsRes, postsRes] = await Promise.all([
        fetch('/api/authors'),
        fetch('/api/posts'),
      ])
      if (authorsRes.ok) setAuthors(await authorsRes.json())
      if (postsRes.ok) setPosts(await postsRes.json())
    } catch (e) {
      console.error('Failed to load data:', e)
    }
  }

  function autoSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80)
  }

  async function savePost(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug: slug || autoSlug(title), excerpt, body, category,
          author_id: authorId, published,
          published_at: published ? new Date().toISOString() : null,
          reading_time: Math.max(1, Math.ceil(body.split(/\s+/).length / 250)),
        }),
      })
      if (res.ok) {
        setMessage('Post saved.')
        resetPostForm()
        setMode('list')
        loadData()
      } else {
        const err = await res.json()
        setMessage(`Error: ${err.error || 'Failed to save'}`)
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`)
    }
    setSaving(false)
  }

  async function saveAuthor(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authorName,
          slug: authorSlug || autoSlug(authorName),
          bio: authorBio,
          location: authorLocation,
          avatar_letter: authorLetter || authorName.charAt(0).toUpperCase(),
          avatar_color: authorColor,
        }),
      })
      if (res.ok) {
        setMessage('Author created.')
        resetAuthorForm()
        setMode('list')
        loadData()
      } else {
        const err = await res.json()
        setMessage(`Error: ${err.error || 'Failed to save'}`)
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`)
    }
    setSaving(false)
  }

  function resetPostForm() {
    setTitle(''); setSlug(''); setExcerpt(''); setBody('')
    setCategory('watches'); setAuthorId(''); setPublished(false)
  }

  function resetAuthorForm() {
    setAuthorName(''); setAuthorSlug(''); setAuthorBio('')
    setAuthorLocation(''); setAuthorLetter(''); setAuthorColor('#2d5a7b')
  }

  return (
    <div className="admin-wrap">
      <h1>Write</h1>
      <p className="admin-desc">
        Create stories and manage pen names. Posts support Markdown.
      </p>

      {message && (
        <div style={{
          padding: '10px 16px',
          marginBottom: 20,
          background: message.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
          color: message.startsWith('Error') ? '#991b1b' : '#166534',
          fontFamily: 'var(--sans)',
          fontSize: 13,
          border: `1px solid ${message.startsWith('Error') ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {message}
        </div>
      )}

      {/* MODE SWITCHER */}
      <div className="btn-row" style={{ marginTop: 0, marginBottom: 32 }}>
        <button
          className={mode === 'list' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setMode('list')}
        >
          All Posts
        </button>
        <button
          className={mode === 'write' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setMode('write')}
        >
          New Post
        </button>
        <button
          className={mode === 'author' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setMode('author')}
        >
          New Pen Name
        </button>
      </div>

      {/* LIST MODE */}
      {mode === 'list' && (
        <div className="admin-post-list">
          {posts.length === 0 && (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
              No posts yet. Write your first story.
            </p>
          )}
          {posts.map(post => (
            <div key={post.id || post.slug} className="admin-post-item">
              <div>
                <Link href={`/post/${post.slug}`} className="admin-post-item-title">
                  {post.title}
                </Link>
                <span className={`status-badge ${post.published ? 'status-published' : 'status-draft'}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="admin-post-item-meta">
                {post.category}
              </div>
            </div>
          ))}

          {authors.length > 0 && (
            <>
              <div style={{ marginTop: 40, marginBottom: 16, fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Pen Names
              </div>
              {authors.map(a => (
                <div key={a.id || a.slug} className="admin-post-item">
                  <div className="admin-post-item-title">
                    <Link href={`/author/${a.slug}`}>{a.name}</Link>
                  </div>
                  <div className="admin-post-item-meta">{a.location}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* WRITE MODE */}
      {mode === 'write' && (
        <form onSubmit={savePost}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              value={title}
              onChange={e => { setTitle(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)) }}
              placeholder="Submariner. 30 Years. Every Country I've Been To."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Slug</label>
            <input
              className="form-input"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="auto-generated-from-title"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Author</label>
              <select className="form-select" value={authorId} onChange={e => setAuthorId(e.target.value)} required>
                <option value="">Select pen name...</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Excerpt</label>
            <input
              className="form-input"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="One or two sentences that appear on the homepage."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Body (Markdown)</label>
            <textarea
              className="form-textarea"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your story here. Use ## for headings, **bold**, *italic*, etc."
              required
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>Publish immediately</span>
            </label>
          </div>
          <div className="btn-row">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Post'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { resetPostForm(); setMode('list') }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* AUTHOR MODE */}
      {mode === 'author' && (
        <form onSubmit={saveAuthor}>
          <div className="form-group">
            <label className="form-label">Pen Name</label>
            <input
              className="form-input"
              value={authorName}
              onChange={e => { setAuthorName(e.target.value); if (!authorSlug) setAuthorSlug(autoSlug(e.target.value)) }}
              placeholder="Marcus Lindqvist"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input
                className="form-input"
                value={authorSlug}
                onChange={e => setAuthorSlug(e.target.value)}
                placeholder="auto-generated"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                value={authorLocation}
                onChange={e => setAuthorLocation(e.target.value)}
                placeholder="Stockholm"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Avatar Letter</label>
              <input
                className="form-input"
                value={authorLetter}
                onChange={e => setAuthorLetter(e.target.value.charAt(0).toUpperCase())}
                placeholder="M"
                maxLength={1}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Avatar Colour</label>
              <input
                type="color"
                className="form-input"
                value={authorColor}
                onChange={e => setAuthorColor(e.target.value)}
                style={{ height: 42, padding: 4, cursor: 'pointer' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="form-textarea"
              value={authorBio}
              onChange={e => setAuthorBio(e.target.value)}
              placeholder="A short bio for this pen name..."
              style={{ minHeight: 120 }}
            />
          </div>
          <div className="btn-row">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Create Pen Name'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { resetAuthorForm(); setMode('list') }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
