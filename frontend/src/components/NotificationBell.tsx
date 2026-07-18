import { useEffect, useState, useCallback } from 'react'
import { Bell, CheckCircle, X, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listDevoirs, type DevoirSummary } from '../api/devoirs'

interface Notif {
  id: number
  titre: string
  format: string
  time: Date
  read: boolean
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [prevIds, setPrevIds] = useState<Set<number>>(new Set())

  const check = useCallback(async () => {
    try {
      const devoirs = await listDevoirs()
      const termines = devoirs.filter((d: DevoirSummary) => d.statut === 'termine')

      const newNotifs: Notif[] = []
      termines.forEach((d: DevoirSummary) => {
        if (!prevIds.has(d.id)) {
          newNotifs.push({
            id: d.id,
            titre: d.titre,
            format: d.format_sortie,
            time: new Date(),
            read: false,
          })
        }
      })

      if (newNotifs.length > 0) {
        setNotifs(prev => [...newNotifs, ...prev].slice(0, 10))
        setPrevIds(new Set(termines.map((d: DevoirSummary) => d.id)))
      } else if (prevIds.size === 0) {
        setPrevIds(new Set(termines.map((d: DevoirSummary) => d.id)))
      }
    } catch { /* silencieux */ }
  }, [prevIds])

  useEffect(() => {
    check()
    const interval = setInterval(check, 8000)
    return () => clearInterval(interval)
  }, [])

  const unread = notifs.filter(n => !n.read).length

  const markAll = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  const dismiss = (id: number) => setNotifs(prev => prev.filter(n => n.id !== id))

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAll() }}
        className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              {notifs.length > 0 && (
                <button onClick={() => setNotifs([])}
                  className="text-xs text-gray-400 hover:text-gray-600">
                  Tout effacer
                </button>
              )}
            </div>

            {notifs.length === 0 ? (
              <div className="py-8 text-center">
                <Bell size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucune notification</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {notifs.map(n => (
                  <div key={`${n.id}-${n.time.getTime()}`}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-green-50/50' : ''}`}>
                    <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={15} className="text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{n.titre}</p>
                      <p className="text-xs text-gray-400">Devoir terminé · {n.format.toUpperCase()}</p>
                      <Link to={`/devoirs/${n.id}`} onClick={() => setOpen(false)}
                        className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1 hover:underline">
                        Voir <ExternalLink size={10} />
                      </Link>
                    </div>
                    <button onClick={() => dismiss(n.id)}
                      className="text-gray-300 hover:text-gray-500 shrink-0">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
