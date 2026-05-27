import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Total active modules
  const { count: totalModules } = await supabase
    .from('modules').select('*', { count: 'exact', head: true }).eq('status', 'active')

  // Passed modules for this user
  const { data: passedRows } = await supabase
    .from('user_scores').select('module_id').eq('user_id', user.id).eq('passed', true)

  const passedIds = [...new Set((passedRows ?? []).map(r => r.module_id))]
  const progress = totalModules ? Math.round((passedIds.length / totalModules) * 100) : 0

  // Leaderboard (top 5)
  const { data: leaderboard } = await supabase
    .from('user_scores')
    .select('user_id, profiles!inner(full_name)')
    .eq('percentage', 100)
    .limit(100) // fetch then aggregate client-side (Supabase doesn't do COUNT GROUP BY via RLS easily)

  // Aggregate leaderboard
  const lbMap: Record<string, { full_name: string; count: number }> = {}
  for (const row of leaderboard ?? []) {
    const profile = row.profiles as unknown as { full_name: string }
    if (!lbMap[row.user_id]) lbMap[row.user_id] = { full_name: profile.full_name, count: 0 }
    lbMap[row.user_id].count++
  }
  const lbSorted = Object.values(lbMap).sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <HomeClient
      userName={profile?.full_name ?? 'Student'}
      passedIds={passedIds}
      progress={progress}
      leaderboard={lbSorted}
    />
  )
}
