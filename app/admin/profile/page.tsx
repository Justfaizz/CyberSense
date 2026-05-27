import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
        <div className="sidebar-header"><h2 className="glow-text">CYBERSENSE</h2></div>
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

        <div className="glass-card" style={{ padding: '40px', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0,240,255,0.1)', border: '2px solid var(--neon-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
            <i className="fa-solid fa-user-shield" style={{ fontSize: '3rem', color: 'var(--neon-blue)' }} />
          </div>
          <h2 style={{ fontFamily: 'Orbitron', color: 'white', marginBottom: '8px' }}>{profile?.full_name}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>{user.email}</p>
          <span className="status-badge" style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--neon-blue)', border: '1px solid var(--neon-blue)' }}>
            SYSTEM ADMINISTRATOR
          </span>
        </div>
      </main>
    </div>
  )
}
