import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Loader2, Download, Trash2, Search, Filter, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { listDevoirs, deleteDevoir, downloadDevoir, type DevoirSummary } from '../api/devoirs'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

const FORMAT_ICONS: Record<string, string> = { pdf: '📄', docx: '📝', pptx: '📊', txt: '📃' }
const FORMAT_COLORS: Record<string, string> = {
  pdf: 'text-red-600 bg-red-50 border-red-100',
  docx: 'text-blue-600 bg-blue-50 border-blue-100',
  pptx: 'text-orange-600 bg-orange-50 border-orange-100',
}

export default function DashboardPage() {
  const [devoirs, setDevoirs] = useState<DevoirSummary[]>([])
  const [filtered, setFiltered] = useState<DevoirSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [filterFormat, setFilterFormat] = useState('tous')
  const { user } = useAuthStore()

  const fetchDevoirs = useCallback(async () => {
    try {
      const data = await listDevoirs()
      setDevoirs(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDevoirs() }, [fetchDevoirs])

  useEffect(() => {
    const hasActive = devoirs.some(d => d.statut === 'traitement' || d.statut === 'en_attente')
    if (!hasActive) return
    const interval = setInterval(fetchDevoirs, 4000)
    return () => clearInterval(interval)
  }, [devoirs, fetchDevoirs])

  useEffect(() => {
    let result = [...devoirs]
    if (search.trim()) result = result.filter(d => d.titre.toLowerCase().includes(search.toLowerCase()))
    if (filterStatut !== 'tous') result = result.filter(d => d.statut === filterStatut)
    if (filterFormat !== 'tous') result = result.filter(d => d.format_sortie === filterFormat)
    setFiltered(result)
  }, [devoirs, search, filterStatut, filterFormat])

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!confirm('Supprimer ce devoir ?')) return
    try {
      await deleteDevoir(id)
      setDevoirs(prev => prev.filter(d => d.id !== id))
      toast.success('Supprimé')
    } catch { toast.error('Erreur') }
  }

  const handleDownload = async (d: DevoirSummary, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (d.statut !== 'termine') return
    try {
      await downloadDevoir(d.id, d.titre, d.format_sortie)
      toast.success('Téléchargement lancé')
    } catch { toast.error('Erreur') }
  }

  const stats = {
    total: devoirs.length,
    termine: devoirs.filter(d => d.statut === 'termine').length,
    enCours: devoirs.filter(d => d.statut === 'traitement' || d.statut === 'en_attente').length,
    taux: devoirs.length > 0 ? Math.round((devoirs.filter(d => d.statut === 'termine').length / devoirs.length) * 100) : 0,
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.username} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Voici l'ensemble de tes devoirs traités</p>
        </div>
        <Link to="/upload"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm">
          <Plus size={16} />
          Nouveau devoir
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total soumis', value: stats.total, icon: FileText, color: 'text-gray-700', bg: 'bg-gray-100' },
          { label: 'Terminés', value: stats.termine, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'En cours', value: stats.enCours, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Taux réussite', value: `${stats.taux}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={15} className={color} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      {devoirs.length > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un devoir..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          <Filter size={14} className="text-gray-400" />
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700">
            <option value="tous">Tous statuts</option>
            <option value="termine">Terminés</option>
            <option value="traitement">En cours</option>
            <option value="erreur">Erreurs</option>
          </select>
          <select value={filterFormat} onChange={e => setFilterFormat(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700">
            <option value="tous">Tous formats</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="pptx">PowerPoint</option>
          </select>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <LoadingSpinner text="Chargement..." />
      ) : devoirs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-400 mb-4 text-sm">Aucun devoir pour l'instant</p>
          <Link to="/upload" className="text-green-600 hover:underline font-medium text-sm">
            Soumettre ton premier devoir →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
          <p className="text-gray-400 text-sm">Aucun résultat</p>
          <button onClick={() => { setSearch(''); setFilterStatut('tous'); setFilterFormat('tous') }}
            className="text-green-600 hover:underline text-sm mt-2">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-3">{filtered.length} devoir{filtered.length > 1 ? 's' : ''}</p>
          {filtered.map(d => (
            <Link key={d.id} to={`/devoirs/${d.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-green-200 hover:shadow-sm transition-all group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border ${FORMAT_COLORS[d.format_sortie] || 'bg-gray-50 border-gray-100'} shrink-0`}>
                {FORMAT_ICONS[d.format_sortie] || '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                  {d.titre}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(d.created_at), { addSuffix: true, locale: fr })}
                  </p>
                  {d.matiere_detectee && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md capitalize">
                      {d.matiere_detectee}
                    </span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded-md border uppercase font-medium ${FORMAT_COLORS[d.format_sortie] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {d.format_sortie}
                  </span>
                </div>
              </div>
              <StatusBadge statut={d.statut} />
              <div className="flex items-center gap-1 shrink-0" onClick={e => e.preventDefault()}>
                {d.statut === 'termine' && (
                  <button onClick={e => handleDownload(d, e)}
                    className="p-2 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Télécharger">
                    <Download size={14} />
                  </button>
                )}
                <button onClick={e => handleDelete(d.id, e)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
