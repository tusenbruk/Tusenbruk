import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SHOP_ITEMS } from '@/lib/demo-data'

export async function GET() {
  if (supabase) {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
  return NextResponse.json(SHOP_ITEMS || [])
}

export async function POST(request) {
  const body = await request.json()

  if (supabase) {
    const { data, error } = await supabase
      .from('shop_items')
      .insert([body])
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
  return NextResponse.json({ ...body, id: Date.now().toString() })
}
