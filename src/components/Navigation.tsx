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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 safe-bottom z-50 max-w-md mx-auto">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 tap-scale ${
                isActive
                  ? 'text-purple-600'
                  : 'text-slate-400 hover:text-purple-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-purple-100' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-purple-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
