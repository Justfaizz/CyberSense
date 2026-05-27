import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/scores - Save a module score (replaces save_score.php)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ status: 'error', message: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const { module_id, score, total_questions, percentage } = body

  if (module_id == null || score == null || total_questions == null || percentage == null) {
    return NextResponse.json({ status: 'error', message: 'Incomplete data' }, { status: 400 })
  }

  const passed = percentage === 100

  const { error } = await supabase.from('user_scores').insert({
    user_id: user.id,
    module_id,
    score,
    total_questions,
    percentage,
    passed,
  })

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'success', message: 'Score saved successfully' })
}
