'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Cursor glow effect — transform-based positioning avoids layout thrashing
  useEffect(() => {
    const glow = document.getElementById('cursor-glow') as HTMLElement | null
    if (!glow) return
    let rafId: number
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        glow.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`
      })
    }
    document.addEventListener('mousemove', handleMove, { passive: true })
    return () => {
      document.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Fetch role then redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Login failed. Please try again.'); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    router.push(profile?.role === 'admin' ? '/admin/dashboard' : '/user/home')
  }

  return (
    <>
      <div id="cursor-glow" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', height: '100vh', justifyContent: 'center' }}>

        <div style={{ textAlign: 'center' }}>
          <img src="/logo.png" alt="CyberSense" style={{ height: '110px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }} />
          <h1 style={{ fontSize: '2.5rem', lineHeight: 1.4 }}>
            WELCOME TO<br />
            <span className="glow-text">CYBERSENSE</span>
          </h1>
        </div>

        <div className="login-container">
          <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem', textTransform: 'uppercase' }}>
            User Login
          </h2>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <i className="fa-regular fa-envelope" />
              <input
                type="email" placeholder="Email ID" required
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <i className="fa-solid fa-lock" />
              <input
                type="password" placeholder="Password" required
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-btn" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <a href="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Need an account? Register
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
