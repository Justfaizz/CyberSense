'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

const SCENARIOS: Scenario[] = [
  {
    sender: 'AnonymousHater99',
    message: "You're so pathetic. Everyone in your batch is laughing at your presentation today. Delete your account before I leak your embarrassing photos.",
    choices: [
      { text: '1. Reply angrily and demand to know who they are.', isCorrect: false, feedbackTitle: "<span style='color:#ff003c;'>ESCALATION</span>", feedbackBody: "Engaging with cyberbullies gives them exactly what they want: a reaction. It usually escalates the harassment." },
      { text: '2. Do not reply. Take a screenshot, and block the account.', isCorrect: true, feedbackTitle: "<span style='color:#00ff66;'>CORRECT PROTOCOL</span>", feedbackBody: "Perfect. Documenting evidence and cutting off communication removes the bully's power immediately." },
    ],
  },
  {
    sender: 'BestFriend (New Number)',
    message: "Hey! I got locked out of my main IG. Can you send me the verification code that just went to your phone so I can get back in?",
    choices: [
      { text: '1. Send the code. They are my best friend.', isCorrect: false, feedbackTitle: "<span style='color:#ff003c;'>ACCOUNT HIJACKED</span>", feedbackBody: 'This is an impersonation attack. By sending the code, you just allowed a hacker to bypass 2FA and hijack YOUR account.' },
      { text: '2. Call your friend directly on their normal number to verify.', isCorrect: true, feedbackTitle: "<span style='color:#00ff66;'>THREAT EVADED</span>", feedbackBody: 'Excellent. Always verify out-of-band when someone asks for sensitive security codes.' },
    ],
  },
  {
    sender: 'Gossip Channel',
    message: 'OMG! Is this a video of YOU at the campus party last night?? 😱 Look: <span style="color:#ff003c;text-decoration:underline;">http://campus-gossip-leaks.com/video49</span>',
    choices: [
      { text: '1. Click the link to see what the video is about.', isCorrect: false, feedbackTitle: "<span style='color:#ff003c;'>MALWARE INFECTION</span>", feedbackBody: "Cyberbullies often use 'spilled tea' or fake gossip links to phish credentials or drop malware onto your device." },
      { text: '2. Ignore the link and report the channel for bullying.', isCorrect: true, feedbackTitle: "<span style='color:#00ff66;'>SAFE</span>", feedbackBody: 'Great decision. You avoided a phishing trap disguised as social drama.' },
    ],
  },
  {
    sender: 'Unknown Contact',
    message: 'I know where you live. I have your address and I am going to post it publicly online unless you send RM500 to my crypto wallet.',
    choices: [
      { text: '1. Do not reply, save the evidence, and report to authorities/police.', isCorrect: true, feedbackTitle: "<span style='color:#00ff66;'>CRISIS AVERTED</span>", feedbackBody: 'This is a severe Doxxing and Blackmail threat. Always involve the authorities rather than paying scammers.' },
      { text: '2. Pay the RM500 so they don\'t post your address.', isCorrect: false, feedbackTitle: "<span style='color:#ff003c;'>EXTORTION FAILED</span>", feedbackBody: "Paying extortionists never guarantees they will delete the data. It only marks you as a willing target for future attacks." },
    ],
  },
  {
    sender: 'Library Wifi (Admin)',
    message: 'Your browsing history violates university policy. We will notify your faculty dean unless you click here to verify your identity.',
    choices: [
      { text: "1. Click to verify. I don't want to get in trouble.", isCorrect: false, feedbackTitle: "<span style='color:#ff003c;'>PHISHED</span>", feedbackBody: 'This is a fear-based social engineering attack. Official networks will never threaten you via text message to verify identity.' },
      { text: '2. Delete the message. It is a fear-based scam.', isCorrect: true, feedbackTitle: "<span style='color:#00ff66;'>THREAT NEUTRALIZED</span>", feedbackBody: "Spot on. Scammers use authority and fear to bypass your critical thinking." },
    ],
  },
]

function ChatSimulatorInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const moduleId = parseInt(searchParams.get('module_id') ?? '1')

  const [currentQ, setCurrentQ]     = useState(0)
  const [score, setScore]           = useState(0)
  const [showFeedback, setFeedback] = useState(false)
  const [feedback, setFeedbackData] = useState({ title: '', body: '' })
  const [isLast, setIsLast]         = useState(false)
  const [finished, setFinished]     = useState(false)
  const [finalPct, setFinalPct]     = useState(0)
  const [saveStatus, setSaveStatus] = useState('Encrypting...')
  const [showAchievement, setAchievement] = useState(false)
  const [messages, setMessages]     = useState<{ type: 'npc'|'player'|'divider'; html: string }[]>([])
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadQuestion(0, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function loadQuestion(index: number, prevMessages: typeof messages) {
    const s = SCENARIOS[index]
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages([
      ...prevMessages,
      { type: 'divider', html: `Today ${time}` },
      { type: 'npc', html: s.message },
    ])
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 50)
  }

  async function handleChoice(choice: Choice, index: number) {
    const newScore = choice.isCorrect ? score + 1 : score
    const newMessages: typeof messages = [
      ...messages,
      { type: 'player', html: `>> ${choice.text}` },
    ]
    setMessages(newMessages)
    if (choice.isCorrect) setScore(newScore)

    setTimeout(async () => {
      setFeedbackData({ title: choice.feedbackTitle, body: choice.feedbackBody })
      setIsLast(index >= SCENARIOS.length - 1)
      setFeedback(true)

      if (index >= SCENARIOS.length - 1) {
        // Final question handled in "View Score" button
        const pct = (newScore / SCENARIOS.length) * 100
        setFinalPct(pct)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('user_scores').insert({
            user_id: user.id, module_id: moduleId,
            score: newScore, total_questions: SCENARIOS.length,
            percentage: pct, passed: pct === 100,
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

  const current = SCENARIOS[currentQ]

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
        <p style={{ color: 'var(--text-muted)' }}>Question {currentQ + 1} of {SCENARIOS.length}</p>
      </div>

      {/* Achievement */}
      <div className={`achievement-popup${showAchievement ? ' show' : ''}`}>
        <p className="popup-headline">🏆 ACHIEVEMENT UNLOCKED</p>
        <div className="badge-card unlocked popup-badge" style={{ borderColor: '#00f0ff', boxShadow: '0 0 30px rgba(0,240,255,0.35)' }}>
          <i className="fa-solid fa-shield-halved badge-icon badge-glow" style={{ color: '#00f0ff' }} />
          <span className="badge-name">Digital Guardian</span>
          <span className="badge-module">Harassment Simulator</span>
        </div>
        <p style={{ color: '#00ff66', fontSize: '0.8rem', marginTop: '15px', fontFamily: 'Montserrat' }}>✦ Badge added to your profile</p>
      </div>

      <div className="phone-container">
        <div className="phone-header">
          <i className="fa-solid fa-chevron-left" style={{ color: '#00f0ff', cursor: 'pointer' }} onClick={() => router.push('/user/learning')} />
          <div style={{ color: 'white', fontWeight: 600 }}>
            <i className="fa-solid fa-user-circle" /> {current.sender}
          </div>
          <i className="fa-solid fa-circle-info" style={{ color: '#666' }} />
        </div>

        <div className="chat-area" ref={chatRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.type === 'divider' ? 'msg-divider' : m.type === 'npc' ? 'msg-npc' : 'msg-player'}`} dangerouslySetInnerHTML={{ __html: m.html }} />
          ))}
        </div>

        <div className="controls">
          {!showFeedback && !finished && current.choices.map((c, i) => (
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
