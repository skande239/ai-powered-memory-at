import { ViewMode } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MapPin, Clock, BarChart3, User } from '@phosphor-icons/react'

interface NavigationProps {
  activeView: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}

export function Navigation({ activeView, onViewChange, className }: NavigationProps) {
  const navItems = [
    { id: 'map' as ViewMode, label: 'Map', icon: MapPin },
    { id: 'timeline' as ViewMode, label: 'Timeline', icon: Clock },
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: BarChart3 },
    { id: 'profile' as ViewMode, label: 'Profile', icon: User }
  ]

  return (
    <nav className={cn('flex items-center space-x-1 p-1 bg-card rounded-lg border', className)}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeView === item.id
        
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              isActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}