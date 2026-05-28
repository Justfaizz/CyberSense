'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Video } from '@/lib/types'

interface Props {
  videos: Video[]
  userName: string
}

type Category = 'all' | Video['category']

const CATEGORY_LABELS: Record<string, string> = {
  all: 'ALL',
  cyberbullying: 'CYBERBULLYING',
  phishing: 'PHISHING',
  account_security: 'ACCOUNT SECURITY',
  general_safety: 'GENERAL SAFETY',
}

const CATEGORY_COLORS: Record<string, string> = {
  cyberbullying: 'var(--neon-red)',
  phishing: 'var(--neon-purple)',
  account_security: 'var(--neon-blue)',
  general_safety: 'var(--neon-green)',
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function UserVideosClient({ videos, userName }: Props) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filtered = useMemo(
    () => activeCategory === 'all' ? videos : videos.filter(v => v.category === activeCategory),
    [activeCategory, videos]
  )

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
          <a href="/user/videos" className="nav-item active">
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

      <main className="main-content">
        <div className="top-bar">
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff003c', marginRight: '25px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-right-from-bracket" /> LOGOUT
          </button>
          <a href="/user/profile" className="profile-circle" style={{ textDecoration: 'none' }}>
            <i className="fa-solid fa-user" />
          </a>
        </div>

        <h1 className="page-title" style={{ color: 'var(--neon-blue)' }}>VIDEO LIBRARY</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', textAlign: 'center' }}>
          Reinforce your knowledge — all videos under 5 minutes.
        </p>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px', justifyContent: 'center' }}>
          {(['all', 'cyberbullying', 'phishing', 'account_security', 'general_safety'] as Category[]).map(cat => {
            const isActive = activeCategory === cat
            const color = cat === 'all' ? 'var(--neon-blue)' : CATEGORY_COLORS[cat]
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                background: isActive ? color : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isActive ? 'transparent' : color}`,
                color: isActive ? '#000' : color,
                padding: '8px 18px',
                borderRadius: '50px',
                cursor: 'pointer',
                fontFamily: 'Orbitron',
                fontSize: '0.72rem',
                letterSpacing: '1px',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                fontWeight: 700,
              }}>
                {CATEGORY_LABELS[cat]}
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <i className="fa-solid fa-video-slash" style={{ fontSize: '3rem', color: '#444', marginBottom: '15px', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)' }}>No videos in this category yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(v => {
              const isExpanded = expandedId === v.id
              const color = CATEGORY_COLORS[v.category]
              return (
                <div key={v.id} className="glass-card" style={{
                  padding: 0,
                  overflow: 'hidden',
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
                      <button onClick={() => setExpandedId(null)} style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(0,0,0,0.75)', border: 'none', color: 'white',
                        width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                        fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Montserrat',
                      }}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{ position: 'relative', cursor: 'pointer' }}
                      onClick={() => setExpandedId(v.id)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`}
                        alt={v.title}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                      />
                      <div className="video-play-overlay" style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0' }}
                      >
                        <div style={{
                          width: '60px', height: '60px',
                          background: 'rgba(0,240,255,0.9)', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className="fa-solid fa-play" style={{ color: '#000', fontSize: '1.4rem', marginLeft: '4px' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color, fontSize: '0.72rem', fontFamily: 'Orbitron', letterSpacing: '1px', fontWeight: 700 }}>
                        {CATEGORY_LABELS[v.category]}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'Orbitron', fontSize: '0.8rem' }}>
                        {fmtDuration(v.duration_sec)}
                      </span>
                    </div>
                    <h3 style={{ color: 'white', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.95rem', margin: '0 0 6px' }}>
                      {v.title}
                    </h3>
                    {v.description && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                        {v.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
