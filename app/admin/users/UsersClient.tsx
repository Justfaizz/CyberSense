'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserWithStats {
  id: string
  full_name: string
  role: string
  created_at: string
  attempts: number
  avg: number
}

interface Props { initialUsers: UserWithStats[] }

export default function UsersClient({ initialUsers }: Props) {
  const supabase = createClient()
  const [users, setUsers]       = useState<UserWithStats[]>(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<UserWithStats | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<'student' | 'admin'>('student')
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')

  function openAdd() {
    setEditUser(null); setFullName(''); setEmail(''); setPassword(''); setRole('student'); setFormError(''); setShowForm(true)
  }

  function openEdit(u: UserWithStats) {
    setEditUser(u); setFullName(u.full_name); setEmail(''); setPassword(''); setRole(u.role as 'student' | 'admin'); setFormError(''); setShowForm(true)
  }

  async function handleSave() {
    setSaving(true); setFormError('')

    if (editUser) {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editUser.id, full_name: fullName, role }),
      })
      const json = await res.json()
      if (!res.ok) { setFormError(json.error); setSaving(false); return }
      setUsers(us => us.map(u => u.id === editUser.id ? { ...u, full_name: fullName, role } : u))
    } else {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      })
      const json = await res.json()
      if (!res.ok) { setFormError(json.error); setSaving(false); return }
      setUsers(us => [{ ...json.profile, attempts: 0, avg: 0 }, ...us])
    }

    setShowForm(false); setSaving(false)
  }

  async function handleDelete(u: UserWithStats) {
    if (!confirm(`Delete "${u.full_name}"? This cannot be undone.`)) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id }),
    })
    if (res.ok) setUsers(us => us.filter(x => x.id !== u.id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="CyberSense" style={{ width: '140px', objectFit: 'contain' }} />
        </div>
        <nav className="nav-menu">
          <a href="/admin/dashboard" className="nav-item"><div className="icon-box"><i className="fa-solid fa-chart-pie" /></div><span>DASHBOARD</span></a>
          <a href="/admin/users" className="nav-item active"><div className="icon-box"><i className="fa-solid fa-users" /></div><span>USERS</span></a>
          <a href="/admin/modules" className="nav-item"><div className="icon-box"><i className="fa-solid fa-microchip" /></div><span>MODULES</span></a>
          <a href="/admin/videos" className="nav-item"><div className="icon-box"><i className="fa-solid fa-play-circle" /></div><span>VIDEOS</span></a>
          <div className="nav-section-title">SYSTEM</div>
          <a href="/admin/profile" className="nav-item"><div className="icon-box"><i className="fa-solid fa-user" /></div><span>PROFILE</span></a>
        </nav>
        <div className="sidebar-footer" style={{ padding: '20px', textAlign: 'center' }}>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-red)', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px', fontFamily: 'Orbitron' }}>
            <i className="fa-solid fa-right-from-bracket" /> SIGN OUT
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontFamily: 'Orbitron', color: 'var(--neon-blue)' }}>REGISTERED CADETS</h1>
          <button className="login-btn" onClick={openAdd} style={{ padding: '12px 25px', border: 'none', cursor: 'pointer' }}>
            <i className="fa-solid fa-user-plus" /> ADD CADET
          </button>
        </div>

        {showForm && (
          <div className="glass-card" style={{ padding: '30px', marginBottom: '30px', borderColor: 'var(--neon-purple)' }}>
            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--neon-purple)', marginBottom: '20px' }}>
              {editUser ? 'EDIT CADET' : 'NEW CADET'}
            </h3>

            {formError && (
              <p style={{ color: '#ff003c', marginBottom: '15px', fontSize: '0.85rem' }}>{formError}</p>
            )}

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>FULL NAME</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }}
                  placeholder="Full name..." />
              </div>

              {!editUser && (
                <>
                  <div style={{ flex: 2, minWidth: '200px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>EMAIL</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }}
                      placeholder="user@example.com" />
                  </div>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>PASSWORD</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }}
                      placeholder="Min 6 characters" />
                  </div>
                </>
              )}

              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>ROLE</label>
                <select value={role} onChange={e => setRole(e.target.value as 'student' | 'admin')}
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }}>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="login-btn" onClick={handleSave} disabled={saving} style={{ border: 'none', cursor: 'pointer', padding: '12px 25px' }}>
                {saving ? 'SAVING...' : 'SAVE'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: '1px solid #555', color: '#888', padding: '12px 25px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.85rem' }}>
                CANCEL
              </button>
            </div>
          </div>
        )}

        <div className="glass-card" style={{ padding: '30px', overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Attempts</th>
                <th>Avg Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No users registered yet.</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>
                    <i className={`fa-solid ${u.role === 'admin' ? 'fa-user-shield' : 'fa-user-astronaut'}`} style={{ color: u.role === 'admin' ? 'var(--neon-purple)' : 'var(--neon-blue)', marginRight: '10px' }} />
                    {u.full_name}
                  </td>
                  <td>
                    <span className={`status-badge ${u.role === 'admin' ? 'status-pass' : ''}`} style={u.role !== 'admin' ? { color: 'var(--neon-blue)', background: 'rgba(0,200,255,0.1)', border: '1px solid var(--neon-blue)' } : {}}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron' }}>{u.attempts}</td>
                  <td>
                    <span style={{ color: u.avg >= 80 ? '#00ff66' : u.avg >= 50 ? 'var(--neon-blue)' : '#ff003c', fontFamily: 'Orbitron', fontWeight: 'bold' }}>
                      {u.attempts > 0 ? `${u.avg}%` : '—'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => openEdit(u)} style={{ background: 'none', border: '1px solid var(--neon-blue)', color: 'var(--neon-blue)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontFamily: 'Montserrat', fontSize: '0.8rem' }}>
                      EDIT
                    </button>
                    <button onClick={() => handleDelete(u)} style={{ background: 'none', border: '1px solid #ff003c', color: '#ff003c', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Montserrat', fontSize: '0.8rem' }}>
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
