import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { LatLngTuple, Icon } from 'leaflet'
import { Memory, MapPin as MapPinType } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Heart, Camera } from '@phosphor-icons/react'

interface WorldMapProps {
  memories: Memory[]
  onLocationSelect: (lat: number, lng: number) => void
  onMemorySelect: (memory: Memory) => void
  selectedMemory?: Memory | null
}

// Custom marker icons for different sentiments
const createCustomIcon = (sentiment: Memory['sentiment']) => {
  const colors = {
    happy: '#F59E0B', // amber
    excited: '#EF4444', // red
    nostalgic: '#8B5CF6', // purple
    sad: '#6B7280', // gray
    neutral: '#3B82F6' // blue
  }
  
  const color = colors[sentiment || 'neutral']
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  })
}

function MapEventHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    }
  })
  return null
}

export function WorldMap({ memories, onLocationSelect, onMemorySelect, selectedMemory }: WorldMapProps) {
  const mapRef = useRef<any>(null)
  const defaultCenter: LatLngTuple = [40.7128, -74.0060] // NYC

  useEffect(() => {
    // Fix for Leaflet default markers
    delete (Icon.Default.prototype as any)._getIconUrl
    Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  }, [])

  const handleMemoryClick = (memory: Memory) => {
    onMemorySelect(memory)
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler onLocationSelect={onLocationSelect} />
        
        {memories.map((memory) => (
          <Marker
            key={memory.id}
            position={[memory.latitude, memory.longitude]}
            icon={createCustomIcon(memory.sentiment)}
            eventHandlers={{
              click: () => handleMemoryClick(memory)
            }}
          >
            <Popup>
              <Card className="border-0 shadow-none max-w-xs">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">{memory.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {memory.description}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MapPin size={12} />
                      <span>{new Date(memory.date).toLocaleDateString()}</span>
                    </div>
                    {memory.photos.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Camera size={12} />
                        <span>{memory.photos.length} photo{memory.photos.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleMemoryClick(memory)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Floating action button for adding new memories */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => {
            // Center of current map view
            const map = mapRef.current
            if (map) {
              const center = map.getCenter()
              onLocationSelect(center.lat, center.lng)
            } else {
              onLocationSelect(defaultCenter[0], defaultCenter[1])
            }
          }}
        >
          <Plus size={24} />
        </Button>
      </div>
      
      {/* Legend */}
      <Card className="absolute top-4 left-4 z-10">
        <CardContent className="p-3">
          <h4 className="font-medium text-sm mb-2">Mood Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Happy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Excited</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Nostalgic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Sad</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Neutral</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}