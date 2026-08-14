import { Play } from 'lucide-react'
import { useNavigate } from 'react-router'

import { useDemoSessionMutation } from '../queries/authQueries'
import { Button, type ButtonVariant } from './ui/Button'

type DemoButtonProps = {
  buttonClassName?: string
  className?: string
  variant?: ButtonVariant
}

export const DemoButton = ({
  buttonClassName,
  className,
  variant,
}: DemoButtonProps) => {
  const navigate = useNavigate()
  const demoSessionMutation = useDemoSessionMutation()
  const error =
    demoSessionMutation.error instanceof Error
      ? demoSessionMutation.error.message
      : null

  const handleClick = () => {
    demoSessionMutation.reset()
    demoSessionMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/recipes')
      },
    })
  }

  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`.trim()}>
      <Button
        className={buttonClassName}
        icon={<Play className="size-4" aria-hidden="true" />}
        type="button"
        variant={variant}
        disabled={demoSessionMutation.isPending}
        onClick={handleClick}
      >
        {demoSessionMutation.isPending ? 'Preparing demo...' : 'Explore demo'}
      </Button>
      {error ? (
        <p className="m-0 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
