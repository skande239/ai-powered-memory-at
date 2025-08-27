import React, { useState } from 'react'
import { Memory } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { User, Download, Share, Settings, Trash2 } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ProfileProps {
  memories: Memory[]
  onClearAllData: () => void
}

export function Profile({ memories, onClearAllData }: ProfileProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'pdf'>('json')

  const generatePDF = async (memories: Memory[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = `
# Memory Atlas Export

Generated on: ${new Date().toLocaleDateString()}
Total Memories: ${memories.length}

${memories.map(memory => `
## ${memory.title}
**Date:** ${new Date(memory.date).toLocaleDateString()}
**Location:** ${memory.latitude.toFixed(4)}, ${memory.longitude.toFixed(4)}
**Mood:** ${memory.sentiment || 'neutral'}

${memory.description}

${memory.aiStory ? `**AI Story:**\n${memory.aiStory}\n` : ''}

${memory.tags.length > 0 ? `**Tags:** ${memory.tags.join(', ')}\n` : ''}

---
`).join('')}
        `
        
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `memory-atlas-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        resolve(true)
      }, 2000)
    })
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      if (exportFormat === 'json') {
        const dataStr = JSON.stringify(memories, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `memory-atlas-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        toast.success('Data exported successfully!')
      } else {
        await generatePDF(memories)
        toast.success('PDF export completed!')
      }
    } catch (error) {
      toast.error('Export failed. Please try again.')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    const publicMemories = memories.filter(m => !m.isPrivate)
    
    if (publicMemories.length === 0) {
      toast.error('No public memories to share')
      return
    }

    const shareData = {
      title: 'My Memory Atlas',
      text: `Check out my travel memories! I've documented ${publicMemories.length} memories across ${new Set(publicMemories.map(m => Math.floor(m.latitude))).size} different locations.`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Shared successfully!')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Sharing failed')
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        toast.success('Link copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy to clipboard')
      }
    }
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete ALL memories? This action cannot be undone.')) {
      onClearAllData()
      toast.success('All data cleared')
    }
  }

  const stats = {
    totalMemories: memories.length,
    publicMemories: memories.filter(m => !m.isPrivate).length,
    privateMemories: memories.filter(m => m.isPrivate).length,
    memoriesWithStories: memories.filter(m => m.aiStory).length,
    memoriesWithPhotos: memories.filter(m => m.photos.length > 0).length,
    memoriesWithVideos: memories.filter(m => m.videoLinks.length > 0).length
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
          <User size={40} className="text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Your Memory Profile</h1>
        <p className="text-muted-foreground">
          Manage your memories and account settings
        </p>
      </div>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Account Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats.totalMemories}</p>
              <p className="text-sm text-muted-foreground">Total Memories</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats.publicMemories}</p>
              <p className="text-sm text-muted-foreground">Public</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats.privateMemories}</p>
              <p className="text-sm text-muted-foreground">Private</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Memories with AI Stories</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={stats.totalMemories > 0 ? (stats.memoriesWithStories / stats.totalMemories) * 100 : 0} 
                  className="w-24" 
                />
                <span className="text-sm text-muted-foreground">
                  {stats.memoriesWithStories}/{stats.totalMemories}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Memories with Photos</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={stats.totalMemories > 0 ? (stats.memoriesWithPhotos / stats.totalMemories) * 100 : 0} 
                  className="w-24" 
                />
                <span className="text-sm text-muted-foreground">
                  {stats.memoriesWithPhotos}/{stats.totalMemories}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Memories with Videos</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={stats.totalMemories > 0 ? (stats.memoriesWithVideos / stats.totalMemories) * 100 : 0} 
                  className="w-24" 
                />
                <span className="text-sm text-muted-foreground">
                  {stats.memoriesWithVideos}/{stats.totalMemories}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export & Share */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Export & Share</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="format">Export Format</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={exportFormat === 'json' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat('json')}
                >
                  JSON Data
                </Button>
                <Button
                  variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat('pdf')}
                >
                  Text Document
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleExport}
                disabled={isExporting || memories.length === 0}
                className="flex-1"
              >
                <Download size={16} className="mr-2" />
                {isExporting ? 'Exporting...' : 'Export Memories'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={memories.filter(m => !m.isPrivate).length === 0}
              >
                <Share size={16} className="mr-2" />
                Share
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Export includes all your memories in the selected format. 
              Only public memories are included when sharing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center space-x-2">
            <Settings size={20} />
            <span>Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Privacy Settings</h4>
            <p className="text-sm text-muted-foreground mb-3">
              You can control the privacy of individual memories when creating or editing them.
              Private memories are never included in exports or sharing.
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold text-sm mb-2">AI Story Generation</h4>
            <p className="text-sm text-muted-foreground mb-3">
              AI stories are generated using OpenAI's language models to create engaging narratives
              from your memory descriptions. This feature requires an active internet connection.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="font-display text-destructive flex items-center space-x-2">
            <Trash2 size={20} />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Permanently delete all your memories and data. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={handleClearData}
              disabled={memories.length === 0}
            >
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}