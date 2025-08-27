import { useState } from 'react'
import { Memory } from '@/lib/types'
import { analyzeSentiment, generateMemoryId } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X, Upload, Link as LinkIcon, Sparkles } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MemoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (memory: Memory) => void
  initialData?: {
    latitude: number
    longitude: number
    memory?: Memory
  }
}

export function MemoryForm({ isOpen, onClose, onSave, initialData }: MemoryFormProps) {
  const isEditing = !!initialData?.memory
  const [formData, setFormData] = useState<Partial<Memory>>(() => {
    if (initialData?.memory) {
      return initialData.memory
    }
    return {
      title: '',
      description: '',
      latitude: initialData?.latitude || 0,
      longitude: initialData?.longitude || 0,
      date: new Date().toISOString().split('T')[0],
      photos: [],
      videoLinks: [],
      tags: [],
      isPrivate: false
    }
  })
  
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [videoLinkInput, setVideoLinkInput] = useState('')

  const handleInputChange = (field: keyof Memory, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleInputChange('tags', [...(formData.tags || []), tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || [])
  }

  const addVideoLink = () => {
    if (videoLinkInput.trim()) {
      handleInputChange('videoLinks', [...(formData.videoLinks || []), videoLinkInput.trim()])
      setVideoLinkInput('')
    }
  }

  const removeVideoLink = (linkToRemove: string) => {
    handleInputChange('videoLinks', formData.videoLinks?.filter(link => link !== linkToRemove) || [])
  }

  const generateAIStory = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in title and description first')
      return
    }

    setIsGeneratingStory(true)
    
    try {
      const prompt = spark.llmPrompt`Generate a beautiful, engaging narrative story from this memory:
      
      Title: ${formData.title}
      Description: ${formData.description}
      Date: ${formData.date}
      Location: ${formData.latitude}, ${formData.longitude}
      
      Create a vivid, first-person narrative that captures the emotion and atmosphere of this memory. Make it feel like a personal journal entry or travel story. Keep it around 2-3 paragraphs.`
      
      const story = await spark.llm(prompt)
      handleInputChange('aiStory', story)
      toast.success('AI story generated!')
    } catch (error) {
      toast.error('Failed to generate story. Please try again.')
      console.error('Story generation error:', error)
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const sentiment = analyzeSentiment(`${formData.title} ${formData.description}`)
    
    const memory: Memory = {
      id: formData.id || generateMemoryId(),
      title: formData.title!,
      description: formData.description!,
      latitude: formData.latitude!,
      longitude: formData.longitude!,
      date: formData.date!,
      photos: formData.photos || [],
      videoLinks: formData.videoLinks || [],
      aiStory: formData.aiStory,
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score,
      tags: formData.tags || [],
      isPrivate: formData.isPrivate || false,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(memory)
    onClose()
    toast.success(isEditing ? 'Memory updated!' : 'Memory saved!')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? 'Edit Memory' : 'Create New Memory'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Give your memory a title..."
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your memory in detail..."
                className="mt-1 min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                  className="mt-1"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                  className="mt-1"
                  readOnly
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-semibold">AI Story Generation</h3>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={generateAIStory}
                disabled={isGeneratingStory}
                className="flex items-center space-x-2"
              >
                <Sparkles size={16} />
                <span>{isGeneratingStory ? 'Generating...' : 'Generate AI Story'}</span>
              </Button>
            </div>
            
            {formData.aiStory && (
              <Card>
                <CardContent className="p-4">
                  <Label>Generated Story</Label>
                  <p className="mt-2 text-sm leading-relaxed">{formData.aiStory}</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-semibold">Additional Details</h3>
            
            <div>
              <Label>Tags</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Video Links</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={videoLinkInput}
                  onChange={(e) => setVideoLinkInput(e.target.value)}
                  placeholder="Add a video URL..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addVideoLink()
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={addVideoLink}>
                  <LinkIcon size={16} />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.videoLinks?.map((link, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm truncate flex-1">{link}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeVideoLink(link)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={formData.isPrivate || false}
                onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
              />
              <Label htmlFor="private">Keep this memory private</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Memory' : 'Save Memory'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}