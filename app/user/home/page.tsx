import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'
import { getCachedLbScores, getCachedProfiles, getCachedModuleCount, getCachedLatestVideos } from '@/lib/cache'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // User-specific query runs live; shared data comes from cache (60 s)
  const [
    { data: profile },
    { data: passedRows },
    totalModules,
    lbScores,
    lbProfiles,
    latestVideos,
  ] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('user_scores').select('module_id').eq('user_id', user.id).eq('passed', true),
    getCachedModuleCount(),
    getCachedLbScores(),
    getCachedProfiles(),
    getCachedLatestVideos(),
  ])

  const passedIds = [...new Set((passedRows ?? []).map(r => r.module_id))]
  const progress = totalModules ? Math.round((passedIds.length / totalModules) * 100) : 0

  // Build profile name lookup
  const profileMap: Record<string, string> = {}
  for (const p of lbProfiles) {
    if (p.full_name) profileMap[p.id] = p.full_name
  }

  // Aggregate distinct modules completed per user
  const userModules: Record<string, { full_name: string; completed: Set<number> }> = {}
  for (const row of lbScores) {
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
      totalModules={totalModules}
      latestVideos={latestVideos}
    />
  )
}
