import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AUTHORS } from '@/lib/demo-data'

export async function GET() {
  if (supabase) {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
  return NextResponse.json(AUTHORS)
}

export async function POST(request) {
  const body = await request.json()

  if (supabase) {
    const { data, error } = await supabase
      .from('authors')
      .insert([body])
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Demo mode
  return NextResponse.json({ ...body, id: Date.now().toString() })
}
