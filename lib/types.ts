export interface Profile {
  id: string
  full_name: string
  role: 'student' | 'admin'
  created_at: string
}

export interface Module {
  id: number
  title: string
  description: string
  game_mode: 'chat' | 'sorter' | 'defense'
  question_limit: number
  status: 'active' | 'inactive'
  created_at: string
}

export interface UserScore {
  id: number
  user_id: string
  module_id: number
  score: number
  total_questions: number
  percentage: number
  passed: boolean
  completed_at: string
}

export interface ScoreWithUser extends UserScore {
  profiles: { full_name: string }
}

export interface LeaderboardEntry {
  full_name: string
  perfect_scores: number
}

export interface Video {
  id: number
  title: string
  description: string | null
  category: 'cyberbullying' | 'phishing' | 'account_security' | 'general_safety'
  youtube_id: string
  duration_sec: number
  status: 'active' | 'inactive'
  created_at: string
}
