import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AppProvider, useAuth } from './context/AppContext'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import CheckIn from './pages/CheckIn'
import Social from './pages/Social'
import Challenges from './pages/Challenges'
import Profile from './pages/Profile'
import BrandPreview from './pages/BrandPreview'
import Auth from './pages/Auth'
import DecorativeOrb from './components/ui/DecorativeOrb'

function MainLayout() {
  return (
    <div className="max-w-md mx-auto min-h-screen relative page-canvas">
      <Outlet />
      <Navigation />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="max-w-md mx-auto min-h-screen page-canvas flex items-center justify-center">
      <DecorativeOrb size={90} className="animate-pulse" />
    </div>
  )
}

function AppRoutes() {
  const { status } = useAuth()

  return (
    <Routes>
      {/* Brand reference page is public and stateless. */}
      <Route path="/brand" element={<BrandPreview />} />

      {status === 'authenticated' ? (
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/social" element={<Social />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      ) : (
        <Route path="*" element={status === 'loading' ? <LoadingScreen /> : <Auth />} />
      )}
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
