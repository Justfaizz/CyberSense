import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  // Get attempt counts per user
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
          <a href="/admin/users" className="nav-item active"><div className="icon-box"><i className="fa-solid fa-users" /></div><span>USERS</span></a>
          <a href="/admin/modules" className="nav-item"><div className="icon-box"><i className="fa-solid fa-microchip" /></div><span>MODULES</span></a>
          <div className="nav-section-title">SYSTEM</div>
          <a href="/admin/profile" className="nav-item"><div className="icon-box"><i className="fa-solid fa-user" /></div><span>PROFILE</span></a>
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
        <h1 style={{ fontFamily: 'Orbitron', color: 'var(--neon-blue)', marginBottom: '30px' }}>REGISTERED CADETS</h1>

        <div className="glass-card" style={{ padding: '30px', overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Joined</th>
                <th>Attempts</th>
                <th>Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {!users || users.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No students registered yet.</td></tr>
              ) : users.map(u => {
                const stats = statsMap[u.id] ?? { attempts: 0, avg: 0 }
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>
                      <i className="fa-solid fa-user-astronaut" style={{ color: 'var(--neon-blue)', marginRight: '10px' }} />
                      {u.full_name}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron' }}>{stats.attempts}</td>
                    <td>
                      <span style={{ color: stats.avg >= 80 ? '#00ff66' : stats.avg >= 50 ? 'var(--neon-blue)' : '#ff003c', fontFamily: 'Orbitron', fontWeight: 'bold' }}>
                        {stats.attempts > 0 ? `${stats.avg}%` : '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
