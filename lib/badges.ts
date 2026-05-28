export const NEON_COLORS = [
  '#00f0ff',
  '#c490e4',
  '#00e676',
  '#ff9500',
  '#ff4081',
  '#40c4ff',
]

export const ICONS_BY_MODE: Record<string, string[]> = {
  chat:    ['fa-shield-halved', 'fa-comments', 'fa-user-shield', 'fa-comment-dots', 'fa-comment-slash'],
  sorter:  ['fa-magnifying-glass-chart', 'fa-layer-group', 'fa-filter', 'fa-list-check', 'fa-magnifying-glass'],
  defense: ['fa-network-wired', 'fa-server', 'fa-lock', 'fa-shield-virus', 'fa-wifi'],
}

const SUFFIXES_BY_MODE: Record<string, string[]> = {
  chat:    ['Guardian', 'Sentinel', 'Agent', 'Operative', 'Protector'],
  sorter:  ['Analyst', 'Classifier', 'Detective', 'Hunter', 'Investigator'],
  defense: ['Defender', 'Architect', 'Commander', 'Shield', 'Operator'],
}

export interface ModuleBadge {
  id: string
  name: string
  module: string
  moduleId: number
  icon: string
  color: string
  hint: string
}

export const ELITE_BADGE: ModuleBadge = {
  id: 'elite',
  name: 'CyberSense Elite',
  module: 'All Modules',
  moduleId: 0,
  icon: 'fa-crown',
  color: '#ffd700',
  hint: 'Complete all modules',
}

export function generateBadges(
  modules: { id: number; title: string; game_mode: string }[]
): ModuleBadge[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', '&'])
  const gameModeCounters: Record<string, number> = {}

  const moduleBadges: ModuleBadge[] = modules.map((m, globalIndex) => {
    const modeIdx = gameModeCounters[m.game_mode] ?? 0
    gameModeCounters[m.game_mode] = modeIdx + 1

    const firstWord =
      m.title.split(/\s+/).find(w => !stopWords.has(w.toLowerCase())) ?? 'Cyber'
    const suffix = SUFFIXES_BY_MODE[m.game_mode]?.[modeIdx % 5] ?? 'Expert'

    return {
      id: `mod${m.id}`,
      name: `${firstWord} ${suffix}`,
      module: m.title,
      moduleId: m.id,
      icon: ICONS_BY_MODE[m.game_mode]?.[modeIdx % 5] ?? 'fa-star',
      color: NEON_COLORS[globalIndex % NEON_COLORS.length],
      hint: `Complete Module ${m.id}`,
    }
  })

  return [...moduleBadges, ELITE_BADGE]
}

export function getBadgeForModule(
  moduleId: number,
  modules: { id: number; title: string; game_mode: string }[]
): ModuleBadge | undefined {
  return generateBadges(modules).find(b => b.moduleId === moduleId)
}
