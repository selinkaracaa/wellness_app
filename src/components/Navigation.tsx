import { NavLink } from 'react-router-dom'
import { Home, Users, CircleCheck, Trophy, User } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/cycles', icon: Users, label: 'Cycles' },
  { to: '/checkin', icon: CircleCheck, label: 'Check-in' },
  { to: '/leaderboards', icon: Trophy, label: 'Ranks' },
  { to: '/profile', icon: User, label: 'You' },
]

export default function Navigation() {
  return (
    <nav className="fixed bottom-6 left-4 right-4 safe-bottom z-50 max-w-md mx-auto pointer-events-none">
      <div className="nav-glass rounded-[1.75rem] flex items-stretch px-1 py-1.5 pointer-events-auto mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className="tap-scale flex-1">
            {({ isActive }) => (
              <div className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive ? 'bg-white text-ink' : 'text-white/55'
                  }`}
                >
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.75} />
                </div>
                <span
                  className={`text-[9px] font-semibold mt-1 tracking-wide transition-colors ${
                    isActive ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
