'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getBadgeForModule, type ModuleBadge } from '@/lib/badges'

interface Choice {
  text: string
  isCorrect: boolean
  feedbackTitle: string
  feedbackBody: string
}
interface Scenario {
  sender: string
  message: string
  choices: Choice[]
}

function ChatSimulatorInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const moduleId = parseInt(searchParams.get('module_id') ?? '1')

  const [scenarios, setScenarios]   = useState<Scenario[]>([])
  const [loading, setLoading]       = useState(true)
  const [currentQ, setCurrentQ]     = useState(0)
  const [score, setScore]           = useState(0)
  const [showFeedback, setFeedback] = useState(false)
  const [feedback, setFeedbackData] = useState({ title: '', body: '' })
  const [isLast, setIsLast]         = useState(false)
  const [finished, setFinished]     = useState(false)
  const [finalPct, setFinalPct]     = useState(0)
  const [saveStatus, setSaveStatus] = useState('Encrypting...')
  const [showAchievement, setAchievement] = useState(false)
  const [badge, setBadge]           = useState<ModuleBadge | null>(null)
  const [messages, setMessages]     = useState<{ type: 'npc'|'player'|'divider'; html: string }[]>([])
  const chatRef = useRef<HTMLDivElement>(null)
  const scenariosRef = useRef<Scenario[]>([])
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('modules').select('id, title, game_mode').eq('status', 'active').order('id')
      .then(({ data }) => { if (data) setBadge(getBadgeForModule(moduleId, data) ?? null) })
  }, [moduleId]) // eslint-disable-line

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('scenarios')
      .select('*')
      .eq('module_id', moduleId)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const mapped: Scenario[] = data.map(row => ({
          sender: row.sender_name,
          message: row.message_text,
          choices: [
            {
              text: row.choice_1_text,
              isCorrect: row.choice_1_correct,
              feedbackTitle: row.choice_1_title,
              feedbackBody: row.choice_1_body,
            },
            {
              text: row.choice_2_text,
              isCorrect: row.choice_2_correct,
              feedbackTitle: row.choice_2_title,
              feedbackBody: row.choice_2_body,
            },
          ],
        }))
        scenariosRef.current = mapped
        setScenarios(mapped)
        setLoading(false)
        startTimeRef.current = Date.now()
        loadQuestion(0, [], mapped)
      })
  }, [moduleId]) // eslint-disable-line

  function loadQuestion(index: number, prevMessages: typeof messages, scenariosList?: Scenario[]) {
    const list = scenariosList ?? scenariosRef.current
    const s = list[index]
    if (!s) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages([
      ...prevMessages,
      { type: 'divider', html: `Today ${time}` },
      { type: 'npc', html: s.message },
    ])
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 50)
  }

  async function handleChoice(choice: Choice, index: number) {
    const list = scenariosRef.current
    const newScore = choice.isCorrect ? score + 1 : score
    const newMessages: typeof messages = [
      ...messages,
      { type: 'player', html: `>> ${choice.text}` },
    ]
    setMessages(newMessages)
    if (choice.isCorrect) setScore(newScore)

    setTimeout(async () => {
      setFeedbackData({ title: choice.feedbackTitle, body: choice.feedbackBody })
      setIsLast(index >= list.length - 1)
      setFeedback(true)

      if (index >= list.length - 1) {
        const pct = (newScore / list.length) * 100
        setFinalPct(pct)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const time_taken = Math.round((Date.now() - startTimeRef.current) / 1000)
          await supabase.from('user_scores').insert({
            user_id: user.id, module_id: moduleId,
            score: newScore, total_questions: list.length,
            percentage: pct, passed: pct === 100, time_taken,
          })
          setSaveStatus('✓ Uploaded to HQ.')
        }

        if (pct === 100) {
          setTimeout(() => {
            setAchievement(true)
            setTimeout(() => setAchievement(false), 4000)
          }, 500)
        }
      }
    }, 1500)
  }

  function handleNext() {
    setFeedback(false)
    if (!isLast) {
      const next = currentQ + 1
      setCurrentQ(next)
      loadQuestion(next, messages)
    } else {
      setFinished(true)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--neon-blue)', fontFamily: 'Orbitron', fontSize: '1.2rem' }}>
        LOADING SIMULATION...
      </div>
    )
  }

  const current = scenarios[currentQ]

  return (
    <>
      <style>{`
        .phone-container { width: 350px; height: 650px; background-color: #121212; border: 10px solid #222; border-radius: 40px; margin: 0 auto; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 30px rgba(0,240,255,0.2); position: relative; }
        .phone-header { background-color: #1a1a1a; padding: 20px 15px 15px; text-align: center; border-bottom: 1px solid #333; display: flex; align-items: center; justify-content: space-between; }
        .chat-area { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
        .chat-area::-webkit-scrollbar { display: none; }
        .msg { max-width: 85%; padding: 12px 16px; border-radius: 20px; font-size: 0.95rem; line-height: 1.4; word-wrap: break-word; }
        .msg-npc { background: #2a2a2a; color: #fff; align-self: flex-start; border-bottom-left-radius: 5px; }
        .msg-player { background: #00f0ff; color: #000; font-weight: 600; align-self: flex-end; border-bottom-right-radius: 5px; }
        .msg-divider { text-align: center; color: #666; font-size: 0.75rem; margin: 5px 0; align-self: center; }
        .controls { padding: 15px; background-color: #1a1a1a; border-top: 1px solid #333; display: flex; flex-direction: column; gap: 10px; min-height: 150px; }
        .choice-btn { background: transparent; color: #00f0ff; border: 1px solid #00f0ff; padding: 12px; border-radius: 10px; cursor: pointer; font-family: Montserrat,sans-serif; font-weight: 600; transition: all 0.3s; text-align: left; font-size: 0.85rem; }
        .choice-btn:hover { background: rgba(0,240,255,0.1); transform: translateY(-2px); }
        .feedback-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10,10,10,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; z-index: 10; }
      `}</style>

      <div style={{ textAlign: 'center', marginTop: '3vh', marginBottom: '20px' }}>
        <h1 style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron' }}>
          <i className="fa-solid fa-shield-halved" /> SIMULATION ACTIVE
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Question {currentQ + 1} of {scenarios.length}</p>
      </div>

      {/* Achievement */}
      <div className={`achievement-popup${showAchievement ? ' show' : ''}`}>
        <p className="popup-headline">🏆 ACHIEVEMENT UNLOCKED</p>
        <div className="badge-card unlocked popup-badge" style={{ borderColor: badge?.color ?? '#00f0ff', boxShadow: `0 0 30px ${badge?.color ?? '#00f0ff'}55` }}>
          <i className={`fa-solid ${badge?.icon ?? 'fa-shield-halved'} badge-icon badge-glow`} style={{ color: badge?.color ?? '#00f0ff' }} />
          <span className="badge-name">{badge?.name ?? 'Achievement'}</span>
          <span className="badge-module">{badge?.module ?? 'Module Complete'}</span>
        </div>
        <p style={{ color: '#00ff66', fontSize: '0.8rem', marginTop: '15px', fontFamily: 'Montserrat' }}>✦ Badge added to your profile</p>
      </div>

      <div className="phone-container">
        <div className="phone-header">
          <i className="fa-solid fa-chevron-left" style={{ color: '#00f0ff', cursor: 'pointer' }} onClick={() => router.push('/user/learning')} />
          <div style={{ color: 'white', fontWeight: 600 }}>
            <i className="fa-solid fa-user-circle" /> {current?.sender}
          </div>
          <i className="fa-solid fa-circle-info" style={{ color: '#666' }} />
        </div>

        <div className="chat-area" ref={chatRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.type === 'divider' ? 'msg-divider' : m.type === 'npc' ? 'msg-npc' : 'msg-player'}`} dangerouslySetInnerHTML={{ __html: m.html }} />
          ))}
        </div>

        <div className="controls">
          {!showFeedback && !finished && current?.choices.map((c, i) => (
            <button key={i} className="choice-btn" onClick={() => handleChoice(c, currentQ)}>{c.text}</button>
          ))}
        </div>

        {showFeedback && (
          <div className="feedback-overlay">
            <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', marginBottom: '15px' }} dangerouslySetInnerHTML={{ __html: feedback.title }} />
            <p style={{ color: 'white', lineHeight: 1.5, marginBottom: '30px', fontSize: '0.95rem' }}>{feedback.body}</p>
            <button className="login-btn" style={{ width: '80%', border: 'none', fontFamily: 'Orbitron', fontSize: '1rem', cursor: 'pointer' }} onClick={handleNext}>
              {isLast ? 'VIEW FINAL SCORE' : 'NEXT SCENARIO'}
            </button>
          </div>
        )}

        {finished && (
          <div className="feedback-overlay">
            <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', marginBottom: '10px' }}>SIMULATION COMPLETE</h2>
            <div style={{ fontSize: '3rem', margin: '20px 0', fontFamily: 'Orbitron', color: 'var(--neon-blue)' }}>{finalPct}%</div>
            <p style={{ color: finalPct === 100 ? '#00ff66' : '#ff003c', fontWeight: 'bold', marginBottom: '10px' }}>
              {finalPct === 100 ? 'PASSED & UNLOCKED' : 'FAILED (Must score 100%)'}
            </p>
            <p style={{ color: 'yellow', fontSize: '0.85rem', marginBottom: '20px' }}>{saveStatus}</p>
            <button className="login-btn" style={{ width: '80%', border: 'none', fontFamily: 'Orbitron', fontSize: '1rem', cursor: 'pointer' }} onClick={() => router.push('/user/learning')}>
              RETURN TO HQ
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default function ChatSimulatorPage() {
  return (
    <Suspense>
      <ChatSimulatorInner />
    </Suspense>
  )
}
