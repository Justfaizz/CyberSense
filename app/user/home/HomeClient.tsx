'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  userName: string
  passedIds: number[]
  progress: number
  leaderboard: { full_name: string; count: number }[]
}

const QUOTES = [
  { text: '"Your mental health is more important than feeding a troll."', author: 'Cybersense Defense' },
  { text: '"Online harassment has real-world consequences. Protect your digital peace."', author: 'Anti-Cyberbullying Initiative' },
  { text: '"Stop. Breathe. Think before you click or reply to hate."', author: 'Digital Awareness' },
  { text: '"In the digital realm, your privacy settings are your best shield against bullies."', author: 'InfoSec Team' },
  { text: '"A strong password keeps out hackers; a strong boundary keeps out bullies."', author: 'Cybersense' },
]

export default function HomeClient({ userName, passedIds, progress, leaderboard }: Props) {
  const router = useRouter()
  const quoteTextRef   = useRef<HTMLParagraphElement>(null)
  const quoteAuthorRef = useRef<HTMLSpanElement>(null)
  const quoteIndex     = useRef(0)

  const mod2Unlocked = passedIds.includes(1)
  const mod3Unlocked = passedIds.includes(2)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Typewriter animation
  useEffect(() => {
    const el = quoteTextRef.current
    const au = quoteAuthorRef.current
    if (!el || !au) return

    au.style.transition = 'opacity 0.5s ease'
    au.style.opacity = '0'

    let cancelled = false
    function typeText(text: string, index: number) {
      if (cancelled) return
      if (index <= text.length) {
        el!.innerHTML = text.substring(0, index) + '<span class="cursor">&nbsp;</span>'
        setTimeout(() => typeText(text, index + 1), Math.floor(Math.random() * 40) + 30)
      } else {
        au!.innerText = '- ' + QUOTES[quoteIndex.current].author
        au!.style.opacity = '1'
        setTimeout(() => eraseText(text, index), 4000)
      }
    }
    function eraseText(text: string, index: number) {
      if (cancelled) return
      if (index >= 0) {
        el!.innerHTML = text.substring(0, index) + '<span class="cursor">&nbsp;</span>'
        if (index === text.length - 1) au!.style.opacity = '0'
        setTimeout(() => eraseText(text, index - 1), 15)
      } else {
        quoteIndex.current = (quoteIndex.current + 1) % QUOTES.length
        setTimeout(() => typeText(QUOTES[quoteIndex.current].text, 0), 500)
      }
    }

    const t = setTimeout(() => typeText(QUOTES[0].text, 0), 1000)
    return () => { cancelled = true; clearTimeout(t) }
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
          <p ref={quoteTextRef}><span className="cursor">&nbsp;</span></p>
          <span ref={quoteAuthorRef} style={{ color: 'var(--neon-purple)', fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem' }} />
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
              <p style={{ color: '#666', fontSize: '0.9rem' }}>No perfect scores yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'white' }}>
                {leaderboard.map((entry, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #222' }}>
                    <span><strong>#{i + 1}</strong> {entry.full_name}</span>
                    <span style={{ color: 'var(--neon-green)', fontFamily: 'Orbitron' }}>
                      <i className="fa-solid fa-star" /> {entry.count}
                    </span>
                  </li>
                ))}
              </ul>
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
      </main>
    </div>
  )
}
