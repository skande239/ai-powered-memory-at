import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Memory, ViewMode } from '@/lib/types'
import { Navigation } from '@/components/Navigation'
import { WorldMap } from '@/components/WorldMap'
import { MemoryForm } from '@/components/MemoryForm'
import { MemoryDetail } from '@/components/MemoryDetail'
import { TimelineView } from '@/components/TimelineView'
import { Dashboard } from '@/components/Dashboard'
import { Profile } from '@/components/Profile'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [memories, setMemories] = useKV<Memory[]>('memories', [])
  const [activeView, setActiveView] = useState<ViewMode>('map')
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [isMemoryFormOpen, setIsMemoryFormOpen] = useState(false)
  const [isMemoryDetailOpen, setIsMemoryDetailOpen] = useState(false)
  const [memoryFormData, setMemoryFormData] = useState<{
    latitude: number
    longitude: number
    memory?: Memory
  } | null>(null)

  const handleLocationSelect = (lat: number, lng: number) => {
    setMemoryFormData({ latitude: lat, longitude: lng })
    setIsMemoryFormOpen(true)
  }

  const handleMemorySelect = (memory: Memory) => {
    setSelectedMemory(memory)
    setIsMemoryDetailOpen(true)
  }

  const handleEditMemory = (memory: Memory) => {
    setMemoryFormData({
      latitude: memory.latitude,
      longitude: memory.longitude,
      memory
    })
    setIsMemoryDetailOpen(false)
    setIsMemoryFormOpen(true)
  }

  const handleSaveMemory = (memory: Memory) => {
    setMemories(currentMemories => {
      const existingIndex = currentMemories.findIndex(m => m.id === memory.id)
      if (existingIndex >= 0) {
        // Update existing memory
        const updated = [...currentMemories]
        updated[existingIndex] = memory
        return updated
      } else {
        // Add new memory
        return [...currentMemories, memory]
      }
    })
    setMemoryFormData(null)
  }

  const handleClearAllData = () => {
    setMemories([])
    setSelectedMemory(null)
    setMemoryFormData(null)
    setIsMemoryFormOpen(false)
    setIsMemoryDetailOpen(false)
  }

  const renderCurrentView = () => {
    switch (activeView) {
      case 'map':
        return (
          <WorldMap
            memories={memories}
            onLocationSelect={handleLocationSelect}
            onMemorySelect={handleMemorySelect}
            selectedMemory={selectedMemory}
          />
        )
      case 'timeline':
        return (
          <TimelineView
            memories={memories}
            onEditMemory={handleEditMemory}
          />
        )
      case 'dashboard':
        return <Dashboard memories={memories} />
      case 'profile':
        return (
          <Profile
            memories={memories}
            onClearAllData={handleClearAllData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold">Memory Atlas</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered travel memories
              </p>
            </div>
            <Navigation 
              activeView={activeView} 
              onViewChange={setActiveView} 
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`container mx-auto p-4 ${activeView === 'map' ? 'h-[calc(100vh-120px)]' : ''}`}>
        <div className={activeView === 'map' ? 'h-full' : 'min-h-[calc(100vh-200px)]'}>
          {renderCurrentView()}
        </div>
      </main>

      {/* Modals */}
      <MemoryForm
        isOpen={isMemoryFormOpen}
        onClose={() => {
          setIsMemoryFormOpen(false)
          setMemoryFormData(null)
        }}
        onSave={handleSaveMemory}
        initialData={memoryFormData || undefined}
      />

      <MemoryDetail
        memory={selectedMemory}
        isOpen={isMemoryDetailOpen}
        onClose={() => {
          setIsMemoryDetailOpen(false)
          setSelectedMemory(null)
        }}
        onEdit={handleEditMemory}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

export default App