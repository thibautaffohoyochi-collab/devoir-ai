import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { User, Mail, Shield, Key, Save, Loader2 } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [changingPwd, setChangingPwd] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handlePwdChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.next !== pwdForm.confirm) { toast.error('Mots de passe différents'); return }
    if (pwdForm.next.length < 8) { toast.error('Minimum 8 caractères'); return }
    setLoading(true)
    try {
      await api.post('/auth/change-password', { current_password: pwdForm.current, new_password: pwdForm.next })
      toast.success('Mot de passe mis à jour')
      setChangingPwd(false)
      setPwdForm({ current: '', next: '', confirm: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-400 text-sm mt-1">Gère ton compte et tes paramètres</p>
      </div>

      {/* Avatar + infos */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold shadow-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.username}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full border border-green-100">
              ✓ Compte actif
            </span>
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Informations</h3>
        {[
          { icon: User, label: "Nom d'utilisateur", value: user?.username },
          { icon: Mail, label: 'Email', value: user?.email },
          { icon: Shield, label: 'Rôle', value: 'Étudiant' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={14} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mot de passe */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key size={14} className="text-green-500" />
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mot de passe</h3>
          </div>
          {!changingPwd && (
            <button onClick={() => setChangingPwd(true)}
              className="text-xs text-green-600 hover:underline font-medium">
              Modifier
            </button>
          )}
        </div>

        {!changingPwd ? (
          <p className="text-gray-300 text-sm">••••••••••</p>
        ) : (
          <form onSubmit={handlePwdChange} className="space-y-3">
            {[
              { key: 'current', label: 'Mot de passe actuel' },
              { key: 'next', label: 'Nouveau mot de passe' },
              { key: 'confirm', label: 'Confirmer' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input type="password" value={pwdForm[key as keyof typeof pwdForm]}
                  onChange={e => setPwdForm({ ...pwdForm, [key]: e.target.value })}
                  placeholder="••••••••" required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900" />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setChangingPwd(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Sauvegarder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
