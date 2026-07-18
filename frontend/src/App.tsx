import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import DevoirDetailPage from './pages/DevoirDetailPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated())
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  // Redirige vers dashboard si déjà connecté (pour login/register)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated())
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Landing page — accessible toujours */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth — redirige si déjà connecté */}
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

      {/* App — nécessite connexion */}
      <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="devoirs/:id" element={<DevoirDetailPage />} />
        <Route path="profil" element={<ProfilePage />} />
      </Route>

      {/* Raccourcis sans /app */}
      <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="/upload" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<UploadPage />} />
      </Route>
      <Route path="/devoirs/:id" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DevoirDetailPage />} />
      </Route>
      <Route path="/profil" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
