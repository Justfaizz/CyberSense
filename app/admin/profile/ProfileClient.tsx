'use client'

import { useState } from 'react'
import AvatarUpload from '@/app/components/AvatarUpload'

interface Props {
  userId: string
  fullName: string
  email: string
  avatarUrl: string | null
  bio: string
  contactEmail: string
}

export default function AdminProfileClient({ userId, fullName, email, avatarUrl, bio, contactEmail }: Props) {
  const [editing, setEditing]             = useState(false)
  const [name, setName]                   = useState(fullName)
  const [bioVal, setBioVal]               = useState(bio)
  const [contactEmailVal, setContactEmailVal] = useState(contactEmail)
  const [avatarVal, setAvatarVal]         = useState<string | null>(avatarUrl)
  const [password, setPassword]           = useState('')
  const [confirm, setConfirm]             = useState('')
  const [saving, setSaving]               = useState(false)
  const [message, setMessage]             = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave() {
    if (password && password !== confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (password && password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Display name cannot be empty.' })
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name.trim(),
          bio: bioVal,
          contact_email: contactEmailVal,
          ...(avatarVal ? { avatar_url: avatarVal } : {}),
          ...(password ? { password } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
      setPassword('')
      setConfirm('')
      setEditing(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setName(fullName)
    setBioVal(bio)
    setContactEmailVal(contactEmail)
    setAvatarVal(avatarUrl)
    setPassword('')
    setConfirm('')
    setMessage(null)
    setEditing(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '6px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,240,255,0.3)',
    color: 'white', fontFamily: 'Orbitron', fontSize: '0.9rem', outline: 'none',
  }

  return (
    <div className="glass-card" style={{ padding: '40px', maxWidth: '520px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        {editing ? (
          <AvatarUpload
            userId={userId}
            currentUrl={avatarVal}
            accentColor="var(--neon-blue)"
            onUploaded={url => setAvatarVal(url)}
          />
        ) : (
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: avatarVal ? 'transparent' : 'rgba(0,240,255,0.1)',
            border: '2px solid var(--neon-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', overflow: 'hidden',
          }}>
            {avatarVal
              ? <img src={avatarVal} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <i className="fa-solid fa-user-shield" style={{ fontSize: '3rem', color: 'var(--neon-blue)' }} />
            }
          </div>
        )}
        <span className="status-badge" style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--neon-blue)', border: '1px solid var(--neon-blue)' }}>
          SYSTEM ADMINISTRATOR
        </span>
      </div>

      {message && (
        <div style={{
          padding: '10px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.85rem',
          background: message.type === 'success' ? 'rgba(0,230,118,0.1)' : 'rgba(255,0,60,0.1)',
          border: `1px solid ${message.type === 'success' ? 'var(--neon-green)' : 'var(--neon-red)'}`,
          color: message.type === 'success' ? 'var(--neon-green)' : 'var(--neon-red)',
        }}>
          <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight: '8px' }} />
          {message.text}
        </div>
      )}

      {!editing ? (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Display Name</label>
            <p style={{ color: 'white', fontFamily: 'Orbitron', fontSize: '1.1rem', marginTop: '4px' }}>{name}</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Login Email</label>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{email}</p>
          </div>
          {bioVal && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Bio</label>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>{bioVal}</p>
            </div>
          )}
          {contactEmailVal && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Email</label>
              <p style={{ color: 'white', marginTop: '4px' }}>{contactEmailVal}</p>
            </div>
          )}
          <button
            onClick={() => setEditing(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: '6px', cursor: 'pointer',
              background: 'rgba(0,240,255,0.1)', border: '1px solid var(--neon-blue)',
              color: 'var(--neon-blue)', fontFamily: 'Orbitron', fontSize: '0.85rem', letterSpacing: '1px',
              marginTop: '10px',
            }}
          >
            <i className="fa-solid fa-pen-to-square" style={{ marginRight: '8px' }} />
            EDIT PROFILE
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Display Name
            </label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter display name" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Bio
            </label>
            <textarea
              value={bioVal}
              onChange={e => setBioVal(e.target.value)}
              placeholder="Short bio or tagline…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'sans-serif', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Contact Email
            </label>
            <input type="email" value={contactEmailVal} onChange={e => setContactEmailVal(e.target.value)} placeholder="public@example.com"
              style={{ ...inputStyle, fontFamily: 'sans-serif' }} />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              New Password <span style={{ color: '#555', fontFamily: 'sans-serif', textTransform: 'none', letterSpacing: 0 }}>(leave blank to keep current)</span>
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              autoComplete="new-password" style={{ ...inputStyle, fontFamily: 'sans-serif' }} />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
              autoComplete="new-password" style={{ ...inputStyle, fontFamily: 'sans-serif' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCancel}
              disabled={saving}
              style={{
                flex: 1, padding: '12px', borderRadius: '6px', cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                color: 'var(--text-muted)', fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: '1px',
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2, padding: '12px', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer',
                background: saving ? 'rgba(0,240,255,0.05)' : 'rgba(0,240,255,0.15)',
                border: '1px solid var(--neon-blue)',
                color: 'var(--neon-blue)', fontFamily: 'Orbitron', fontSize: '0.85rem', letterSpacing: '1px',
              }}
            >
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }} />SAVING…</>
                : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }} />SAVE CHANGES</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
