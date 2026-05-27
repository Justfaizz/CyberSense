import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VideosClient from './VideosClient'

export default async function AdminVideosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  return <VideosClient initialVideos={videos ?? []} />
}
