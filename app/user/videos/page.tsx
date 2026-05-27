import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VideosClient from './VideosClient'

export default async function UserVideosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).single()

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return <VideosClient videos={videos ?? []} userName={profile?.full_name ?? 'Student'} />
}
