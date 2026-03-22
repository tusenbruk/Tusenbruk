import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { POSTS, AUTHORS } from '@/lib/demo-data'

export async function GET() {
  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, authors(*)')
      .order('published_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
  // Demo mode — return all posts with author info
  const posts = POSTS.map(p => ({
    ...p,
    authors: AUTHORS.find(a => a.id === p.author_id),
  }))
  return NextResponse.json(posts)
}

export async function POST(request) {
  const body = await request.json()

  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .insert([body])
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Demo mode — just return the body as if saved
  return NextResponse.json({ ...body, id: Date.now().toString() })
}
