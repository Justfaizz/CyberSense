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
      .select('user_id, module_id, passed, completed_at, profiles!inner(full_name)')
      .order('completed_at', { ascending: true })
      .limit(1000),
    supabase
      .from('videos')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const passedIds = [...new Set((passedRows ?? []).map(r => r.module_id))]
  const progress = totalModules ? Math.round((passedIds.length / totalModules) * 100) : 0

  // Point-based leaderboard aggregation
  const userPoints: Record<string, { full_name: string; points: number; badgeCount: number; firstPasses: Set<number> }> = {}
  for (const row of leaderboard ?? []) {
    const profiles = row.profiles as unknown as { full_name: string } | { full_name: string }[]
    const name = Array.isArray(profiles) ? profiles[0]?.full_name : profiles?.full_name
    if (!name) continue
    if (!userPoints[row.user_id]) userPoints[row.user_id] = { full_name: name, points: 0, badgeCount: 0, firstPasses: new Set() }
    const u = userPoints[row.user_id]
    u.points += 5
    if (row.passed) {
      u.points += 25
      if (!u.firstPasses.has(row.module_id)) {
        u.firstPasses.add(row.module_id)
        u.points += 20
        u.badgeCount++
      }
    }
  }

  const allRanked = Object.entries(userPoints)
    .map(([uid, d]) => ({ uid, full_name: d.full_name, points: d.points, badgeCount: d.badgeCount }))
    .sort((a, b) => b.points - a.points)

  const lbSorted = allRanked.slice(0, 10)
  const currentUserRankIdx = allRanked.findIndex(u => u.uid === user.id)
  const currentUserRank   = currentUserRankIdx >= 0 ? currentUserRankIdx + 1 : allRanked.length + 1
  const currentUserPoints = userPoints[user.id]?.points ?? 0
  const currentUserBadges = userPoints[user.id]?.badgeCount ?? 0

  return (
    <HomeClient
      userName={profile?.full_name ?? 'Student'}
      passedIds={passedIds}
      progress={progress}
      leaderboard={lbSorted}
      currentUserRank={currentUserRank}
      currentUserPoints={currentUserPoints}
      currentUserBadges={currentUserBadges}
      latestVideos={latestVideos ?? []}
    />
  )
}
