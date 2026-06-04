import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateBadges } from '@/lib/badges'
import Link from 'next/link'

export default async function PublicProfilePage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const targetId = params.userId

  const [
    { data: targetProfile },
    { data: targetScores },
    { data: activeModules },
    { count: totalModules },
    { data: lbScores },
    { data: lbProfiles },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, institution, bio, avatar_url').eq('id', targetId).single(),
    supabase.from('user_scores').select('*').eq('user_id', targetId).order('completed_at', { ascending: false }),
    supabase.from('modules').select('id, title, game_mode').eq('status', 'active').order('id'),
    supabase.from('modules').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('user_scores').select('user_id, module_id').eq('passed', true).limit(2000),
    supabase.from('profiles').select('id, full_name'),
  ])

  if (!targetProfile) notFound()

  const profileMap: Record<string, string> = {}
  for (const p of (lbProfiles ?? [])) { if (p.full_name) profileMap[p.id] = p.full_name }

  const userModules: Record<string, Set<number>> = {}
  for (const row of (lbScores ?? [])) {
    if (!profileMap[row.user_id]) continue
    if (!userModules[row.user_id]) userModules[row.user_id] = new Set()
    userModules[row.user_id].add(row.module_id)
  }

  const allRanked = Object.entries(userModules)
    .map(([uid, s]) => ({ uid, count: s.size }))
    .sort((a, b) => b.count - a.count)

  const rankIdx = allRanked.findIndex(u => u.uid === targetId)
  const globalRank = rankIdx >= 0 ? rankIdx + 1 : null
  const modulesCompleted = userModules[targetId]?.size ?? 0
  const total = totalModules ?? 0

  const BADGES = generateBadges(activeModules ?? [])
  const badgeStates = BADGES.map(b => {
    if (b.id === 'elite') {
      const moduleIds = (activeModules ?? []).map(m => m.id)
      const allPassed = moduleIds.every(mid => targetScores?.some(s => s.module_id === mid && s.passed))
      return { ...b, unlocked: allPassed }
    }
    const passed = targetScores?.some(s => s.module_id === b.moduleId && s.passed) ?? false
    return { ...b, unlocked: passed }
  })

  const passedCount = (targetScores ?? []).filter(s => s.passed).length

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
          <a href="/user/videos" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-play-circle" /></div><span>VIDEOS</span>
          </a>
          <a href="/user/leaderboard" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-trophy" /></div><span>LEADERBOARD</span>
          </a>
          <div className="nav-section-title">ACCOUNT</div>
          <a href="/user/profile" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-user" /></div><span>PROFILE</span>
          </a>
        </nav>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <Link href="/user/leaderboard" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-blue)', marginRight: '25px', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }}>
            <i className="fa-solid fa-arrow-left" /> Back to Leaderboard
          </Link>
          <a href="/user/profile" className="profile-circle" style={{ textDecoration: 'none' }}>
            <i className="fa-solid fa-user" />
          </a>
        </div>

        <h1 className="page-title" style={{ color: 'var(--neon-blue)' }}>AGENT PROFILE</h1>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {/* Profile card */}
          <div className="glass-card" style={{ flex: 1, minWidth: '240px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(196,144,228,0.1)', border: '2px solid var(--neon-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              <i className="fa-solid fa-user" style={{ color: 'var(--neon-purple)' }} />
            </div>
            <div style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: 'white' }}>{targetProfile.full_name}</div>
            {targetProfile.institution && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-building-columns" style={{ marginRight: '8px', color: 'var(--neon-blue)' }} />
                {targetProfile.institution}
              </div>
            )}
            {targetProfile.bio && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '8px', fontFamily: 'Montserrat,sans-serif' }}>
                {targetProfile.bio}
              </p>
            )}
          </div>

          {/* Stats */}
          <div style={{ flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { label: 'Global Rank', value: globalRank ? `#${globalRank}` : '—', color: 'var(--neon-purple)' },
              { label: 'Modules Completed', value: `${modulesCompleted}/${total}`, color: 'var(--neon-blue)' },
              { label: 'Modules Passed', value: passedCount, color: 'var(--neon-green)' },
            ].map(stat => (
              <div key={stat.label} className="glass-card" style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${stat.color}` }}>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>{stat.label}</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: '2rem', color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="section-container">
          <h3 className="section-label" style={{ color: 'var(--neon-blue)' }}>ACHIEVEMENTS</h3>
          <div className="badge-grid">
            {badgeStates.map(b => (
              <div
                key={b.id}
                className={`badge-card ${b.unlocked ? 'unlocked' : 'locked'}`}
                style={b.unlocked ? { borderColor: b.color, boxShadow: `0 0 20px ${b.color}30` } : {}}
              >
                <i className={`fa-solid ${b.icon} badge-icon${b.unlocked ? ' badge-glow' : ''}`} style={{ color: b.unlocked ? b.color : '#555' }} />
                <span className="badge-name">{b.name}</span>
                <span className="badge-module">{b.module}</span>
                <span className="badge-status">{b.unlocked ? '◉ UNLOCKED' : `◉ LOCKED`}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
