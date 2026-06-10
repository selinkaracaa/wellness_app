import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import CheckIn from './pages/CheckIn'
import Social from './pages/Social'
import Challenges from './pages/Challenges'
import Profile from './pages/Profile'
import BrandPreview from './pages/BrandPreview'
import Onboarding from './pages/Onboarding'
import FontCompare from './pages/FontCompare'

function MainLayout() {
  const { state } = useApp()
  const showNav = state.onboardingComplete

  return (
    <div className="max-w-md mx-auto min-h-screen relative page-canvas">
      <Outlet />
      {showNav && <Navigation />}
    </div>
  )
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { state } = useApp()
  if (!state.onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/brand" element={<BrandPreview />} />
          <Route path="/fonts" element={<FontCompare />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<OnboardingGuard><Home /></OnboardingGuard>} />
            <Route path="/cycles" element={<OnboardingGuard><Social /></OnboardingGuard>} />
            <Route path="/leaderboards" element={<OnboardingGuard><Challenges /></OnboardingGuard>} />
            <Route path="/profile" element={<OnboardingGuard><Profile /></OnboardingGuard>} />
            <Route path="/checkin" element={<OnboardingGuard><CheckIn /></OnboardingGuard>} />
            <Route path="/social" element={<Navigate to="/cycles" replace />} />
            <Route path="/challenges" element={<Navigate to="/leaderboards" replace />} />
            <Route path="/weekly" element={<Navigate to="/profile" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
