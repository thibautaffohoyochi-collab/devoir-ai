import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, FileText, Brain, AlertCircle, Copy, CheckCheck, Edit3, Check, X, RefreshCw } from 'lucide-react'
import { getDevoir, downloadDevoir, relancerDevoir, type DevoirDetail } from '../api/devoirs'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

const FORMAT_ICONS: Record<string, string> = { pdf: '📄', docx: '📝', pptx: '📊', txt: '📃' }

const STEPS = ['Extraction du texte', 'Analyse des consignes', 'Rédaction IA', 'Mise en forme', 'Terminé']

export default function DevoirDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [devoir, setDevoir] = useState<DevoirDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [relaunching, setRelaunching] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(0)

  const fetchDevoir = useCallback(async () => {
    try {
      const data = await getDevoir(Number(id))
      setDevoir(data)
      return data
    } catch {
      toast.error('Devoir introuvable')
      navigate('/dashboard')
      return null
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchDevoir() }, [fetchDevoir])

  useEffect(() => {
    if (!devoir || devoir.statut !== 'traitement') return
    const timer = setInterval(() => setStep(p => p < STEPS.length - 2 ? p + 1 : p), 4000)
    return () => clearInterval(timer)
  }, [devoir?.statut])

  useEffect(() => {
    if (!devoir || devoir.statut === 'termine' || devoir.statut === 'erreur') return
    const interval = setInterval(async () => {
      const updated = await fetchDevoir()
      if (updated?.statut === 'termine') {
        setStep(STEPS.length - 1)
        toast.success('Devoir prêt !')
        clearInterval(interval)
      } else if (updated?.statut === 'erreur') {
        toast.error('Erreur de traitement')
        clearInterval(interval)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [devoir?.statut, fetchDevoir])

  const handleDownload = async () => {
    if (!devoir) return
    setDownloading(true)
    try {
      await downloadDevoir(devoir.id, devoir.titre, devoir.format_sortie)
      toast.success('Téléchargement lancé')
    } catch { toast.error('Erreur') } finally { setDownloading(false) }
  }

  const handleRelaunch = async () => {
    if (!devoir) return
    setRelaunching(true)
    try {
      await relancerDevoir(devoir.id)
      toast.success('Relancé ! L\'IA retraite ton devoir...')
      await fetchDevoir()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur')
    } finally { setRelaunching(false) }
  }

  const handleCopy = async () => {
    if (!devoir?.reponse_generee) return
    await navigator.clipboard.writeText(devoir.reponse_generee)
    setCopied(true)
    toast.success('Copié !')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <LoadingSpinner fullScreen text="Chargement..." />
  if (!devoir) return null

  const pct = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Retour */}
      <button onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-6 text-sm group">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Retour au dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-2xl shrink-0 mt-0.5">{FORMAT_ICONS[devoir.format_sortie] || '📄'}</span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{devoir.titre}</h1>
            <p className="text-gray-400 text-xs mt-1">
              {formatDistanceToNow(new Date(devoir.created_at), { addSuffix: true, locale: fr })}
              {' · '}
              <span className="text-green-600 font-medium uppercase">{devoir.format_sortie}</span>
            </p>
          </div>
        </div>
        {devoir.statut === 'termine' && (
          <button onClick={handleDownload} disabled={downloading}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 shrink-0 shadow-sm">
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Télécharger
          </button>
        )}
        {devoir.statut === 'erreur' && (
          <button onClick={handleRelaunch} disabled={relaunching}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 shrink-0 shadow-sm">
            {relaunching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Relancer
          </button>
        )}
      </div>

      {/* Status */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-sm">
        <StatusBadge statut={devoir.statut} size="md" />
        <span className="text-gray-500 text-sm">
          {devoir.statut === 'traitement' && "L'IA analyse et rédige ta réponse..."}
          {devoir.statut === 'termine' && `Terminé le ${format(new Date(devoir.updated_at), "d MMMM à HH:mm", { locale: fr })}`}
          {devoir.statut === 'en_attente' && "En file d'attente..."}
          {devoir.statut === 'erreur' && "Une erreur est survenue."}
        </span>
      </div>

      {/* Progression */}
      {devoir.statut === 'traitement' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">{STEPS[Math.min(step, STEPS.length - 1)]}</p>
            <p className="text-sm text-green-600 font-bold">{pct}%</p>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Mise à jour automatique — pas besoin de rafraîchir</p>
        </div>
      )}

      {/* Erreur */}
      {devoir.statut === 'erreur' && devoir.reponse_generee && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 flex gap-3">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-600 font-medium text-sm mb-1">Détail de l'erreur</p>
            <p className="text-gray-500 text-xs break-words">{devoir.reponse_generee}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Consignes */}
        {devoir.consignes_detectees && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-3 uppercase tracking-wide">
              <FileText size={13} className="text-green-500" />
              Analyse automatique
            </h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{devoir.consignes_detectees}</p>
          </div>
        )}

        {/* Réponse */}
        {devoir.statut === 'termine' && devoir.reponse_generee && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-500 flex items-center gap-2 uppercase tracking-wide">
                <Brain size={13} className="text-green-500" />
                Réponse générée
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">{devoir.reponse_generee.length} car.</span>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all border border-gray-100">
                  {copied ? <CheckCheck size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
                {!editing && (
                  <button onClick={() => { setEditedText(devoir.reponse_generee!); setEditing(true) }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all border border-gray-100">
                    <Edit3 size={12} /> Modifier
                  </button>
                )}
                {editing && (
                  <>
                    <button onClick={() => setEditing(false)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-red-500 border border-gray-100">
                      <X size={12} /> Annuler
                    </button>
                    <button onClick={() => { setEditing(false); toast.success('Sauvegardé') }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-green-500 text-white hover:bg-green-600">
                      <Check size={12} /> Sauver
                    </button>
                  </>
                )}
              </div>
            </div>

            {editing ? (
              <textarea value={editedText} onChange={e => setEditedText(e.target.value)}
                className="w-full h-80 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 text-sm leading-relaxed resize-y font-sans" />
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 max-h-[55vh] overflow-y-auto">
                <pre className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">{devoir.reponse_generee}</pre>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3 text-center">
              📥 Télécharge le {devoir.format_sortie.toUpperCase()} pour la version mise en forme
            </p>
          </div>
        )}

        {/* En attente */}
        {(devoir.statut === 'traitement' || devoir.statut === 'en_attente') && (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
            <Loader2 size={36} className="animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-1">L'IA travaille sur ton devoir...</p>
            <p className="text-gray-400 text-sm">Cette page se met à jour automatiquement.</p>
          </div>
        )}
      </div>
    </div>
  )
}
