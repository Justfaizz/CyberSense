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
    { data: lbScores },
    { data: lbProfiles },
    { data: latestVideos },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('modules').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('user_scores').select('module_id').eq('user_id', user.id).eq('passed', true),
    supabase.from('user_scores').select('user_id, module_id').eq('passed', true).limit(1000),
    supabase.from('profiles').select('id, full_name'),
    supabase
      .from('videos')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const passedIds = [...new Set((passedRows ?? []).map(r => r.module_id))]
  const progress = totalModules ? Math.round((passedIds.length / totalModules) * 100) : 0

  // Build profile name lookup
  const profileMap: Record<string, string> = {}
  for (const p of (lbProfiles ?? [])) {
    if (p.full_name) profileMap[p.id] = p.full_name
  }

  // Aggregate distinct modules completed per user
  const userModules: Record<string, { full_name: string; completed: Set<number> }> = {}
  for (const row of (lbScores ?? [])) {
    const name = profileMap[row.user_id]
    if (!name) continue
    if (!userModules[row.user_id]) userModules[row.user_id] = { full_name: name, completed: new Set() }
    userModules[row.user_id].completed.add(row.module_id)
  }

  const allRanked = Object.entries(userModules)
    .map(([uid, d]) => ({ uid, full_name: d.full_name, modulesCompleted: d.completed.size }))
    .sort((a, b) => b.modulesCompleted - a.modulesCompleted)

  const lbSorted        = allRanked.slice(0, 10)
  const currentUserRankIdx = allRanked.findIndex(u => u.uid === user.id)
  const currentUserRank    = currentUserRankIdx >= 0 ? currentUserRankIdx + 1 : allRanked.length + 1
  const currentUserModules = userModules[user.id]?.completed.size ?? 0

  return (
    <HomeClient
      userName={profile?.full_name ?? 'Student'}
      passedIds={passedIds}
      progress={progress}
      leaderboard={lbSorted}
      currentUserRank={currentUserRank}
      currentUserModules={currentUserModules}
      totalModules={totalModules ?? 0}
      latestVideos={latestVideos ?? []}
    />
  )
}
