import { Clock, Loader2, CheckCircle, XCircle } from 'lucide-react'

const STATUS_MAP = {
  en_attente: { label: 'En attente', Icon: Clock, cls: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
  traitement: { label: 'En cours', Icon: Loader2, cls: 'text-blue-600 bg-blue-50 border-blue-100', spin: true },
  termine: { label: 'Terminé', Icon: CheckCircle, cls: 'text-green-600 bg-green-50 border-green-100' },
  erreur: { label: 'Erreur', Icon: XCircle, cls: 'text-red-500 bg-red-50 border-red-100' },
}

interface Props {
  statut: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ statut, size = 'sm' }: Props) {
  const cfg = STATUS_MAP[statut as keyof typeof STATUS_MAP] ?? STATUS_MAP.en_attente
  const { Icon, label, cls } = cfg as typeof cfg & { spin?: boolean }
  const spin = (cfg as any).spin

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${cls} ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}>
      <Icon size={size === 'sm' ? 11 : 13} className={spin ? 'animate-spin' : ''} />
      {label}
    </span>
  )
}
