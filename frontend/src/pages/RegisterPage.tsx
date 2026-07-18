import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { register } from '../api/auth'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Mots de passe différents'); return }
    if (form.password.length < 8) { toast.error('Minimum 8 caractères'); return }
    setLoading(true)
    try {
      await register(form.email, form.username, form.password)
      toast.success('Compte créé ! Connecte-toi.')
      navigate('/login')
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Inscription échouée'
      if (err.code === 'ECONNABORTED' || msg.includes('timeout') || !err.response) {
        toast.error('Le serveur démarre... Réessaie dans 30 secondes.')
      } else {
        toast.error(msg)
      }
    } finally { setLoading(false) }
  }

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap size={26} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-xl">DevoirAI</span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">Crée ton compte étudiant</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Inscription</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'ton@email.com' },
              { key: 'username', label: "Nom d'utilisateur", type: 'text', icon: User, placeholder: 'Ton pseudo' },
            ].map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={type} value={form[key as keyof typeof form]} onChange={update(key)}
                    placeholder={placeholder} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-3 text-sm text-gray-900 placeholder-gray-400" />
                </div>
              </div>
            ))}
            {['password', 'confirm'].map(key => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {key === 'password' ? 'Mot de passe' : 'Confirmer'}
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPwd ? 'text' : 'password'} value={form[key as keyof typeof form]}
                    onChange={update(key)} placeholder="••••••••" required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-3 text-sm text-gray-900 placeholder-gray-400" />
                  {key === 'confirm' && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm mt-2">
              {loading ? 'Création...' : <><span>Créer mon compte</span><ArrowRight size={15} /></>}
            </button>
          </form>
          <p className="text-center text-gray-400 text-xs mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-green-600 hover:underline font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
