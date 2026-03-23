import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(request, { params }) {
  const { id } = await params
  const body = await request.json()

  if (supabase) {
    const { data, error } = await supabase
      .from('authors')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
  return NextResponse.json({ ...body, id })
}

export async function DELETE(request, { params }) {
  const { id } = await params

  if (supabase) {
    const { error } = await supabase
      .from('authors')
      .delete()
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: true })
  }
  return NextResponse.json({ deleted: true })
}
