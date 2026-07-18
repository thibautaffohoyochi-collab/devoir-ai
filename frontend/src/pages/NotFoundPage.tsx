import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Search size={36} className="text-gray-300" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-3">404</h1>
        <p className="text-lg font-semibold text-gray-700 mb-2">Page introuvable</p>
        <p className="text-gray-400 text-sm mb-8">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link to="/"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm">
          <Home size={16} />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
