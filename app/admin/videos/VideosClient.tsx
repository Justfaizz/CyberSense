'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Video } from '@/lib/types'

interface Props { initialVideos: Video[] }

const CATEGORY_LABELS: Record<string, string> = {
  cyberbullying: 'Cyberbullying',
  phishing: 'Phishing',
  account_security: 'Account Security',
  general_safety: 'General Safety',
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

export default function VideosClient({ initialVideos }: Props) {
  const supabase = createClient()
  const [videos, setVideos]       = useState<Video[]>(initialVideos)
  const [showForm, setShowForm]   = useState(false)
  const [editVideo, setEditVideo] = useState<Video | null>(null)
  const [title, setTitle]         = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]   = useState<Video['category']>('cyberbullying')
  const [youtubeId, setYoutubeId] = useState('')
  const [durationSec, setDurationSec] = useState(60)
  const [status, setStatus]       = useState<'active' | 'inactive'>('active')
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')

  function openAdd() {
    setEditVideo(null); setTitle(''); setDescription(''); setCategory('cyberbullying')
    setYoutubeId(''); setDurationSec(60); setStatus('active'); setFormError(''); setShowForm(true)
  }

  function openEdit(v: Video) {
    setEditVideo(v); setTitle(v.title); setDescription(v.description ?? '')
    setCategory(v.category); setYoutubeId(v.youtube_id); setDurationSec(v.duration_sec)
    setStatus(v.status); setFormError(''); setShowForm(true)
  }

  async function handleSave() {
    setFormError('')
    if (!title.trim()) { setFormError('Title is required.'); return }
    if (youtubeId.length !== 11) { setFormError('YouTube ID must be exactly 11 characters.'); return }
    if (durationSec < 1 || durationSec > 299) { setFormError('Duration must be between 1 and 299 seconds (< 5 min).'); return }
    setSaving(true)

    if (editVideo) {
      const { data, error } = await supabase.from('videos')
        .update({ title, description, category, youtube_id: youtubeId, duration_sec: durationSec, status })
        .eq('id', editVideo.id).select().single()
      if (error) { setFormError(error.message); setSaving(false); return }
      if (data) setVideos(vs => vs.map(v => v.id === editVideo.id ? data : v))
    } else {
      const { data, error } = await supabase.from('videos')
        .insert({ title, description, category, youtube_id: youtubeId, duration_sec: durationSec, status })
        .select().single()
      if (error) { setFormError(error.message); setSaving(false); return }
      if (data) setVideos(vs => [data, ...vs])
    }

    setShowForm(false); setSaving(false)
  }

  async function handleDelete(v: Video) {
    if (!confirm(`Delete "${v.title}"? This cannot be undone.`)) return
    await supabase.from('videos').delete().eq('id', v.id)
    setVideos(vs => vs.filter(x => x.id !== v.id))
  }

  async function handleToggleStatus(v: Video) {
    const newStatus = v.status === 'active' ? 'inactive' : 'active'
    const { data } = await supabase.from('videos')
      .update({ status: newStatus }).eq('id', v.id).select().single()
    if (data) setVideos(vs => vs.map(x => x.id === v.id ? data : x))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const durationMin  = Math.floor(durationSec / 60)
  const durationRem  = durationSec % 60

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header"><h2 className="glow-text">CYBERSENSE</h2></div>
        <nav className="nav-menu">
          <a href="/admin/dashboard" className="nav-item"><div className="icon-box"><i className="fa-solid fa-chart-pie" /></div><span>DASHBOARD</span></a>
          <a href="/admin/users" className="nav-item"><div className="icon-box"><i className="fa-solid fa-users" /></div><span>USERS</span></a>
          <a href="/admin/modules" className="nav-item"><div className="icon-box"><i className="fa-solid fa-microchip" /></div><span>MODULES</span></a>
          <a href="/admin/videos" className="nav-item active"><div className="icon-box"><i className="fa-solid fa-play-circle" /></div><span>VIDEOS</span></a>
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
          <h1 style={{ fontFamily: 'Orbitron', color: 'var(--neon-blue)' }}>VIDEO LIBRARY</h1>
          <button className="login-btn" onClick={openAdd} style={{ padding: '12px 25px', border: 'none', cursor: 'pointer' }}>
            <i className="fa-solid fa-plus" /> ADD VIDEO
          </button>
        </div>

        {showForm && (
          <div className="glass-card" style={{ padding: '30px', marginBottom: '30px', borderColor: 'var(--neon-purple)' }}>
            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--neon-purple)', marginBottom: '20px' }}>
              {editVideo ? 'EDIT VIDEO' : 'NEW VIDEO'}
            </h3>

            {formError && (
              <p style={{ color: '#ff003c', marginBottom: '15px', fontSize: '0.85rem' }}>{formError}</p>
            )}

            {youtubeId.length === 11 && (
              <div style={{ marginBottom: '20px' }}>
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                  alt="Thumbnail preview"
                  style={{ width: '320px', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--neon-blue)' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 3, minWidth: '200px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>TITLE</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }}
                  placeholder="Video title..." />
              </div>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>CATEGORY</label>
                <select value={category} onChange={e => setCategory(e.target.value as Video['category'])}
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }}>
                  <option value="cyberbullying">Cyberbullying</option>
                  <option value="phishing">Phishing</option>
                  <option value="account_security">Account Security</option>
                  <option value="general_safety">General Safety</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>DESCRIPTION (optional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat', resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="Short description shown on the video card..." />
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
                  YOUTUBE ID <span style={{ color: '#666' }}>(11 chars — e.g. dQw4w9WgXcQ)</span>
                </label>
                <input value={youtubeId} onChange={e => setYoutubeId(e.target.value.trim())} maxLength={11}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${youtubeId.length === 11 ? 'var(--neon-green)' : '#444'}`, color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '1rem' }}
                  placeholder="xxxxxxxxxxx" />
              </div>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
                  DURATION (sec) <span style={{ color: 'var(--neon-blue)' }}>{durationMin}m {durationRem}s</span>
                </label>
                <input type="number" min={1} max={299} value={durationSec} onChange={e => setDurationSec(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: 'white', padding: '10px 15px', borderRadius: '8px', fontFamily: 'Montserrat' }} />
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>STATUS</label>
                <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
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

        <div className="glass-card" style={{ padding: '30px', overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No videos yet. Click ADD VIDEO to get started.</td></tr>
              ) : videos.map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={`https://img.youtube.com/vi/${v.youtube_id}/default.jpg`}
                        alt=""
                        style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{v.title}</div>
                        {v.description && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>{v.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: CATEGORY_COLORS[v.category], fontSize: '0.85rem', fontWeight: 600 }}>
                      {CATEGORY_LABELS[v.category]}
                    </span>
                  </td>
                  <td style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron' }}>{fmtDuration(v.duration_sec)}</td>
                  <td>
                    <button onClick={() => handleToggleStatus(v)} style={{
                      background: 'none',
                      border: `1px solid ${v.status === 'active' ? 'var(--neon-green)' : '#666'}`,
                      color: v.status === 'active' ? 'var(--neon-green)' : '#666',
                      padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
                      fontFamily: 'Montserrat', fontSize: '0.8rem',
                    }}>
                      {v.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => openEdit(v)} style={{ background: 'none', border: '1px solid var(--neon-blue)', color: 'var(--neon-blue)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontFamily: 'Montserrat', fontSize: '0.8rem' }}>
                      EDIT
                    </button>
                    <button onClick={() => handleDelete(v)} style={{ background: 'none', border: '1px solid #ff003c', color: '#ff003c', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Montserrat', fontSize: '0.8rem' }}>
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
