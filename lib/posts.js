import { supabase } from './supabase'
import { POSTS, AUTHORS, CATEGORIES, SHOP_ITEMS } from './demo-data'

// Data access layer — uses Supabase when configured, falls back to demo data.

export async function getAllPosts() {
  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, authors(*)')
      .eq('published', true)
      .order('published_at', { ascending: false })
    if (error) throw error
    return data.map(normalizePost)
  }
  return POSTS.filter(p => p.published)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .map(p => ({ ...p, authors: AUTHORS.find(a => a.id === p.author_id) }))
}

export async function getPostsByCategory(categorySlug) {
  const all = await getAllPosts()
  return all.filter(p => p.category === categorySlug)
}

export async function getPostBySlug(slug) {
  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, authors(*)')
      .eq('slug', slug)
      .single()
    if (error) throw error
    return normalizePost(data)
  }
  const post = POSTS.find(p => p.slug === slug)
  if (!post) return null
  return { ...post, authors: AUTHORS.find(a => a.id === post.author_id) }
}

export async function getPostsByAuthor(authorSlug) {
  const author = await getAuthorBySlug(authorSlug)
  if (!author) return []
  const all = await getAllPosts()
  return all.filter(p => p.author_id === author.id)
}

export async function getAllAuthors() {
  if (supabase) {
    const { data, error } = await supabase.from('authors').select('*').order('name')
    if (error) throw error
    return data
  }
  return AUTHORS
}

export async function getAuthorBySlug(slug) {
  if (supabase) {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) throw error
    return data
  }
  return AUTHORS.find(a => a.slug === slug) || null
}

export function getCategories() {
  return CATEGORIES
}

export async function getShopItems() {
  if (supabase) {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data
  }
  return SHOP_ITEMS || []
}

// Normalise Supabase row shape to match demo data
function normalizePost(row) {
  return {
    ...row,
    author_id: row.author_id || row.authors?.id,
  }
}
