import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Memory, SentimentAnalysis, Badge, UserStats } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

export function analyzeSentiment(text: string): SentimentAnalysis {
  const lowerText = text.toLowerCase()
  
  const happyWords = ['happy', 'joy', 'amazing', 'wonderful', 'great', 'love', 'beautiful', 'perfect', 'excited', 'fun']
  const sadWords = ['sad', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disappointed', 'tragic']
  const nostalgicWords = ['remember', 'nostalgia', 'childhood', 'past', 'memories', 'miss', 'used to', 'back then']
  const excitedWords = ['excited', 'thrilling', 'adventure', 'amazing', 'incredible', 'spectacular', 'awesome']
  
  let happyScore = 0
  let sadScore = 0
  let nostalgicScore = 0
  let excitedScore = 0
  
  happyWords.forEach(word => {
    if (lowerText.includes(word)) happyScore++
  })
  
  sadWords.forEach(word => {
    if (lowerText.includes(word)) sadScore++
  })
  
  nostalgicWords.forEach(word => {
    if (lowerText.includes(word)) nostalgicScore++
  })
  
  excitedWords.forEach(word => {
    if (lowerText.includes(word)) excitedScore++
  })
  
  const maxScore = Math.max(happyScore, sadScore, nostalgicScore, excitedScore)
  
  if (maxScore === 0) {
    return { sentiment: 'neutral', score: 0.5, confidence: 0.3 }
  }
  
  let sentiment: SentimentAnalysis['sentiment'] = 'neutral'
  if (happyScore === maxScore) sentiment = 'happy'
  else if (sadScore === maxScore) sentiment = 'sad'
  else if (nostalgicScore === maxScore) sentiment = 'nostalgic'
  else if (excitedScore === maxScore) sentiment = 'excited'
  
  const confidence = Math.min(maxScore / 3, 1)
  const score = maxScore / (maxScore + 1)
  
  return { sentiment, score, confidence }
}

export function generateMemoryId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function getCountryFromCoordinates(lat: number, lng: number): string {
  // Simplified country detection based on coordinates
  // In a real app, you'd use a reverse geocoding service
  if (lat > 49 && lat < 71 && lng > -141 && lng < -60) return 'Canada'
  if (lat > 25 && lat < 49 && lng > -125 && lng < -66) return 'United States'
  if (lat > 35 && lat < 71 && lng > -10 && lng < 40) return 'Europe'
  if (lat > -35 && lat < 37 && lng > -18 && lng < 55) return 'Africa'
  if (lat > -50 && lat < 55 && lng > 26 && lng < 180) return 'Asia'
  if (lat > -50 && lat < -10 && lng > 110 && lng < 180) return 'Australia'
  if (lat > -60 && lat < 15 && lng > -82 && lng < -35) return 'South America'
  return 'Unknown'
}

export function calculateUserStats(memories: Memory[]): UserStats {
  const countries = new Set<string>()
  const sentimentBreakdown = {
    happy: 0,
    nostalgic: 0,
    sad: 0,
    excited: 0,
    neutral: 0
  }
  
  memories.forEach(memory => {
    const country = getCountryFromCoordinates(memory.latitude, memory.longitude)
    countries.add(country)
    
    if (memory.sentiment) {
      sentimentBreakdown[memory.sentiment]++
    }
  })
  
  return {
    totalMemories: memories.length,
    countriesVisited: countries.size,
    sentimentBreakdown,
    streakDays: calculateStreak(memories),
    badges: []
  }
}

function calculateStreak(memories: Memory[]): number {
  if (memories.length === 0) return 0
  
  const sortedDates = memories
    .map(m => new Date(m.date).toDateString())
    .sort()
    .reverse()
  
  let streak = 0
  let currentDate = new Date()
  
  for (const dateStr of sortedDates) {
    const memoryDate = new Date(dateStr)
    const diffInDays = Math.floor((currentDate.getTime() - memoryDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays <= streak + 1) {
      streak++
      currentDate = memoryDate
    } else {
      break
    }
  }
  
  return streak
}

export function checkBadgeUnlocks(stats: UserStats, memories: Memory[]): Badge[] {
  const badges: Badge[] = []
  
  const badgeDefinitions = [
    {
      id: 'first-memory',
      name: 'First Step',
      description: 'Created your first memory',
      icon: '👶',
      requirement: { type: 'memory_count' as const, threshold: 1 }
    },
    {
      id: 'memory-collector',
      name: 'Memory Collector',
      description: 'Saved 10 memories',
      icon: '📚',
      requirement: { type: 'memory_count' as const, threshold: 10 }
    },
    {
      id: 'world-explorer',
      name: 'World Explorer', 
      description: 'Visited 5 different countries',
      icon: '🌍',
      requirement: { type: 'country_count' as const, threshold: 5 }
    },
    {
      id: 'storyteller',
      name: 'Storyteller',
      description: 'Generated 5 AI stories',
      icon: '📖',
      requirement: { type: 'story_generation' as const, threshold: 5 }
    }
  ]
  
  badgeDefinitions.forEach(badgeDef => {
    let unlocked = false
    
    switch (badgeDef.requirement.type) {
      case 'memory_count':
        unlocked = stats.totalMemories >= badgeDef.requirement.threshold
        break
      case 'country_count':
        unlocked = stats.countriesVisited >= badgeDef.requirement.threshold
        break
      case 'story_generation':
        const storiesCount = memories.filter(m => m.aiStory).length
        unlocked = storiesCount >= badgeDef.requirement.threshold
        break
    }
    
    if (unlocked) {
      badges.push({
        ...badgeDef,
        unlockedAt: new Date().toISOString()
      })
    }
  })
  
  return badges
}
