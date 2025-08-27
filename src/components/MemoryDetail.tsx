import { Memory } from '@/lib/types'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, Camera, Link as LinkIcon, Sparkles, Edit, Heart, SmileySad, Smiley, SmileyXEyes, SmileyMelting, Lock } from '@phosphor-icons/react'

interface MemoryDetailProps {
  memory: Memory | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memory: Memory) => void
}

const getSentimentIcon = (sentiment: Memory['sentiment']) => {
  switch (sentiment) {
    case 'happy':
      return <Smiley className="text-amber-500" size={24} />
    case 'excited':
      return <SmileyMelting className="text-red-500" size={24} />
    case 'nostalgic':
      return <Heart className="text-purple-500" size={24} />
    case 'sad':
      return <SmileySad className="text-gray-500" size={24} />
    default:
      return <SmileyXEyes className="text-blue-500" size={24} />
  }
}

const getSentimentDescription = (sentiment: Memory['sentiment']) => {
  switch (sentiment) {
    case 'happy':
      return 'A joyful memory'
    case 'excited':
      return 'An thrilling experience'
    case 'nostalgic':
      return 'A cherished memory'
    case 'sad':
      return 'A somber moment'
    default:
      return 'A neutral memory'
  }
}

export function MemoryDetail({ memory, isOpen, onClose, onEdit }: MemoryDetailProps) {
  if (!memory) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="font-display text-2xl">{memory.title}</DialogTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{formatDate(memory.date)}</span>
                  <span className="text-xs">({formatRelativeDate(memory.date)})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={16} />
                  <span>{memory.latitude.toFixed(4)}, {memory.longitude.toFixed(4)}</span>
                </div>
                {memory.isPrivate && (
                  <div className="flex items-center space-x-1">
                    <Lock size={16} />
                    <span>Private</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button variant="outline" onClick={() => onEdit(memory)}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sentiment Badge */}
          <div className="flex items-center space-x-3">
            {getSentimentIcon(memory.sentiment)}
            <div>
              <p className="font-medium capitalize">{memory.sentiment || 'neutral'}</p>
              <p className="text-sm text-muted-foreground">
                {getSentimentDescription(memory.sentiment)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <p className="leading-relaxed">{memory.description}</p>
            </CardContent>
          </Card>

          {/* AI Story */}
          {memory.aiStory && (
            <>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles size={20} className="text-accent" />
                  <h3 className="font-display text-lg font-semibold">AI Generated Story</h3>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-r from-accent/10 to-primary/10 p-6 rounded-lg">
                      <p className="leading-relaxed italic text-foreground/90">{memory.aiStory}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Tags */}
          {memory.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {memory.photos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Camera size={20} />
                <h3 className="font-display text-lg font-semibold">
                  Photos ({memory.photos.length})
                </h3>
              </div>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Photo attachments will be displayed here in a future update.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Video Links */}
          {memory.videoLinks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <LinkIcon size={20} />
                <h3 className="font-display text-lg font-semibold">Video Links</h3>
              </div>
              <div className="space-y-2">
                {memory.videoLinks.map((link, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 break-all"
                      >
                        {link}
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-muted/50 p-4 rounded-lg text-xs space-y-1">
            <p><strong>Created:</strong> {formatDate(memory.createdAt)}</p>
            <p><strong>Updated:</strong> {formatDate(memory.updatedAt)}</p>
            <p><strong>Memory ID:</strong> {memory.id}</p>
            {memory.sentimentScore && (
              <p><strong>Sentiment Score:</strong> {(memory.sentimentScore * 100).toFixed(1)}%</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}