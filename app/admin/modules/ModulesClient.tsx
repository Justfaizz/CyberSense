'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Module } from '@/lib/types'

interface Props { initialModules: Module[] }

export default function ModulesClient({ initialModules }: Props) {
  const supabase = createClient()
  const [modules, setModules]   = useState<Module[]>(initialModules)
  const [showForm, setShowForm] = useState(false)
  const [editMod, setEditMod]   = useState<Module | null>(null)
  const [title, setTitle]       = useState('')
  const [gameMode, setGameMode] = useState<'chat' | 'sorter' | 'defense'>('chat')
  const [qLimit, setQLimit]     = useState(5)
  const [status, setStatus]     = useState<'active' | 'inactive'>('active')
  const [saving, setSaving]     = useState(false)

  function openAdd() {
    setEditMod(null); setTitle(''); setGameMode('chat'); setQLimit(5); setStatus('active'); setShowForm(true)
  }

  function openEdit(m: Module) {
    setEditMod(m); setTitle(m.title); setGameMode(m.game_mode); setQLimit(m.question_limit); setStatus(m.status); setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    if (editMod) {
      const { data } = await supabase.from('modules').update({ title, question_limit: qLimit, status }).eq('id', editMod.id).select().single()
      if (data) setModules(ms => ms.map(m => m.id === editMod.id ? data : m))
    } else {
      const { data } = await supabase.from('modules').insert({ title, game_mode: gameMode, question_limit: qLimit, status, description: '' }).select().single()
      if (data) setModules(ms => [...ms, data])
    }
    setShowForm(false); setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this module and all its scenarios?')) return
    await supabase.from('modules').delete().eq('id', id)
    setModules(ms => ms.filter(m => m.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const GAME_LABELS: Record<string, string> = { chat: 'Chat Simulator', sorter: 'Rapid Sorter', defense: 'Network Defense' }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header"><h2 className="glow-text">CYBERSENSE</h2></div>
        <nav className="nav-menu">
          <a href="/admin/dashboard" className="nav-item"><div className="icon-box"><i className="fa-solid fa-chart-pie" /></div><span>DASHBOARD</span></a>
          <a href="/admin/users" className="nav-item"><div className="icon-box"><i className="fa-solid fa-users" /></div><span>USERS</span></a>
          <a href="/admin/modules" className="nav-item active"><div className="icon-box"><i className="fa-solid fa-microchip" /></div><span>MODULES</span></a>
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
          <h1 style={{ fontFamily: 'Orbitron', color: 'var(--neon-blue)' }}>TRAINING MODULES</h1>
          <button className="login-btn" onClick={openAdd} style={{ padding: '12px 25px', border: 'none', cursor: 'pointer' }}>
            <i className="fa-solid fa-plus" /> ADD MODULE
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="glass-card" style={{ padding: '30px', marginBottom: '30px', borderColor: 'var(--neon-purple)' }}>
            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--neon-purple)', marginBottom: '20px' }}>
              {editMod ? 'EDIT MODULE' : 'NEW MODULE'}
            </h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>MODULE TITLE</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }}
                  placeholder="Module title..." />
              </div>
              {!editMod && (
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>GAME MODE</label>
                  <select value={gameMode} onChange={e => setGameMode(e.target.value as 'chat'|'sorter'|'defense')}
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }}>
                    <option value="chat">Chat Simulator</option>
                    <option value="sorter">Rapid Sorter</option>
                    <option value="defense">Network Defense</option>
                  </select>
                </div>
              )}
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>QUESTION LIMIT</label>
                <input type="number" min={1} max={20} value={qLimit} onChange={e => setQLimit(parseInt(e.target.value))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }} />
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>STATUS</label>
                <select value={status} onChange={e => setStatus(e.target.value as 'active'|'inactive')}
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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

        {/* Module list */}
        <div className="glass-card" style={{ padding: '30px', overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Title</th><th>Mode</th><th>Questions</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No modules yet.</td></tr>
              ) : modules.map(m => (
                <tr key={m.id}>
                  <td style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron' }}>{m.id}</td>
                  <td style={{ fontWeight: 600 }}>{m.title}</td>
                  <td><span style={{ color: 'var(--neon-purple)', fontSize: '0.85rem' }}>{GAME_LABELS[m.game_mode] ?? m.game_mode}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{m.question_limit}</td>
                  <td>
                    <span className={`status-badge ${m.status === 'active' ? 'status-pass' : 'status-fail'}`}>
                      {m.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => openEdit(m)} style={{ background: 'none', border: '1px solid var(--neon-blue)', color: 'var(--neon-blue)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontFamily: 'Montserrat', fontSize: '0.8rem' }}>
                      EDIT
                    </button>
                    <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: '1px solid #ff003c', color: '#ff003c', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Montserrat', fontSize: '0.8rem' }}>
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
