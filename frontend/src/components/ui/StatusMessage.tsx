import type { ReactNode } from 'react'
import { AlertCircle, Info, LoaderCircle } from 'lucide-react'

type StatusMessageTone = 'danger' | 'neutral'

type StatusMessageProps = {
  children: ReactNode
  loading?: boolean
  tone?: StatusMessageTone
}

const toneClasses: Record<StatusMessageTone, string> = {
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
  neutral: 'border-stone-200 bg-white/70 text-stone-600',
}

export const StatusMessage = ({
  children,
  loading = false,
  tone = 'neutral',
}: StatusMessageProps) => {
  const Icon = tone === 'danger' ? AlertCircle : loading ? LoaderCircle : Info

  return (
    <p
      className={`mt-8 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${toneClasses[tone]}`}
    >
      <Icon
        className={loading ? 'size-4 animate-spin' : 'size-4'}
        aria-hidden="true"
      />
      {children}
    </p>
  )
}
