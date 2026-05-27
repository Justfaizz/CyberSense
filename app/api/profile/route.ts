import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ profile })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { full_name, password, bio, institution, contact_email, avatar_url } = await request.json()

  const profileUpdate: Record<string, string> = {}
  if (full_name)                profileUpdate.full_name      = full_name
  if (bio !== undefined)        profileUpdate.bio            = bio
  if (institution !== undefined) profileUpdate.institution   = institution
  if (contact_email !== undefined) profileUpdate.contact_email = contact_email
  if (avatar_url)               profileUpdate.avatar_url    = avatar_url

  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (password) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
