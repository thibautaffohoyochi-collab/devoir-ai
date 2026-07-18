import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  GraduationCap, Upload, Brain, Download, ArrowRight,
  CheckCircle, Zap, Star, BookOpen, FileText, Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated())
  const user = useAuthStore(s => s.user)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">DevoirAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#fonctionnement" className="hover:text-gray-900 transition-colors">Comment ça marche</a>
          <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
          <a href="#resultats" className="hover:text-gray-900 transition-colors">Résultats</a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-500 hidden md:block">Bonjour, {user?.username}</span>
              <Link to="/dashboard"
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                Dashboard <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors">
                Connexion
              </Link>
              <Link to="/register"
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                Commencer <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-green-200">
            <Zap size={12} />
            ASSISTANT ÉTUDIANT IA
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
            Résous tes devoirs<br />
            <span className="text-green-500">en 30 secondes</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Upload ton devoir, l'IA rédige avec un style étudiant naturel
            et te livre le fichier prêt à rendre — PDF, Word ou PowerPoint.
          </p>
          <div className="flex items-center gap-4">
            <Link to={isAuthenticated ? "/upload" : "/register"}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg">
              <Upload size={18} />
              {isAuthenticated ? "Soumettre un devoir" : "Essayer gratuitement"}
            </Link>
            <a href="#fonctionnement"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-7 py-3.5 rounded-xl transition-all text-sm font-medium">
              Voir comment ça marche
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">✓ Gratuit · ✓ Sans carte bancaire · ✓ Résultat en 30s</p>
        </div>

        {/* Illustration côté droit */}
        <div className="relative flex items-center justify-center">
          <div className="w-72 h-72 bg-green-50 rounded-full flex items-center justify-center relative">
            <div className="w-48 h-48 bg-green-100 rounded-full flex items-center justify-center">
              <GraduationCap size={80} className="text-green-500" />
            </div>
            {/* Bulles flottantes */}
            {[
              { icon: FileText, label: 'PDF', pos: 'top-4 right-8', bg: 'bg-white' },
              { icon: Brain, label: 'IA', pos: 'bottom-8 right-4', bg: 'bg-green-500 text-white' },
              { icon: Download, label: 'Export', pos: 'bottom-4 left-8', bg: 'bg-white' },
              { icon: Star, label: 'A+', pos: 'top-8 left-4', bg: 'bg-yellow-50' },
            ].map(({ icon: Icon, label, pos, bg }) => (
              <div key={label}
                className={`absolute ${pos} ${bg} rounded-2xl shadow-lg p-3 flex flex-col items-center gap-1 border border-gray-100`}>
                <Icon size={20} className={bg.includes('green-5') ? 'text-white' : 'text-gray-700'} />
                <span className={`text-xs font-bold ${bg.includes('green-5') ? 'text-white' : 'text-gray-700'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOGOS UNIVERSITÉS ──────────────────────────────────── */}
      <section className="border-y border-gray-100 py-8 bg-gray-50">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-6 font-medium">
            Utilisé par des étudiants de toutes les filières
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {['Licence', 'Master', 'BTS', 'BUT', 'Terminale', 'Doctorat'].map(level => (
              <span key={level} className="text-gray-400 font-semibold text-sm tracking-wide">{level}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ──────────────────────────────────── */}
      <section id="fonctionnement" className="max-w-5xl mx-auto px-8 py-20">
        <p className="text-center text-green-600 text-xs font-bold uppercase tracking-widest mb-3">COMMENT ÇA MARCHE</p>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">3 étapes, c'est tout</h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          De l'upload à la remise du devoir en moins d'une minute.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Upload,
              num: '01',
              title: 'Upload ton devoir',
              desc: 'Glisse ton fichier PDF, Word, PowerPoint ou texte. L\'IA extrait automatiquement le sujet et les consignes.',
              color: 'bg-blue-50 text-blue-500',
            },
            {
              icon: Brain,
              num: '02',
              title: 'L\'IA analyse et rédige',
              desc: 'Détection automatique : matière, type de devoir, niveau. Rédaction avec style étudiant naturel et indétectable.',
              color: 'bg-green-50 text-green-500',
            },
            {
              icon: Download,
              num: '03',
              title: 'Télécharge le résultat',
              desc: 'Fichier mis en forme prêt à rendre. PDF académique, Word avec styles, ou PowerPoint avec thème visuel.',
              color: 'bg-purple-50 text-purple-500',
            },
          ].map(({ icon: Icon, num, title, desc, color }) => (
            <div key={num} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={22} />
              </div>
              <div className="text-xs font-bold text-gray-300 mb-2">{num}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              <a href="#" className="flex items-center gap-1 text-green-600 text-sm font-medium mt-4 hover:gap-2 transition-all">
                En savoir plus <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA VERT ───────────────────────────────────────────── */}
      <section className="mx-8 md:mx-auto max-w-5xl mb-20">
        <div className="bg-gray-900 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Prêt à gagner du temps ?</h2>
            <p className="text-gray-400 text-sm">
              Rejoins des milliers d'étudiants qui utilisent DevoirAI chaque jour.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to={isAuthenticated ? "/upload" : "/register"}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-all whitespace-nowrap">
              {isAuthenticated ? "Soumettre un devoir" : "Démarrer gratuitement"} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="max-w-5xl mx-auto px-8 py-20">
        <p className="text-center text-green-600 text-xs font-bold uppercase tracking-widest mb-3">FONCTIONNALITÉS</p>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Tout ce dont tu as besoin
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: Brain,
              title: 'Style vraiment étudiant',
              desc: 'L\'IA écrit comme un étudiant brillant. Phrases naturelles, opinions personnelles, vocabulaire varié. Indétectable.',
              tag: 'Anti-détection',
              tagColor: 'bg-red-50 text-red-600',
            },
            {
              icon: Zap,
              title: '3 LLM en cascade',
              desc: 'Gemini, Groq et OpenRouter en fallback automatique. Si l\'un est en limite, les autres prennent le relais.',
              tag: 'Toujours disponible',
              tagColor: 'bg-green-50 text-green-600',
            },
            {
              icon: Sparkles,
              title: 'Détection intelligente',
              desc: 'Matière (philo, éco, droit...), type (dissertation, rapport...) et niveau (lycée, licence, master) détectés auto.',
              tag: 'IA avancée',
              tagColor: 'bg-purple-50 text-purple-600',
            },
            {
              icon: FileText,
              title: 'Export professionnel',
              desc: 'PDF avec numérotation, Word avec styles académiques, PowerPoint avec thème visuel sombre élégant.',
              tag: '3 formats',
              tagColor: 'bg-blue-50 text-blue-600',
            },
          ].map(({ icon: Icon, title, desc, tag, tagColor }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 flex gap-4 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={20} className="text-gray-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor}`}>{tag}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RÉSULTATS ──────────────────────────────────────────── */}
      <section id="resultats" className="max-w-5xl mx-auto px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-3">RÉSULTATS</p>
            <h2 className="text-3xl font-bold text-gray-900">Ce que disent les étudiants</h2>
          </div>
          <p className="text-gray-500 text-sm max-w-xs text-right">
            Des milliers d'étudiants économisent des heures chaque semaine.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { stat: '+95%', label: 'Taux de satisfaction', desc: 'Devoirs rendus dans les délais avec une bonne note.' },
            { stat: '30s', label: 'Temps de traitement', desc: 'De l\'upload au fichier téléchargeable.' },
            { stat: '3 LLM', label: 'Modèles IA gratuits', desc: 'Gemini, Groq et OpenRouter en cascade.' },
          ].map(({ stat, label, desc }) => (
            <div key={stat} className="bg-gray-900 rounded-2xl p-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle size={20} className="text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat}</p>
              <p className="text-green-400 font-medium text-sm mb-2">{label}</p>
              <p className="text-gray-500 text-sm">{desc}</p>
              <a href="#" className="flex items-center gap-1 text-green-400 text-sm font-medium mt-4 hover:gap-2 transition-all">
                En savoir plus <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Prêt à passer au niveau supérieur ?</p>
              <p className="text-gray-500 text-sm">Crée ton compte et soumets ton premier devoir en 30 secondes.</p>
            </div>
          </div>
          <Link to={isAuthenticated ? "/upload" : "/register"}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all whitespace-nowrap shrink-0">
            {isAuthenticated ? "Aller à l'app" : "Commencer"} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">DevoirAI</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#fonctionnement" className="hover:text-gray-900">Comment ça marche</a>
            <a href="#features" className="hover:text-gray-900">Fonctionnalités</a>
            <a href="#resultats" className="hover:text-gray-900">Résultats</a>
          </div>
          <p className="text-gray-400 text-sm">© 2025 DevoirAI</p>
        </div>
      </footer>

    </div>
  )
}
