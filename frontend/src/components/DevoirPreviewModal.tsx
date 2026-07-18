import { X, Download, Brain, FileText, Loader2 } from 'lucide-react'
import { type DevoirDetail } from '../api/devoirs'
import StatusBadge from './StatusBadge'

interface Props {
  devoir: DevoirDetail | null
  onClose: () => void
  onDownload: () => void
  downloading: boolean
}

export default function DevoirPreviewModal({ devoir, onClose, onDownload, downloading }: Props) {
  if (!devoir) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-white font-semibold truncate">{devoir.titre}</h2>
            <StatusBadge statut={devoir.statut} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {devoir.statut === 'termine' && (
              <button
                onClick={onDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Télécharger
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Meta */}
          {devoir.consignes_detectees && (
            <div className="bg-white/3 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5 mb-2">
                <FileText size={12} className="text-primary-500" />
                Analyse
              </p>
              <p className="text-gray-400 text-xs whitespace-pre-wrap">{devoir.consignes_detectees}</p>
            </div>
          )}

          {/* Réponse */}
          {devoir.reponse_generee && (
            <div className="bg-white/3 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5 mb-3">
                <Brain size={12} className="text-primary-500" />
                Réponse générée
              </p>
              <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-sans line-clamp-20 max-h-60 overflow-y-auto">
                {devoir.reponse_generee}
              </pre>
            </div>
          )}

          {devoir.statut === 'traitement' && (
            <div className="text-center py-8">
              <Loader2 size={32} className="animate-spin text-primary-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">L'IA traite le devoir...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
