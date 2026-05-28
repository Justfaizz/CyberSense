'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const supabase = createClient()
  const [fullName, setFullName]           = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPass] = useState('')
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState('')
  const [loading, setLoading]             = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'student' } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess('Registration successful! Redirecting to login...')
    setTimeout(() => { window.location.href = '/login' }, 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', height: '100vh', justifyContent: 'center' }}>

      <div style={{ textAlign: 'center' }}>
        <img src="/logo.png" alt="CyberSense" style={{ height: '100px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }} />
        <h1 style={{ fontSize: '2rem', lineHeight: 1.4 }}>
          JOIN <span className="glow-text">CYBERSENSE</span>
        </h1>
      </div>

      <div className="login-container">
        <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem', textTransform: 'uppercase' }}>
          Create Account
        </h2>

        {error   && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <i className="fa-solid fa-user" />
            <input type="text" placeholder="Full Name" required value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="input-group">
            <i className="fa-regular fa-envelope" />
            <input type="email" placeholder="Email ID" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <i className="fa-solid fa-lock" />
            <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <i className="fa-solid fa-lock" />
            <input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPass(e.target.value)} />
          </div>

          <button type="submit" className="login-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <a href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Already have an account? Login
          </a>
        </div>
      </div>
    </div>
  )
}
