import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: scores }  = await supabase.from('user_scores').select('*').eq('user_id', user.id).order('completed_at', { ascending: false })

  const totalAttempts = scores?.length ?? 0
  const passedCount   = scores?.filter(s => s.passed).length ?? 0
  const avgScore      = scores?.length ? Math.round(scores.reduce((a, s) => a + s.percentage, 0) / scores.length) : 0

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
          <a href="/user/home" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-house" /></div><span>HOME</span>
          </a>
          <a href="/user/learning" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-book" /></div><span>LEARN</span>
          </a>
          <div className="nav-section-title">ACCOUNT</div>
          <a href="/user/profile" className="nav-item active">
            <div className="icon-box"><i className="fa-solid fa-user" /></div><span>PROFILE</span>
          </a>
        </nav>
        <div className="sidebar-footer">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            STUDENT:<br />
            <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{profile?.full_name}</span>
          </span>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <form action={handleLogout}>
            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff003c', marginRight: '25px', fontWeight: 'bold', fontSize: '0.9rem' }}>
              <i className="fa-solid fa-right-from-bracket" /> LOGOUT
            </button>
          </form>
        </div>

        <h1 className="page-title" style={{ color: 'var(--neon-blue)' }}>AGENT PROFILE</h1>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {/* Profile card */}
          <div className="glass-card" style={{ flex: 1, minWidth: '280px', padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0,240,255,0.1)', border: '2px solid var(--neon-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="fa-solid fa-user" style={{ fontSize: '3rem', color: 'var(--neon-blue)' }} />
            </div>
            <h2 style={{ fontFamily: 'Orbitron', color: 'white', marginBottom: '8px' }}>{profile?.full_name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '5px' }}>{user.email}</p>
            <span className="status-badge" style={{ background: 'rgba(196,144,228,0.1)', color: 'var(--neon-purple)', border: '1px solid var(--neon-purple)' }}>
              STUDENT
            </span>
          </div>

          {/* Stats */}
          <div style={{ flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { label: 'Total Attempts', value: totalAttempts, color: 'var(--neon-blue)' },
              { label: 'Modules Passed', value: passedCount, color: 'var(--neon-green)' },
              { label: 'Average Score', value: `${avgScore}%`, color: 'var(--neon-purple)' },
            ].map(stat => (
              <div key={stat.label} className="glass-card" style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${stat.color}` }}>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>{stat.label}</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: '2rem', color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score history */}
        <div className="section-container">
          <h3 className="section-label" style={{ color: 'var(--neon-purple)' }}>MISSION HISTORY</h3>
          <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
            {!scores || scores.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No missions completed yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Module</th><th>Score</th><th>Percentage</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map(s => (
                    <tr key={s.id}>
                      <td><i className="fa-solid fa-microchip" style={{ color: 'var(--neon-blue)' }} /> Mod {s.module_id}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.score}/{s.total_questions}</td>
                      <td>{s.percentage}%</td>
                      <td><span className={`status-badge ${s.passed ? 'status-pass' : 'status-fail'}`}>{s.passed ? 'PASSED' : 'FAILED'}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(s.completed_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
