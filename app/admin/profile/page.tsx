import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminProfileClient from './ProfileClient'

export default async function AdminProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  async function handleLogout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="CyberSense" style={{ width: '140px', objectFit: 'contain' }} />
        </div>
        <nav className="nav-menu">
          <a href="/admin/dashboard" className="nav-item"><div className="icon-box"><i className="fa-solid fa-chart-pie" /></div><span>DASHBOARD</span></a>
          <a href="/admin/users" className="nav-item"><div className="icon-box"><i className="fa-solid fa-users" /></div><span>USERS</span></a>
          <a href="/admin/modules" className="nav-item"><div className="icon-box"><i className="fa-solid fa-microchip" /></div><span>MODULES</span></a>
          <a href="/admin/videos" className="nav-item"><div className="icon-box"><i className="fa-solid fa-play-circle" /></div><span>VIDEOS</span></a>
          <div className="nav-section-title">SYSTEM</div>
          <a href="/admin/profile" className="nav-item active"><div className="icon-box"><i className="fa-solid fa-user" /></div><span>PROFILE</span></a>
        </nav>
        <div className="sidebar-footer" style={{ padding: '20px', textAlign: 'center' }}>
          <form action={handleLogout}>
            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-red)', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px', fontFamily: 'Orbitron' }}>
              <i className="fa-solid fa-right-from-bracket" /> SIGN OUT
            </button>
          </form>
        </div>
      </aside>

      <main className="main-content">
        <h1 style={{ fontFamily: 'Orbitron', color: 'var(--neon-blue)', marginBottom: '40px' }}>ADMIN PROFILE</h1>

        <AdminProfileClient
          userId={user.id}
          fullName={profile?.full_name ?? ''}
          email={user.email ?? ''}
          avatarUrl={profile?.avatar_url ?? null}
          bio={profile?.bio ?? ''}
          contactEmail={profile?.contact_email ?? ''}
        />
      </main>
    </div>
  )
}
