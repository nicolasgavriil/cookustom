type RecipeVariantBadgeProps = {
  parentRecipeId?: number | null
}

export const RecipeVariantBadge = ({
  parentRecipeId,
}: RecipeVariantBadgeProps) => {
  if (parentRecipeId == null) {
    return null
  }

  return (
    <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold tracking-wide text-amber-900 uppercase">
      Variant
    </span>
  )
}
