import { useEffect, useState } from 'react'
import { Loader2, Wifi } from 'lucide-react'

export default function ServerStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'waking'>('checking')

  useEffect(() => {
    const check = async () => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        const res = await fetch(
          import.meta.env.PROD
            ? 'https://devoir-ai-backend.onrender.com/health'
            : '/api/../health',
          { signal: controller.signal }
        )
        clearTimeout(timeout)
        if (res.ok) setStatus('online')
        else setStatus('waking')
      } catch {
        setStatus('waking')
      }
    }
    check()
  }, [])

  if (status === 'online' || status === 'checking') return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-lg">
        <Loader2 size={16} className="animate-spin text-orange-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-orange-700">Serveur en cours de démarrage...</p>
          <p className="text-xs text-orange-500">Patiente 30-60 secondes (plan gratuit Render)</p>
        </div>
        <Wifi size={16} className="text-orange-400 shrink-0" />
      </div>
    </div>
  )
}
