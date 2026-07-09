import type { ReactNode } from 'react'

type PageHeaderProps = {
  actions?: ReactNode
  description?: string
  eyebrow: string
  icon?: ReactNode
  title: string
}

export const PageHeader = ({
  actions,
  description,
  eyebrow,
  icon,
  title,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex gap-4">
        {icon ? (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">
            {icon}
          </div>
        ) : null}
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-emerald-800 uppercase">
            {eyebrow}
          </p>
          <h1 className="m-0 text-3xl leading-tight font-bold text-stone-950 sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="m-0 mt-3 max-w-3xl text-base leading-7 text-stone-600">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}
