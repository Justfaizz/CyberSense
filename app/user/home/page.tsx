import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Run all independent queries in parallel
  const [
    { data: profile },
    { count: totalModules },
    { data: passedRows },
    { data: leaderboard },
    { data: latestVideos },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('modules').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('user_scores').select('module_id').eq('user_id', user.id).eq('passed', true),
    supabase
      .from('user_scores')
      .select('user_id, profiles!inner(full_name)')
      .eq('percentage', 100)
      .limit(50),
    supabase
      .from('videos')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const passedIds = [...new Set((passedRows ?? []).map(r => r.module_id))]
  const progress = totalModules ? Math.round((passedIds.length / totalModules) * 100) : 0

  // Aggregate leaderboard in JS
  const lbMap: Record<string, { full_name: string; count: number }> = {}
  for (const row of leaderboard ?? []) {
    const p = row.profiles as unknown as { full_name: string }
    if (!lbMap[row.user_id]) lbMap[row.user_id] = { full_name: p.full_name, count: 0 }
    lbMap[row.user_id].count++
  }
  const lbSorted = Object.values(lbMap).sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <HomeClient
      userName={profile?.full_name ?? 'Student'}
      passedIds={passedIds}
      progress={progress}
      leaderboard={lbSorted}
      latestVideos={latestVideos ?? []}
    />
  )
}
