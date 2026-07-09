import { SearchX } from 'lucide-react'

import { PageHeader } from '../components/ui/PageHeader'

export const NotFoundPage = () => {
  return (
    <section className="max-w-2xl">
      <PageHeader
        eyebrow="404"
        title="Page not found"
        description="The page you are looking for does not exist."
        icon={<SearchX className="size-6" aria-hidden="true" />}
      />
    </section>
  )
}
