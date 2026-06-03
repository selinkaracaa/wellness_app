import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import CheckIn from './pages/CheckIn'
import Social from './pages/Social'
import Challenges from './pages/Challenges'
import Profile from './pages/Profile'
import BrandPreview from './pages/BrandPreview'

function MainLayout() {
  return (
    <div className="max-w-md mx-auto min-h-screen relative page-canvas">
      <Outlet />
      <Navigation />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/brand" element={<BrandPreview />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/social" element={<Social />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
