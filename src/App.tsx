import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import CheckIn from './pages/CheckIn'
import Social from './pages/Social'
import Challenges from './pages/Challenges'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="max-w-md mx-auto min-h-screen relative bg-white shadow-2xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/social" element={<Social />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Navigation />
        </div>
      </AppProvider>
    </BrowserRouter>
  )
}
