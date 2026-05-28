'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TextScramble } from '@/components/ui/text-scramble'
import type { Video } from '@/lib/types'

interface Props {
  userName: string
  passedIds: number[]
  progress: number
  leaderboard: { full_name: string; modulesCompleted: number }[]
  currentUserRank: number
  currentUserModules: number
  totalModules: number
  latestVideos: Video[]
}

const CATEGORY_COLORS: Record<string, string> = {
  cyberbullying: 'var(--neon-red)',
  phishing: 'var(--neon-purple)',
  account_security: 'var(--neon-blue)',
  general_safety: 'var(--neon-green)',
}

const CATEGORY_LABELS: Record<string, string> = {
  cyberbullying: 'CYBERBULLYING',
  phishing: 'PHISHING',
  account_security: 'ACCOUNT SECURITY',
  general_safety: 'GENERAL SAFETY',
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const QUOTES = [
  { text: '"Your mental health is more important than feeding a troll."', author: 'Cybersense Defense' },
  { text: '"Online harassment has real-world consequences. Protect your digital peace."', author: 'Anti-Cyberbullying Initiative' },
  { text: '"Stop. Breathe. Think before you click or reply to hate."', author: 'Digital Awareness' },
  { text: '"In the digital realm, your privacy settings are your best shield against bullies."', author: 'InfoSec Team' },
  { text: '"A strong password keeps out hackers; a strong boundary keeps out bullies."', author: 'Cybersense' },
]

const CYBER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>[]{}|/\\'

export default function HomeClient({ userName, passedIds, progress, leaderboard, currentUserRank, currentUserModules, totalModules, latestVideos }: Props) {
  const router = useRouter()
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [trigger, setTrigger] = useState(true)
  const [authorVisible, setAuthorVisible] = useState(false)
  const [expandedVideoId, setExpandedVideoId] = useState<number | null>(null)

  const mod2Unlocked = passedIds.includes(1)
  const mod3Unlocked = passedIds.includes(2)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleScrambleComplete = useCallback(() => {
    setAuthorVisible(true)
    setTimeout(() => {
      setAuthorVisible(false)
      setTimeout(() => {
        setQuoteIndex(prev => (prev + 1) % QUOTES.length)
        setTrigger(false)
        setTimeout(() => setTrigger(true), 50)
      }, 500)
    }, 4000)
  }, [])

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header"><h2 className="glow-text">CYBERSENSE</h2></div>
        <nav className="nav-menu">
          <a href="/user/home" className="nav-item active">
            <div className="icon-box"><i className="fa-solid fa-house" /></div><span>HOME</span>
          </a>
          <a href="/user/learning" className="nav-item">
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
            <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{userName}</span>
          </span>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="top-bar">
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff003c', marginRight: '25px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-right-from-bracket" /> LOGOUT
          </button>
          <a href="/user/profile" className="profile-circle" style={{ textDecoration: 'none' }}>
            <i className="fa-solid fa-user" />
          </a>
        </div>

        <h1 className="page-title" style={{ color: 'var(--neon-blue)' }}>DASHBOARD</h1>

        {/* Quote */}
        <div className="quote-card">
          <TextScramble
            as="p"
            trigger={trigger}
            onScrambleComplete={handleScrambleComplete}
            duration={1.5}
            speed={0.03}
            characterSet={CYBER_CHARS}
            style={{ color: 'white', fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', lineHeight: 1.7, marginBottom: '12px', minHeight: '1.7em' }}
          >
            {QUOTES[quoteIndex].text}
          </TextScramble>
          <span style={{
            color: 'var(--neon-purple)',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.85rem',
            opacity: authorVisible ? 1 : 0,
            transition: 'opacity 0.5s ease',
            display: 'block',
          }}>
            — {QUOTES[quoteIndex].author}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {/* Quick Learn */}
          <div style={{ flex: 2, minWidth: '300px' }}>
            <h3 className="section-label" style={{ color: 'var(--neon-purple)' }}>QUICK LEARN</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="/user/chat-simulator?module_id=1" className="module-card" style={{ border: '1px solid var(--neon-blue)', flex: 1, textAlign: 'center', padding: '20px', borderRadius: '10px' }}>
                <i className="fa-solid fa-comments" style={{ color: 'var(--neon-blue)', fontSize: '2rem', marginBottom: '10px', display: 'block' }} />
                <span style={{ display: 'block', color: 'white', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '0.8rem' }}>Mod 1: Harassment Sim</span>
              </a>

              <a href={mod2Unlocked ? '/user/rapid-sorter?module_id=2' : '#'} className={`module-card${!mod2Unlocked ? ' locked-card' : ''}`} style={{ border: '1px solid var(--neon-purple)', flex: 1, textAlign: 'center', padding: '20px', borderRadius: '10px' }}>
                <i className={`fa-solid ${mod2Unlocked ? 'fa-layer-group' : 'fa-lock'}`} style={{ color: 'var(--neon-purple)', fontSize: '2rem', marginBottom: '10px', display: 'block' }} />
                <span style={{ display: 'block', color: 'white', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '0.8rem' }}>Mod 2: Threat Sorter</span>
              </a>

              <a href={mod3Unlocked ? '/user/network-defense?module_id=3' : '#'} className={`module-card${!mod3Unlocked ? ' locked-card' : ''}`} style={{ border: '1px solid var(--neon-green)', flex: 1, textAlign: 'center', padding: '20px', borderRadius: '10px' }}>
                <i className={`fa-solid ${mod3Unlocked ? 'fa-network-wired' : 'fa-lock'}`} style={{ color: 'var(--neon-green)', fontSize: '2rem', marginBottom: '10px', display: 'block' }} />
                <span style={{ display: 'block', color: 'white', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '0.8rem' }}>Mod 3: Social Defense</span>
              </a>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-card" style={{ flex: 1, minWidth: '250px', padding: '20px', borderColor: 'var(--neon-purple)' }}>
            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--neon-purple)', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <i className="fa-solid fa-trophy" /> TOP DEFENDERS
            </h3>
            {leaderboard.length === 0 ? (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>No scores yet.</p>
            ) : (
              <>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'white' }}>
                  {leaderboard.map((entry, i) => {
                    const medals = ['🥇', '🥈', '🥉']
                    const rank = medals[i] ?? `${i + 1}`
                    const shields = Array.from({ length: totalModules }, (_, idx) =>
                      idx < entry.modulesCompleted
                        ? <i key={idx} className="fa-solid fa-shield-halved" style={{ color: 'var(--neon-blue)', fontSize: '0.75rem' }} />
                        : <i key={idx} className="fa-solid fa-shield-halved" style={{ color: '#333', fontSize: '0.75rem' }} />
                    )
                    return (
                      <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #222', fontSize: '0.88rem' }}>
                        <span>{rank} {entry.full_name}</span>
                        <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {shields}
                          <span style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron', fontSize: '0.78rem', marginLeft: '6px' }}>{entry.modulesCompleted}/{totalModules}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--neon-purple)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--neon-blue)', fontFamily: 'Orbitron', fontSize: '0.75rem' }}>
                  <span>▶ YOU: #{currentUserRank}</span>
                  <span>{currentUserModules}/{totalModules} modules</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="section-container">
          <h3 className="section-label" style={{ color: 'var(--neon-purple)' }}>OVERALL SA PROGRESS</h3>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div className="progress-wrapper">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-labels">
                <span style={{ color: 'var(--text-muted)' }}>Current Progress</span>
                <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Watch */}
        {latestVideos.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 className="section-label" style={{ color: 'var(--neon-blue)', margin: 0 }}>QUICK WATCH</h3>
              <a href="/user/videos" style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron', fontSize: '0.78rem', textDecoration: 'none', letterSpacing: '1px' }}>
                VIEW ALL →
              </a>
            </div>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {latestVideos.map(v => {
                const isExpanded = expandedVideoId === v.id
                const color = CATEGORY_COLORS[v.category]
                return (
                  <div key={v.id} className="glass-card" style={{
                    flex: '1 1 200px', minWidth: '200px', maxWidth: '300px',
                    padding: 0, overflow: 'hidden',
                    border: `1px solid ${isExpanded ? color : 'var(--glass-border)'}`,
                    transition: 'border-color 0.3s',
                  }}>
                    {isExpanded ? (
                      <div style={{ position: 'relative' }}>
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${v.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                        />
                        <button onClick={() => setExpandedVideoId(null)} style={{
                          position: 'absolute', top: '6px', right: '6px',
                          background: 'rgba(0,0,0,0.75)', border: 'none', color: 'white',
                          width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                          fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setExpandedVideoId(v.id)}>
                        <img
                          src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`}
                          alt={v.title}
                          loading="lazy"
                          decoding="async"
                          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.2s',
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0' }}
                        >
                          <div style={{ width: '44px', height: '44px', background: 'rgba(0,240,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-play" style={{ color: '#000', fontSize: '1rem', marginLeft: '3px' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ color, fontSize: '0.68rem', fontFamily: 'Orbitron', letterSpacing: '0.5px', fontWeight: 700 }}>
                          {CATEGORY_LABELS[v.category]}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'Orbitron', fontSize: '0.75rem' }}>
                          {fmtDuration(v.duration_sec)}
                        </span>
                      </div>
                      <p style={{ color: 'white', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>
                        {v.title}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
