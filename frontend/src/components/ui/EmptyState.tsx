import type { ReactNode } from 'react'

type EmptyStateProps = {
  action?: ReactNode
  description: string
  icon: ReactNode
  title: string
}

export const EmptyState = ({
  action,
  description,
  icon,
  title,
}: EmptyStateProps) => {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-stone-300 bg-white/70 px-6 py-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
        {icon}
      </div>
      <h2 className="m-0 mt-4 text-xl font-bold text-stone-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}
