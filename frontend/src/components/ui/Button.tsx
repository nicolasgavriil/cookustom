import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  variant?: ButtonVariant
}

type ButtonLinkProps = LinkProps & {
  icon?: ReactNode
  variant?: ButtonVariant
}

const baseClasses =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold no-underline transition-colors disabled:cursor-not-allowed'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-emerald-800 bg-emerald-800 text-white hover:border-emerald-900 hover:bg-emerald-900 disabled:border-emerald-300 disabled:bg-emerald-300',
  secondary:
    'border border-stone-300 bg-white text-stone-900 hover:border-stone-400 hover:bg-stone-50 disabled:text-stone-400',
  danger:
    'border border-rose-700 bg-rose-700 text-white hover:border-rose-800 hover:bg-rose-800 disabled:border-rose-300 disabled:bg-rose-300',
  ghost:
    'border border-transparent bg-transparent text-stone-700 hover:bg-stone-100 hover:text-emerald-900 disabled:text-stone-400',
}

const getButtonClasses = (
  variant: ButtonVariant,
  className: string | undefined,
) => `${baseClasses} ${variantClasses[variant]} ${className ?? ''}`.trim()

export const Button = ({
  children,
  className,
  icon,
  variant = 'primary',
  ...props
}: ButtonProps) => {
  return (
    <button className={getButtonClasses(variant, className)} {...props}>
      {icon}
      {children}
    </button>
  )
}

export const ButtonLink = ({
  children,
  className,
  icon,
  variant = 'primary',
  ...props
}: ButtonLinkProps) => {
  return (
    <Link className={getButtonClasses(variant, className)} {...props}>
      {icon}
      {children}
    </Link>
  )
}
