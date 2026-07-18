import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, Send, Info } from 'lucide-react'
import { uploadDevoir } from '../api/devoirs'
import toast from 'react-hot-toast'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
}

const FORMAT_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  'text/plain': 'Texte',
}

const OUTPUT_FORMATS = [
  { value: 'auto', label: '🤖 Détection automatique', desc: 'L\'IA choisit selon les consignes' },
  { value: 'pdf', label: '📄 PDF', desc: 'Rapport, dissertation, essai' },
  { value: 'docx', label: '📝 Word (.docx)', desc: 'Document éditable' },
  { value: 'pptx', label: '📊 PowerPoint', desc: 'Présentation, exposé' },
]

const NIVEAUX = [
  { value: 'auto', label: '🤖 Auto-détection', desc: 'Détecté depuis les consignes' },
  { value: 'lycee', label: '🏫 Lycée / Terminale', desc: 'Bac, terminale' },
  { value: 'licence', label: '🎓 Licence (L1-L3)', desc: 'Fac, université' },
  { value: 'master', label: '📚 Master (M1-M2)', desc: 'Mémoire, master' },
  { value: 'doctorat', label: '🔬 Doctorat', desc: 'Thèse, recherche' },
]

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [titre, setTitre] = useState('')
  const [formatChoisi, setFormatChoisi] = useState('auto')
  const [niveauChoisi, setNiveauChoisi] = useState('auto')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0])
      if (!titre) setTitre(acceptedFiles[0].name.replace(/\.[^.]+$/, ''))
    }
  }, [titre])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED_TYPES, maxFiles: 1, maxSize: 10 * 1024 * 1024,
    onDropRejected: (files) => {
      const err = files[0]?.errors[0]
      if (err?.code === 'file-too-large') toast.error('Fichier trop grand (max 10 MB)')
      else toast.error('Type de fichier non accepté')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { toast.error('Sélectionne un fichier'); return }
    if (!titre.trim()) { toast.error('Entre un titre'); return }
    setLoading(true)
    try {
      const devoir = await uploadDevoir(file, titre, formatChoisi !== 'auto' ? formatChoisi : undefined, niveauChoisi !== 'auto' ? niveauChoisi : undefined)
      toast.success('Devoir soumis ! L\'IA traite...')
      navigate(`/devoirs/${devoir.id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors de l\'upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devoir</h1>
        <p className="text-gray-400 text-sm mt-1">Upload ton devoir et l'IA le résout avec le bon ton académique</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Titre du devoir</label>
          <input
            type="text"
            value={titre}
            onChange={e => setTitre(e.target.value)}
            placeholder="Ex: Dissertation — La liberté selon Sartre"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm"
          />
        </div>

        {/* Dropzone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fichier du devoir</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-green-400 bg-green-50'
              : file ? 'border-green-400 bg-green-50'
              : 'border-gray-200 hover:border-green-300 bg-white hover:bg-green-50/30'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-400">{FORMAT_LABELS[file.type]} · {(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }}
                  className="ml-auto text-gray-300 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Upload size={22} className="text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isDragActive ? 'Dépose ici' : 'Glisse ton devoir ou clique'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  {['PDF', 'DOCX', 'PPTX', 'TXT'].map(f => (
                    <span key={f} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 font-medium">{f}</span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-2">Max 10 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Niveau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'études</label>
          <div className="grid grid-cols-2 gap-2">
            {NIVEAUX.map(n => (
              <button key={n.value} type="button" onClick={() => setNiveauChoisi(n.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  niveauChoisi === n.value
                    ? 'border-green-400 bg-green-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}>
                <p className="text-sm font-medium text-gray-900">{n.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Format de sortie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Format de sortie</label>
          <div className="grid grid-cols-2 gap-2">
            {OUTPUT_FORMATS.map(fmt => (
              <button key={fmt.value} type="button" onClick={() => setFormatChoisi(fmt.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formatChoisi === fmt.value
                    ? 'border-green-400 bg-green-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}>
                <p className="text-sm font-medium text-gray-900">{fmt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{fmt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
          <Info size={15} className="text-green-500 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">
            L'IA détecte automatiquement la <strong>matière</strong>, le <strong>type de devoir</strong> et le <strong>niveau</strong> pour adapter son style de rédaction.
          </p>
        </div>

        <button type="submit" disabled={loading || !file}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm text-sm">
          <Send size={16} />
          {loading ? 'Envoi en cours...' : 'Soumettre le devoir'}
        </button>
      </form>
    </div>
  )
}
