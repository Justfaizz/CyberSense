/**
 * Shared cached queries for CyberSense.
 *
 * Uses Next.js unstable_cache so one DB round-trip is shared across all
 * concurrent users for the duration of the revalidation window.
 * This is the primary free-tier connection-pool optimisation.
 */
import { unstable_cache } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function getAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Service role bypasses RLS — safe because cache.ts is server-only
function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** Leaderboard scores — all passed attempts, max 500 rows, cached 60 s */
export const getCachedLbScores = unstable_cache(
  async () => {
    const supabase = getServiceClient()
    const { data } = await supabase
      .from('user_scores')
      .select('user_id, module_id, time_taken')
      .eq('passed', true)
      .limit(500)
    return data ?? []
  },
  ['lb-scores'],
  { revalidate: 60 }
)

/** All profiles (id + full_name + institution), max 500 rows, cached 60 s */
export const getCachedProfiles = unstable_cache(
  async () => {
    const supabase = getServiceClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, institution')
      .limit(500)
    return data ?? []
  },
  ['profiles-lb'],
  { revalidate: 60 }
)

/** Active module count, cached 5 min (rarely changes) */
export const getCachedModuleCount = unstable_cache(
  async () => {
    const supabase = getAnonClient()
    const { count } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    return count ?? 0
  },
  ['module-count'],
  { revalidate: 300 }
)

/** Admin avg score across all users, cached 60 s */
export const getCachedAvgScore = unstable_cache(
  async () => {
    const supabase = getAnonClient()
    const { data } = await supabase
      .from('user_scores')
      .select('percentage')
      .limit(1000)
    if (!data?.length) return 0
    return Math.round(data.reduce((a, r) => a + Number(r.percentage), 0) / data.length)
  },
  ['avg-score'],
  { revalidate: 60 }
)

/** Latest active videos, cached 5 min */
export const getCachedLatestVideos = unstable_cache(
  async () => {
    const supabase = getAnonClient()
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3)
    return data ?? []
  },
  ['latest-videos'],
  { revalidate: 300 }
)
