import { NavLink } from 'react-router-dom'
import { Home, Zap, Users, Trophy, User } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/checkin', icon: Zap, label: 'Check-in' },
  { to: '/social', icon: Users, label: 'Social' },
  { to: '/challenges', icon: Trophy, label: 'Challenges' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Navigation() {
  return (
    <nav className="fixed bottom-5 left-5 right-5 safe-bottom z-50 max-w-md mx-auto pointer-events-none">
      <div className="bg-ink rounded-full flex items-center justify-around px-3 py-3 card-float pointer-events-auto mx-auto max-w-[280px]">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className="tap-scale"
          >
            {({ isActive }) => (
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-white text-ink' : 'text-white/70'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
