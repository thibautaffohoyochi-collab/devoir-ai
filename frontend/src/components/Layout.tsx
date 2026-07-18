import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LayoutDashboard, Upload, LogOut, GraduationCap, UserCircle, Sun, Moon } from 'lucide-react'
import NotificationBell from './NotificationBell'
import { useThemeStore } from '../store/themeStore'

export default function Layout() {
  const { dark, toggle } = useThemeStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Nouveau devoir' },
    { to: '/profil', icon: UserCircle, label: 'Mon profil' },
  ]

  // Titre de la page courante
  const pageTitle = navItems.find(n => location.pathname === n.to)?.label
    || (location.pathname.startsWith('/devoirs/') ? 'Détail du devoir' : 'DevoirAI')

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap size={17} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">DevoirAI</p>
              <p className="text-xs text-gray-400 mt-0.5">Assistant étudiant</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to ||
              (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <Icon size={16} />
                <span>{label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-2 px-1">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700">{pageTitle}</h2>
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              title={dark ? 'Mode clair' : 'Mode sombre'}>
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <NotificationBell />
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
