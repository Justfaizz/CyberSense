import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: scoreSummary } = await supabase
    .from('user_scores')
    .select('user_id, percentage')

  const statsMap: Record<string, { attempts: number; avg: number }> = {}
  for (const s of scoreSummary ?? []) {
    if (!statsMap[s.user_id]) statsMap[s.user_id] = { attempts: 0, avg: 0 }
    statsMap[s.user_id].attempts++
    statsMap[s.user_id].avg += Number(s.percentage)
  }
  Object.values(statsMap).forEach(v => { if (v.attempts > 0) v.avg = Math.round(v.avg / v.attempts) })

  const users = (profiles ?? []).map(p => ({
    ...p,
    attempts: statsMap[p.id]?.attempts ?? 0,
    avg: statsMap[p.id]?.avg ?? 0,
  }))

  return <UsersClient initialUsers={users} />
}
