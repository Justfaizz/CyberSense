import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ModulesClient from './ModulesClient'

export default async function AdminModulesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: modules } = await supabase
    .from('modules').select('*').order('id')

  return <ModulesClient initialModules={modules ?? []} />
}
