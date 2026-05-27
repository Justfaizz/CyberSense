'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Challenge {
  threat: string
  correctNode: string
  correctTool: string
  feedback: string
}

const NODES = [
  { id: 'ig',    icon: 'fa-brands fa-instagram', label: 'Instagram Profile' },
  { id: 'wa',    icon: 'fa-brands fa-whatsapp',  label: 'WhatsApp Account' },
  { id: 'email', icon: 'fa-solid fa-envelope',   label: 'Campus Email' },
]

const TOOLS = [
  { id: 'privacy', icon: 'fa-solid fa-user-lock',            label: 'PRIVACY SETTINGS' },
  { id: 'block',   icon: 'fa-solid fa-ban',                  label: 'BLOCK & REPORT' },
  { id: 'mfa',     icon: 'fa-solid fa-mobile-screen-button', label: '2FA / MFA' },
]

function NetworkDefenseInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const moduleId = parseInt(searchParams.get('module_id') ?? '3')

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading]       = useState(true)
  const [round, setRound]           = useState(0)
  const [score, setScore]           = useState(0)
  const [selectedTool, setTool]     = useState<string | null>(null)
  const [feedback, setFeedback]     = useState<{ text: string; correct: boolean } | null>(null)
  const [finished, setFinished]     = useState(false)
  const [saveStatus, setSaveStatus] = useState('Encrypting...')
  const [showAchieve, setAchieve]   = useState(false)
  const [nodeHighlight, setNodeHL]  = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('scenarios_defense')
      .select('*')
      .eq('module_id', moduleId)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const mapped: Challenge[] = data.map(row => ({
          threat: row.threat_text,
          correctNode: row.correct_node,
          correctTool: row.correct_tool,
          feedback: row.feedback_text,
        }))
        setChallenges(mapped)
        setLoading(false)
      })
  }, [moduleId])

  const current = challenges[round]

  async function handleNodeDrop(nodeId: string) {
    if (!selectedTool || feedback || !current) return
    setNodeHL(nodeId)

    const isCorrect = nodeId === current.correctNode && selectedTool === current.correctTool
    if (isCorrect) {
      setFeedback({ text: current.feedback, correct: true })
      setScore(s => s + 1)
    } else {
      setFeedback({
        text: `Not quite. The threat "${current.threat}" requires ${TOOLS.find(t => t.id === current.correctTool)?.label} on your ${NODES.find(n => n.id === current.correctNode)?.label}.`,
        correct: false,
      })
    }
  }

  async function handleNext() {
    setFeedback(null)
    setTool(null)
    setNodeHL(null)
    const nextRound = round + 1

    if (nextRound >= challenges.length) {
      setFinished(true)
      const pct = ((score + (feedback?.correct ? 1 : 0)) / challenges.length) * 100

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('user_scores').insert({
          user_id: user.id, module_id: moduleId,
          score, total_questions: challenges.length,
          percentage: pct, passed: pct === 100,
        })
        setSaveStatus('✓ Uploaded to HQ.')
      }

      if (pct === 100) {
        setTimeout(() => { setAchieve(true); setTimeout(() => setAchieve(false), 4000) }, 500)
      }
    } else {
      setRound(nextRound)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--neon-green)', fontFamily: 'Orbitron', fontSize: '1.2rem' }}>
        LOADING SIMULATION...
      </div>
    )
  }

  const finalPct = Math.round((score / challenges.length) * 100)

  return (
    <>
      <style>{`
        .network-map { display: flex; gap: 40px; margin-bottom: 50px; }
        .node { width:150px; height:150px; border-radius:15px; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(255,255,255,0.05); transition:0.3s; backdrop-filter:blur(5px); cursor:pointer; border: 2px dashed #444; }
        .node:hover { border-color: var(--neon-green); background:rgba(0,255,102,0.1); transform:scale(1.05); }
        .node.highlighted { border-color:var(--neon-green); background:rgba(0,255,102,0.1); box-shadow:0 0 15px rgba(0,255,102,0.3); }
        .inventory { display:flex; gap:20px; background:rgba(20,20,20,0.9); padding:20px 40px; border-radius:10px; border-top:3px solid var(--neon-blue); backdrop-filter:blur(10px); }
        .tool { width:120px; height:100px; border-radius:10px; display:flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; transition:0.2s; border:1px solid #333; background:rgba(255,255,255,0.05); }
        .tool:hover { border-color:var(--neon-blue); background:rgba(0,240,255,0.1); }
        .tool.selected { border-color:var(--neon-blue); background:rgba(0,240,255,0.2); box-shadow:0 0 15px rgba(0,240,255,0.3); }
        .threat-alert { background:rgba(255,0,60,0.1); border:1px solid #ff003c; padding:15px 30px; border-radius:8px; font-family:Orbitron; font-size:1.1rem; color:#ff003c; min-width:600px; max-width:800px; backdrop-filter:blur(5px); animation:pulse 2s infinite; }
        @keyframes pulse { 0%{box-shadow:0 0 0 rgba(255,0,60,0.4)} 50%{box-shadow:0 0 20px rgba(255,0,60,0.4)} 100%{box-shadow:0 0 0 rgba(255,0,60,0)} }
        .feedback-banner { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(10,10,10,0.98); border-radius:20px; padding:40px; text-align:center; z-index:100; min-width:400px; backdrop-filter:blur(15px); }
      `}</style>

      <a href="/user/learning" style={{ position: 'absolute', top: '30px', left: '40px', textDecoration: 'none', color: '#888', fontFamily: 'Orbitron' }}>
        <i className="fa-solid fa-arrow-left" /> ABORT MISSION
      </a>
      <div style={{ position: 'absolute', top: '30px', right: '40px', fontFamily: 'Orbitron', fontSize: '1.5rem', color: 'var(--neon-green)' }}>
        SCORE: {score}/{challenges.length}
      </div>

      {/* Achievement */}
      <div className={`achievement-popup${showAchieve ? ' show' : ''}`}>
        <p className="popup-headline">🏆 ACHIEVEMENT UNLOCKED</p>
        <div className="badge-card unlocked popup-badge" style={{ borderColor: '#00e676', boxShadow: '0 0 30px rgba(0,230,118,0.35)' }}>
          <i className="fa-solid fa-network-wired badge-icon badge-glow" style={{ color: '#00e676' }} />
          <span className="badge-name">Node Defender</span>
          <span className="badge-module">Network Defense</span>
        </div>
        <p style={{ color: '#00ff66', fontSize: '0.8rem', marginTop: '15px', fontFamily: 'Montserrat' }}>✦ Badge added to your profile</p>
      </div>

      {!finished ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontFamily: 'Orbitron', color: 'var(--neon-green)', marginBottom: '10px' }}>SOCIAL NODE DEFENSE</h2>
            <div className="threat-alert">THREAT: {current?.threat}</div>
          </div>

          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontFamily: 'Orbitron', fontSize: '0.8rem' }}>
            1. Select a tool below &nbsp;→&nbsp; 2. Click the correct social node
          </p>

          <div className="network-map">
            {NODES.map(node => (
              <div
                key={node.id}
                className={`node${nodeHighlight === node.id ? ' highlighted' : ''}`}
                onClick={() => handleNodeDrop(node.id)}
              >
                <i className={node.icon} style={{ fontSize: '3rem', marginBottom: '10px', color: 'var(--text-muted)' }} />
                <span style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', textAlign: 'center' }}>{node.label}</span>
              </div>
            ))}
          </div>

          <div style={{ fontFamily: 'Orbitron', color: '#666', marginBottom: '10px', fontSize: '0.8rem' }}>DEFENSE TOOLKIT</div>
          <div className="inventory">
            {TOOLS.map(tool => (
              <div
                key={tool.id}
                className={`tool${selectedTool === tool.id ? ' selected' : ''}`}
                onClick={() => setTool(tool.id)}
              >
                <i className={tool.icon} style={{ fontSize: '2rem', color: 'var(--neon-blue)', marginBottom: '8px' }} />
                <span style={{ fontSize: '0.7rem', fontFamily: 'Montserrat', fontWeight: 'bold', textAlign: 'center' }}>{tool.label}</span>
              </div>
            ))}
          </div>

          {feedback && (
            <div className="feedback-banner" style={{ border: `2px solid ${feedback.correct ? '#00ff66' : '#ff003c'}` }}>
              <i className={`fa-solid ${feedback.correct ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ fontSize: '3rem', color: feedback.correct ? '#00ff66' : '#ff003c', marginBottom: '15px', display: 'block' }} />
              <p style={{ color: 'white', lineHeight: 1.5, marginBottom: '25px' }}>{feedback.text}</p>
              <button className="login-btn" onClick={handleNext} style={{ border: 'none', cursor: 'pointer' }}>
                {round + 1 >= challenges.length ? 'VIEW SCORE' : 'NEXT THREAT'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Orbitron', color: 'var(--neon-green)', marginBottom: '20px' }}>MISSION COMPLETE</h2>
          <div style={{ fontSize: '4rem', fontFamily: 'Orbitron', color: 'var(--neon-blue)', marginBottom: '15px' }}>{finalPct}%</div>
          <p style={{ color: finalPct === 100 ? '#00ff66' : '#ff003c', fontWeight: 'bold', marginBottom: '10px' }}>
            {finalPct === 100 ? 'PASSED & UNLOCKED' : 'FAILED (Must score 100%)'}
          </p>
          <p style={{ color: 'yellow', fontSize: '0.85rem', marginBottom: '30px' }}>{saveStatus}</p>
          <button className="login-btn" onClick={() => router.push('/user/learning')} style={{ border: 'none', cursor: 'pointer' }}>
            RETURN TO HQ
          </button>
        </div>
      )}
    </>
  )
}

export default function NetworkDefensePage() {
  return <Suspense><NetworkDefenseInner /></Suspense>
}
