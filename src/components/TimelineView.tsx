import React from 'react'
import { Memory } from '@/lib/types'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, Camera, Link as LinkIcon, Sparkles, Edit, Heart, SmileySad, Smiley, SmileyXEyes, SmileyMelting } from '@phosphor-icons/react'

interface TimelineViewProps {
  memories: Memory[]
  onEditMemory: (memory: Memory) => void
}

const getSentimentIcon = (sentiment: Memory['sentiment']) => {
  switch (sentiment) {
    case 'happy':
      return <Smiley className="text-amber-500" size={16} />
    case 'excited':
      return <SmileyMelting className="text-red-500" size={16} />
    case 'nostalgic':
      return <Heart className="text-purple-500" size={16} />
    case 'sad':
      return <SmileySad className="text-gray-500" size={16} />
    default:
      return <SmileyXEyes className="text-blue-500" size={16} />
  }
}

const getSentimentColor = (sentiment: Memory['sentiment']) => {
  switch (sentiment) {
    case 'happy':
      return 'bg-amber-500'
    case 'excited':
      return 'bg-red-500'
    case 'nostalgic':
      return 'bg-purple-500'
    case 'sad':
      return 'bg-gray-500'
    default:
      return 'bg-blue-500'
  }
}

export function TimelineView({ memories, onEditMemory }: TimelineViewProps) {
  const sortedMemories = [...memories].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const groupedMemories = sortedMemories.reduce((groups, memory) => {
    const year = new Date(memory.date).getFullYear()
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(memory)
    return groups
  }, {} as Record<number, Memory[]>)

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Clock size={64} className="text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No memories yet</h3>
        <p className="text-muted-foreground">
          Start creating memories on the map to see your timeline
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Your Memory Timeline</h1>
        <p className="text-muted-foreground">
          {memories.length} memories across {Object.keys(groupedMemories).length} year{Object.keys(groupedMemories).length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
        
        {Object.entries(groupedMemories)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([year, yearMemories]) => (
            <div key={year} className="space-y-6">
              {/* Year header */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-display font-bold text-lg relative z-10">
                  {year}
                </div>
                <div className="md:hidden">
                  <h2 className="font-display text-2xl font-bold">{year}</h2>
                </div>
              </div>

              {/* Memories for this year */}
              <div className="space-y-6 md:ml-24">
                {yearMemories.map((memory, index) => (
                  <Card key={memory.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="font-display text-xl">{memory.title}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{formatDate(memory.date)}</span>
                              <span className="text-xs">({formatRelativeDate(memory.date)})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin size={14} />
                              <span>{memory.latitude.toFixed(2)}, {memory.longitude.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(memory.sentiment)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditMemory(memory)}
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-foreground leading-relaxed">{memory.description}</p>

                      {memory.aiStory && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Sparkles size={16} className="text-accent" />
                              <span className="font-medium text-sm">AI Generated Story</span>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <p className="text-sm leading-relaxed italic">{memory.aiStory}</p>
                            </div>
                          </div>
                        </>
                      )}

                      {(memory.photos.length > 0 || memory.videoLinks.length > 0 || memory.tags.length > 0) && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            {memory.photos.length > 0 && (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Camera size={16} />
                                <span>{memory.photos.length} photo{memory.photos.length > 1 ? 's' : ''}</span>
                              </div>
                            )}

                            {memory.videoLinks.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm font-medium">
                                  <LinkIcon size={16} />
                                  <span>Video Links</span>
                                </div>
                                <div className="space-y-1">
                                  {memory.videoLinks.map((link, i) => (
                                    <a
                                      key={i}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                                    >
                                      {link}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {memory.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {memory.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Sentiment indicator */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getSentimentColor(memory.sentiment)}`} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {memory.sentiment || 'neutral'} memory
                          </span>
                        </div>
                        
                        {memory.isPrivate && (
                          <Badge variant="outline" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}