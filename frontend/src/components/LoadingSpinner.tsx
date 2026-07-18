import { Loader2 } from 'lucide-react'

interface Props {
  text?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ text = 'Chargement...', fullScreen = false }: Props) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-green-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{text}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <Loader2 size={28} className="animate-spin text-green-500 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">{text}</p>
      </div>
    </div>
  )
}
