import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const GAME_ROUTES: Record<string, string> = {
  chat:    '/user/chat-simulator',
  sorter:  '/user/rapid-sorter',
  defense: '/user/network-defense',
}

const GAME_ICONS: Record<string, string> = {
  chat:    'fa-comments',
  sorter:  'fa-layer-group',
  defense: 'fa-network-wired',
}

export default async function LearningPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  // Active modules
  const { data: modules } = await supabase
    .from('modules').select('*').eq('status', 'active').order('id')

  // Passed module IDs
  const { data: passedRows } = await supabase
    .from('user_scores').select('module_id').eq('user_id', user.id).eq('passed', true)
  const passedIds = [...new Set((passedRows ?? []).map(r => r.module_id))]

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
          <a href="/user/home" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-house" /></div><span>HOME</span>
          </a>
          <a href="/user/learning" className="nav-item active">
            <div className="icon-box"><i className="fa-solid fa-book" /></div><span>LEARN</span>
          </a>
          <a href="/user/videos" className="nav-item">
            <div className="icon-box"><i className="fa-solid fa-play-circle" /></div><span>VIDEOS</span>
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
          <a href="/user/profile" className="profile-circle" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-user" />
          </a>
        </div>

        <h1 className="page-title" style={{ color: 'var(--neon-blue)' }}>TRAINING MODULES</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', textAlign: 'center' }}>
          You must achieve 100% on a module to unlock the next level.
        </p>

        <div className="section-container">
          {!modules || modules.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderColor: 'var(--text-muted)' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#666', marginBottom: '20px', display: 'block' }} />
              <h3 style={{ color: 'white', fontFamily: 'Orbitron' }}>NO ACTIVE MODULES</h3>
              <p style={{ color: '#888' }}>The Admin has not published any modules yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {modules.map((mod, index) => {
                const isUnlocked = index === 0 || passedIds.includes(modules[index - 1].id)
                const isPassed   = passedIds.includes(mod.id)
                const route      = GAME_ROUTES[mod.game_mode] ?? '/user/home'
                const icon       = GAME_ICONS[mod.game_mode] ?? 'fa-gamepad'

                return (
                  <div key={mod.id} className={`glass-card${!isUnlocked ? ' locked-card' : ''}`} style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <div style={{ fontSize: '3rem', color: 'var(--neon-purple)', width: '60px', textAlign: 'center' }}>
                      <i className={`fa-solid ${isUnlocked ? icon : 'fa-lock'}`} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'Orbitron', color: 'white', marginBottom: '5px' }}>
                        Module {index + 1}: {mod.title}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>{mod.description}</p>
                      {isPassed && (
                        <span className="status-badge status-pass"><i className="fa-solid fa-check" /> PASSED</span>
                      )}
                    </div>
                    {isUnlocked ? (
                      <Link href={`${route}?module_id=${mod.id}`} className="login-btn" style={{ textDecoration: 'none', padding: '12px 30px' }}>
                        {isPassed ? 'REPLAY' : 'START'}
                      </Link>
                    ) : (
                      <span style={{ color: '#555', fontFamily: 'Orbitron', fontSize: '0.8rem' }}>LOCKED</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
