import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Metrics
  const { count: totalStudents } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')

  const { data: avgData } = await supabase.from('user_scores').select('percentage')
  const avgScore = avgData?.length
    ? Math.round(avgData.reduce((a, r) => a + Number(r.percentage), 0) / avgData.length)
    : 0

  // Recent activity
  const { data: activity } = await supabase
    .from('user_scores')
    .select('*, profiles!inner(full_name)')
    .order('completed_at', { ascending: false })
    .limit(10)

  // Leaderboard
  const { data: allScores } = await supabase
    .from('user_scores')
    .select('user_id, percentage, profiles!inner(full_name)')
    .eq('percentage', 100)
    .limit(200)

  const lbMap: Record<string, { full_name: string; count: number }> = {}
  for (const row of allScores ?? []) {
    const p = row.profiles as unknown as { full_name: string }
    if (!lbMap[row.user_id]) lbMap[row.user_id] = { full_name: p.full_name, count: 0 }
    lbMap[row.user_id].count++
  }
  const leaderboard = Object.values(lbMap).sort((a, b) => b.count - a.count).slice(0, 10)

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
          <a href="/admin/dashboard" className="nav-item active">
            <div className="icon-box"><i className="fa-solid fa-chart-pie" /></div><span>DASHBOARD</span>
          </a>
          <a href="/admin/users" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-users" /></div><span>USERS</span>
          </a>
          <a href="/admin/modules" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-microchip" /></div><span>MODULES</span>
          </a>
          <div className="nav-section-title">SYSTEM</div>
          <a href="/admin/profile" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-user" /></div><span>PROFILE</span>
          </a>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontFamily: 'Orbitron', color: 'var(--neon-blue)', letterSpacing: '1px', textTransform: 'uppercase' }}>ADMIN COMMAND</h1>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}><i className="fa-solid fa-user-shield" /> System Administrator</div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ flex: 1, padding: '30px', display: 'flex', alignItems: 'center', gap: '25px', borderLeft: '4px solid var(--neon-blue)' }}>
            <i className="fa-solid fa-user-astronaut" style={{ fontSize: '3rem', color: 'var(--neon-blue)' }} />
            <div>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: '2.5rem', color: 'white', margin: 0, lineHeight: 1 }}>{totalStudents ?? 0}</h2>
              <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', marginTop: '5px' }}>Registered Cadets</p>
            </div>
          </div>
          <div className="glass-card" style={{ flex: 1, padding: '30px', display: 'flex', alignItems: 'center', gap: '25px', borderLeft: '4px solid var(--neon-purple)' }}>
            <i className="fa-solid fa-crosshairs" style={{ fontSize: '3rem', color: 'var(--neon-purple)' }} />
            <div>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: '2.5rem', color: 'white', margin: 0, lineHeight: 1 }}>{avgScore}%</h2>
              <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', marginTop: '5px' }}>University Avg. Score</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          {/* Leaderboard */}
          <div className="glass-card" style={{ flex: 1, minWidth: '280px', padding: '30px', borderTop: '4px solid var(--neon-green)' }}>
            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--neon-green)', fontSize: '1.2rem', marginBottom: '20px' }}>
              <i className="fa-solid fa-trophy" /> TOP DEFENDERS
            </h3>
            {leaderboard.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No perfect scores yet.</p>
            ) : leaderboard.map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed #333' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--neon-green)', fontFamily: 'Orbitron', fontWeight: 'bold', fontSize: '1.2rem' }}>#{i + 1}</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{u.full_name}</span>
                </div>
                <div style={{ color: 'var(--neon-purple)', fontFamily: 'Orbitron', fontWeight: 'bold' }}>
                  <i className="fa-solid fa-star" /> {u.count}
                </div>
              </div>
            ))}
          </div>

          {/* Live transmissions */}
          <div className="glass-card" style={{ flex: 2, minWidth: '400px', padding: '30px' }}>
            <h3 style={{ fontFamily: 'Orbitron', color: 'white', fontSize: '1.2rem', marginBottom: '20px' }}>
              <i className="fa-solid fa-satellite-dish" style={{ color: 'var(--neon-blue)' }} /> LIVE TRANSMISSIONS
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr><th>Agent</th><th>Module</th><th>Score</th><th>Status</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {!activity || activity.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No activity yet.</td></tr>
                  ) : activity.map((a) => {
                    const p = (a.profiles as unknown as { full_name: string })
                    return (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{p.full_name}</td>
                        <td><span style={{ color: 'var(--neon-blue)' }}><i className="fa-solid fa-microchip" /> Mod {a.module_id}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{a.score} pts ({a.percentage}%)</td>
                        <td><span className={`status-badge ${a.passed ? 'status-pass' : 'status-fail'}`}>{a.passed ? 'PASSED' : 'FAILED'}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(a.completed_at).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
