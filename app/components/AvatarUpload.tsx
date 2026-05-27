'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  currentUrl: string | null
  accentColor?: string
  onUploaded: (url: string) => void
}

export default function AvatarUpload({ userId, currentUrl, accentColor = 'var(--neon-blue)', onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2 MB.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      onUploaded(data.publicUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100px', margin: '0 auto 20px' }}>
      {/* Circle */}
      <div style={{
        width: '100px', height: '100px', borderRadius: '50%',
        background: currentUrl ? 'transparent' : 'rgba(0,240,255,0.1)',
        border: `2px solid ${accentColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {currentUrl
          ? <img src={currentUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <i className="fa-solid fa-user" style={{ fontSize: '3rem', color: accentColor }} />
        }
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ color: accentColor, fontSize: '1.5rem' }} />
          </div>
        )}
      </div>

      {/* Overlay button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Change photo"
        style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '28px', height: '28px', borderRadius: '50%',
          background: accentColor, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <i className="fa-solid fa-camera" style={{ fontSize: '0.75rem', color: '#000' }} />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {error && (
        <p style={{ color: 'var(--neon-red)', fontSize: '0.7rem', marginTop: '6px', textAlign: 'center' }}>{error}</p>
      )}
    </div>
  )
}
