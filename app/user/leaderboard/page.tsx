import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getCachedLbScores, getCachedProfiles, getCachedModuleCount } from '@/lib/cache'

async function handleLogout() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    totalModules,
    lbScores,
    lbProfiles,
  ] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    getCachedModuleCount(),
    getCachedLbScores(),
    getCachedProfiles(),
  ])

  const profileMap: Record<string, { full_name: string; institution: string }> = {}
  for (const p of lbProfiles) {
    if (p.full_name) profileMap[p.id] = { full_name: p.full_name, institution: p.institution ?? '' }
  }

  const userModules: Record<string, { full_name: string; institution: string; completed: Set<number>; bestTimes: Record<number, number> }> = {}
  for (const row of lbScores) {
    const prof = profileMap[row.user_id]
    if (!prof) continue
    if (!userModules[row.user_id]) userModules[row.user_id] = { ...prof, completed: new Set(), bestTimes: {} }
    const entry = userModules[row.user_id]
    entry.completed.add(row.module_id)
    const t = (row as { time_taken?: number | null }).time_taken ?? Infinity
    if (entry.bestTimes[row.module_id] === undefined || t < entry.bestTimes[row.module_id]) {
      entry.bestTimes[row.module_id] = t
    }
  }

  const allRanked = Object.entries(userModules)
    .map(([uid, d]) => {
      const totalTime = Object.values(d.bestTimes).reduce((sum, t) => sum + (isFinite(t) ? t : 0), 0)
      const hasTime = Object.values(d.bestTimes).some(t => isFinite(t))
      return { uid, full_name: d.full_name, institution: d.institution, modulesCompleted: d.completed.size, totalTime, hasTime }
    })
    .sort((a, b) => {
      if (b.modulesCompleted !== a.modulesCompleted) return b.modulesCompleted - a.modulesCompleted
      if (a.hasTime && !b.hasTime) return -1
      if (!a.hasTime && b.hasTime) return 1
      return a.totalTime - b.totalTime
    })

  const currentUserIdx = allRanked.findIndex(u => u.uid === user.id)
  const currentUserRank = currentUserIdx >= 0 ? currentUserIdx + 1 : allRanked.length + 1
  const total = totalModules

  const MEDALS = ['🥇', '🥈', '🥉']

  function formatTime(seconds: number): string {
    if (!seconds) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header"><a href="/" style={{ textDecoration: 'none' }}><h2 className="glow-text">CYBERSENSE</h2></a></div>
        <nav className="nav-menu">
          <a href="/user/home" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-house" /></div><span>HOME</span>
          </a>
          <a href="/user/learning" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-book" /></div><span>LEARN</span>
          </a>
          <a href="/user/videos" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-play-circle" /></div><span>VIDEOS</span>
          </a>
          <a href="/user/leaderboard" className="nav-item active">
            <div className="icon-box"><i className="fa-solid fa-trophy" /></div><span>LEADERBOARD</span>
          </a>
          <div className="nav-section-title">ACCOUNT</div>
          <a href="/user/profile" className="nav-item">
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
          <a href="/user/profile" className="profile-circle" style={{ textDecoration: 'none' }}>
            <i className="fa-solid fa-user" />
          </a>
        </div>

        <h1 className="page-title" style={{ color: 'var(--neon-blue)' }}>LEADERBOARD</h1>

        {currentUserIdx >= 0 && (
          <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', borderLeft: '4px solid var(--neon-purple)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <i className="fa-solid fa-ranking-star" style={{ color: 'var(--neon-purple)', fontSize: '1.4rem' }} />
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Your Rank</span>
              <div style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', color: 'var(--neon-purple)' }}>
                #{currentUserRank}
                <span style={{ fontFamily: 'Montserrat', fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '12px', fontWeight: 600 }}>
                  {allRanked[currentUserIdx]?.modulesCompleted ?? 0}/{total} modules
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
          {allRanked.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No scores yet. Be the first to complete a module!</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Student</th>
                  <th>Institution</th>
                  <th>Progress</th>
                  <th style={{ textAlign: 'right' }}>Modules</th>
                  <th style={{ textAlign: 'right' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {allRanked.map((entry, i) => {
                  const isMe = entry.uid === user.id
                  return (
                    <tr key={entry.uid} style={isMe ? { background: 'rgba(196,144,228,0.08)', outline: '1px solid rgba(196,144,228,0.25)' } : {}}>
                      <td style={{ fontFamily: 'Orbitron', color: i < 3 ? 'var(--neon-purple)' : 'var(--text-muted)' }}>
                        {MEDALS[i] ?? `#${i + 1}`}
                      </td>
                      <td>
                        <Link href={`/user/profile/${entry.uid}`} style={{ color: isMe ? 'var(--neon-blue)' : 'white', textDecoration: 'none', fontWeight: isMe ? 700 : 400 }}>
                          {entry.full_name}{isMe ? ' (You)' : ''}
                        </Link>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{entry.institution || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {Array.from({ length: total }, (_, idx) => (
                            <i key={idx} className="fa-solid fa-shield-halved" style={{ color: idx < entry.modulesCompleted ? 'var(--neon-blue)' : '#333', fontSize: '0.75rem' }} />
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'Orbitron', fontSize: '0.9rem', color: 'var(--neon-blue)' }}>
                        {entry.modulesCompleted}/{total}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'Orbitron', fontSize: '0.85rem', color: 'var(--neon-purple)' }}>
                        {entry.hasTime ? formatTime(entry.totalTime) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
