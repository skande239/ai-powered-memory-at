import { Memory, UserStats } from '@/lib/types'
import { calculateUserStats, checkBadgeUnlocks } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { MapPin, Clock, Trophy, TrendUp, Smiley, Heart, SmileySad, SmileyXEyes, SmileyMelting } from '@phosphor-icons/react'

interface DashboardProps {
  memories: Memory[]
}

const SENTIMENT_COLORS = {
  happy: '#F59E0B',
  excited: '#EF4444',
  nostalgic: '#8B5CF6',
  sad: '#6B7280',
  neutral: '#3B82F6'
}

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'happy':
      return <Smiley className="text-amber-500" size={20} />
    case 'excited':
      return <SmileyMelting className="text-red-500" size={20} />
    case 'nostalgic':
      return <Heart className="text-purple-500" size={20} />
    case 'sad':
      return <SmileySad className="text-gray-500" size={20} />
    default:
      return <SmileyXEyes className="text-blue-500" size={20} />
  }
}

export function Dashboard({ memories }: DashboardProps) {
  const stats = calculateUserStats(memories)
  const badges = checkBadgeUnlocks(stats, memories)
  
  const sentimentData = Object.entries(stats.sentimentBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([sentiment, count]) => ({
      name: sentiment,
      value: count,
      color: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS]
    }))

  const monthlyData = memories.reduce((acc, memory) => {
    const date = new Date(memory.date)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    acc[monthYear] = (acc[monthYear] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(monthlyData)
    .sort()
    .slice(-12) // Last 12 months
    .map(([monthYear, count]) => ({
      month: new Date(monthYear + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      memories: count
    }))

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <TrendUp size={64} className="text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No data to display</h3>
        <p className="text-muted-foreground">
          Create some memories to see your analytics
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Memory Analytics</h1>
        <p className="text-muted-foreground">
          Insights from your {memories.length} memories
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="text-primary" size={20} />
              <div>
                <p className="text-2xl font-bold">{stats.totalMemories}</p>
                <p className="text-sm text-muted-foreground">Total Memories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="text-forest-green">🌍</div>
              <div>
                <p className="text-2xl font-bold">{stats.countriesVisited}</p>
                <p className="text-sm text-muted-foreground">Countries Visited</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="text-secondary" size={20} />
              <div>
                <p className="text-2xl font-bold">{stats.streakDays}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="text-accent" size={20} />
              <div>
                <p className="text-2xl font-bold">{badges.length}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {sentimentData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(stats.sentimentBreakdown).map(([sentiment, count]) => {
                    if (count === 0) return null
                    const percentage = Math.round((count / stats.totalMemories) * 100)
                    return (
                      <div key={sentiment} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(sentiment)}
                          <span className="text-sm capitalize">{sentiment}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={percentage} 
                            className="w-16" 
                          />
                          <span className="text-sm text-muted-foreground w-8">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No sentiment data available</p>
            )}
          </CardContent>
        </Card>

        {/* Memory Creation Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Memory Creation Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="memories" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No timeline data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl">{badge.icon}</div>
                  <div>
                    <h4 className="font-semibold">{badge.name}</h4>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    {badge.unlockedAt && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy size={48} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No badges earned yet</p>
              <p className="text-sm text-muted-foreground">Keep adding memories to unlock achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Most Common Mood</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const topSentiment = Object.entries(stats.sentimentBreakdown)
                .sort(([,a], [,b]) => b - a)[0]
              
              if (!topSentiment || topSentiment[1] === 0) {
                return <p className="text-muted-foreground">No data</p>
              }
              
              const [sentiment, count] = topSentiment
              const percentage = Math.round((count / stats.totalMemories) * 100)
              
              return (
                <div className="flex items-center space-x-3">
                  {getSentimentIcon(sentiment)}
                  <div>
                    <p className="font-semibold capitalize">{sentiment}</p>
                    <p className="text-sm text-muted-foreground">
                      {percentage}% of memories ({count} total)
                    </p>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">AI Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-2xl font-bold">{memories.filter(m => m.aiStory).length}</p>
              <p className="text-sm text-muted-foreground">
                out of {memories.length} memories have AI stories
              </p>
              <Progress 
                value={(memories.filter(m => m.aiStory).length / memories.length) * 100} 
                className="mt-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Privacy Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-2xl font-bold">{memories.filter(m => !m.isPrivate).length}</p>
              <p className="text-sm text-muted-foreground">
                public memories out of {memories.length} total
              </p>
              <Progress 
                value={(memories.filter(m => !m.isPrivate).length / memories.length) * 100} 
                className="mt-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}