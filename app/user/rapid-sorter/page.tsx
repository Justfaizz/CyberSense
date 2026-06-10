'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getBadgeForModule, type ModuleBadge } from '@/lib/badges'

interface SorterScenario {
  text: string
  isThreat: boolean
}

const TIMER_MS = 7000

function RapidSorterInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const moduleId = parseInt(searchParams.get('module_id') ?? '2')

  const [scenarios, setScenarios]   = useState<SorterScenario[]>([])
  const [loading, setLoading]       = useState(true)
  const [round, setRound]           = useState(0)
  const [score, setScore]           = useState(0)
  const [timeLeft, setTimeLeft]     = useState(TIMER_MS)
  const [cardText, setCardText]     = useState('')
  const [cardColor, setCardColor]   = useState('var(--neon-purple)')
  const [finished, setFinished]     = useState(false)
  const [saveStatus, setSaveStatus] = useState('Encrypting...')
  const [showAchieve, setAchieve]   = useState(false)
  const [badge, setBadge]           = useState<ModuleBadge | null>(null)
  const [showButtons, setShowBtns]  = useState(true)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const roundRef = useRef(round)
  const scoreRef = useRef(score)
  const scenariosRef = useRef<SorterScenario[]>([])
  const startTimeRef = useRef<number>(0)

  roundRef.current = round
  scoreRef.current = score

  useEffect(() => {
    const supabase = createClient()
    supabase.from('modules').select('id, title, game_mode').eq('status', 'active').order('id')
      .then(({ data }) => { if (data) setBadge(getBadgeForModule(moduleId, data) ?? null) })
  }, [moduleId]) // eslint-disable-line

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('scenarios_sorter')
      .select('*')
      .eq('module_id', moduleId)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const mapped: SorterScenario[] = data.map(row => ({
          text: row.scenario_text,
          isThreat: row.is_threat,
        }))
        scenariosRef.current = mapped
        setScenarios(mapped)
        setLoading(false)
        startTimeRef.current = Date.now()
        startRound(0, 0, mapped)
      })
  }, [moduleId]) // eslint-disable-line

  function startRound(r: number, s: number, scenariosList?: SorterScenario[]) {
    const list = scenariosList ?? scenariosRef.current
    if (r >= list.length) { endGame(s, list); return }
    setCardText(`INCOMING DATA:\n\n"${list[r].text}"`)
    setCardColor('var(--neon-purple)')
    setTimeLeft(TIMER_MS)
    setShowBtns(true)

    if (timerRef.current) clearInterval(timerRef.current)
    let remaining = TIMER_MS
    timerRef.current = setInterval(() => {
      remaining -= 50
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        handleTimeout(roundRef.current, scoreRef.current)
      }
    }, 50)
  }

  function handleChoice(userSaysThreat: boolean) {
    if (timerRef.current) clearInterval(timerRef.current)
    const list = scenariosRef.current
    const actual = list[roundRef.current].isThreat
    const correct = userSaysThreat === actual
    const newScore = correct ? scoreRef.current + 1 : scoreRef.current
    setScore(newScore)
    setShowBtns(false)

    if (correct) {
      setCardColor('#00ff66')
      setCardText('✓ Correct Assessment.')
    } else {
      setCardColor('#ff003c')
      setCardText('✗ Failed. You misidentified the payload.')
    }
    const nextRound = roundRef.current + 1
    setRound(nextRound)
    setTimeout(() => startRound(nextRound, newScore), 1500)
  }

  function handleTimeout(r: number, s: number) {
    setCardColor('#ff003c')
    setCardText('⏱ TIME EXPIRED. Threat penetrated defenses.')
    setShowBtns(false)
    const nextRound = r + 1
    setRound(nextRound)
    setTimeout(() => startRound(nextRound, s), 1500)
  }

  async function endGame(finalScore: number, list: SorterScenario[]) {
    setFinished(true)
    setShowBtns(false)
    const pct = (finalScore / list.length) * 100

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const time_taken = Math.round((Date.now() - startTimeRef.current) / 1000)
      await supabase.from('user_scores').insert({
        user_id: user.id, module_id: moduleId,
        score: finalScore, total_questions: list.length,
        percentage: pct, passed: pct === 100, time_taken,
      })
      setSaveStatus('✓ Uploaded to HQ.')
    }

    if (pct === 100) {
      setTimeout(() => { setAchieve(true); setTimeout(() => setAchieve(false), 4000) }, 500)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--neon-purple)', fontFamily: 'Orbitron', fontSize: '1.2rem' }}>
        LOADING SIMULATION...
      </div>
    )
  }

  const pct = scenarios.length ? (score / scenarios.length) * 100 : 0
  const timerPct = (timeLeft / TIMER_MS) * 100

  return (
    <>
      <style>{`
        .sorter-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; position: relative; }
        .timer-bar-container { width: 100%; max-width: 600px; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; margin-bottom: 30px; overflow: hidden; }
        .scenario-card { background: rgba(20,20,20,0.9); border-radius: 15px; padding: 40px; width: 100%; max-width: 600px; text-align: center; min-height: 250px; display: flex; flex-direction: column; justify-content: center; backdrop-filter: blur(10px); transition: border-color 0.3s; }
        .action-row { display: flex; gap: 20px; margin-top: 40px; width: 100%; max-width: 600px; }
        .btn-safe { flex:1; padding:20px; font-family:Orbitron; font-size:1.2rem; background:rgba(0,255,102,0.1); border:2px solid #00ff66; color:#00ff66; border-radius:10px; cursor:pointer; transition:0.2s; }
        .btn-safe:hover { background:rgba(0,255,102,0.3); transform:translateY(-5px); box-shadow:0 0 15px rgba(0,255,102,0.5); }
        .btn-threat { flex:1; padding:20px; font-family:Orbitron; font-size:1.2rem; background:rgba(255,0,60,0.1); border:2px solid #ff003c; color:#ff003c; border-radius:10px; cursor:pointer; transition:0.2s; }
        .btn-threat:hover { background:rgba(255,0,60,0.3); transform:translateY(-5px); box-shadow:0 0 15px rgba(255,0,60,0.5); }
      `}</style>

      <a href="/user/learning" style={{ position: 'absolute', top: '30px', left: '40px', textDecoration: 'none', color: 'var(--text-muted)', fontFamily: 'Orbitron' }}>
        <i className="fa-solid fa-arrow-left" /> ABORT SIMULATION
      </a>
      <div style={{ position: 'absolute', top: '30px', right: '40px', fontFamily: 'Orbitron', fontSize: '1.5rem', color: 'var(--neon-blue)' }}>
        SCORE: {score}/{scenarios.length}
      </div>

      {/* Achievement */}
      <div className={`achievement-popup${showAchieve ? ' show' : ''}`}>
        <p className="popup-headline">🏆 ACHIEVEMENT UNLOCKED</p>
        <div className="badge-card unlocked popup-badge" style={{ borderColor: badge?.color ?? '#c490e4', boxShadow: `0 0 30px ${badge?.color ?? '#c490e4'}55` }}>
          <i className={`fa-solid ${badge?.icon ?? 'fa-magnifying-glass-chart'} badge-icon badge-glow`} style={{ color: badge?.color ?? '#c490e4' }} />
          <span className="badge-name">{badge?.name ?? 'Achievement'}</span>
          <span className="badge-module">{badge?.module ?? 'Module Complete'}</span>
        </div>
        <p style={{ color: '#00ff66', fontSize: '0.8rem', marginTop: '15px', fontFamily: 'Montserrat' }}>✦ Badge added to your profile</p>
      </div>

      <div className="sorter-container">
        <h2 style={{ fontFamily: 'Orbitron', color: 'var(--neon-purple)', marginBottom: '10px', textTransform: 'uppercase' }}>RAPID THREAT SORTER</h2>
        <p style={{ color: '#888', marginBottom: '20px' }}>Analyze the payload. You have 7 seconds per round.</p>

        {!finished && (
          <div className="timer-bar-container">
            <div style={{ height: '100%', width: `${timerPct}%`, background: timerPct < 30 ? '#ff003c' : 'var(--neon-purple)', borderRadius: '5px', transition: 'width 0.1s linear, background-color 0.3s' }} />
          </div>
        )}

        <div className="scenario-card" style={{ border: `2px solid ${cardColor}`, boxShadow: `0 0 30px rgba(196,144,228,0.2)` }}>
          {!finished ? (
            <p style={{ fontSize: '1.2rem', color: 'white', lineHeight: 1.6, fontFamily: 'Montserrat', whiteSpace: 'pre-line' }}>{cardText}</p>
          ) : (
            <>
              <h2 style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron', marginBottom: '10px' }}>MODULE COMPLETE</h2>
              <div style={{ fontSize: '3rem', margin: '10px 0', fontFamily: 'Orbitron', color: 'var(--neon-blue)' }}>{pct}%</div>
              <p style={{ color: pct === 100 ? '#00ff66' : '#ff003c', fontWeight: 'bold' }}>{pct === 100 ? 'PASSED & UNLOCKED' : 'FAILED (Must score 100%)'}</p>
              <p style={{ color: 'yellow', fontSize: '0.85rem', margin: '15px 0' }}>{saveStatus}</p>
              <a href="/user/learning" className="login-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>RETURN TO HQ</a>
            </>
          )}
        </div>

        {showButtons && !finished && (
          <div className="action-row">
            <button className="btn-safe" onClick={() => handleChoice(false)}>
              <i className="fa-solid fa-shield-check" /> SAFE / IGNORE
            </button>
            <button className="btn-threat" onClick={() => handleChoice(true)}>
              <i className="fa-solid fa-triangle-exclamation" /> THREAT / REPORT
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default function RapidSorterPage() {
  return <Suspense><RapidSorterInner /></Suspense>
}
