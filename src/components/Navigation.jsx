import {
	Link,
	useLocation } from 'react-router-dom'
import {
	Home,
	Briefcase,
	Play,
	BarChart3,
	Users }       from 'lucide-react'
import { cn }   from '../lib/utils'

export function Navigation() {
  const location = useLocation()

  const navItems = [
    { href: "/", label: "Feed", icon: Home },
    { href: "/business", label: "Business", icon: Briefcase },
    { href: "/", label: "Reels", icon: Play },
    { href: "/", label: "Levels", icon: BarChart3 },
    { href: "/", label: "Creators", icon: Users },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.href

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive ? "text-orange-500" : "text-gray-400 hover:text-white",
              )}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
