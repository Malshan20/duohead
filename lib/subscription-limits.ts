// Define the types for subscription limits
export type SubscriptionTier = "Seedling" | "Forest Guardian" | "Jungle Master"

export interface SubscriptionLimits {
  documents_per_month: number | string
  ai_summary_chars: number | string
  flashcards_per_month: number | string
  quiz_generations?: number | string
  exam_generations: number | string
  voice_tutor_daily_seconds: number
}

// Define the limits for each subscription tier
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  Seedling: {
    documents_per_month: 10,
    ai_summary_chars: 2000,
    flashcards_per_month: 20,
    exam_generations: 10,
    voice_tutor_daily_seconds: 120,
  },
  "Forest Guardian": {
    documents_per_month: 50,
    ai_summary_chars: "Unlimited",
    flashcards_per_month: "Unlimited",
    quiz_generations: "Unlimited",
    exam_generations: 30,
    voice_tutor_daily_seconds: 1800,
  },
  "Jungle Master": {
    documents_per_month: "Unlimited",
    ai_summary_chars: "Unlimited",
    flashcards_per_month: "Unlimited",
    quiz_generations: "Unlimited",
    exam_generations: "Unlimited",
    voice_tutor_daily_seconds: 3600,
  },
}

// Helper function to check if a user has reached their limit
export function hasReachedLimit(
  tier: SubscriptionTier,
  limitType: keyof SubscriptionLimits,
  currentUsage: number,
): boolean {
  const limit = SUBSCRIPTION_LIMITS[tier][limitType]

  // If the limit is "Unlimited", the user hasn't reached the limit
  if (limit === "Unlimited") return false

  // Otherwise, check if the current usage has reached or exceeded the limit
  return currentUsage >= (limit as number)
}

// Helper function to get the remaining usage
export function getRemainingUsage(
  tier: SubscriptionTier,
  limitType: keyof SubscriptionLimits,
  currentUsage: number,
): number | "Unlimited" {
  const limit = SUBSCRIPTION_LIMITS[tier][limitType]

  if (limit === "Unlimited") return "Unlimited"

  const remaining = (limit as number) - currentUsage
  return remaining > 0 ? remaining : 0
}

// Helper function to get a user-friendly message about limits
export function getLimitMessage(
  tier: SubscriptionTier,
  limitType: keyof SubscriptionLimits,
  currentUsage: number,
): string {
  const limit = SUBSCRIPTION_LIMITS[tier][limitType]

  if (limit === "Unlimited") {
    return "You have unlimited usage."
  }

  const remaining = (limit as number) - currentUsage

  if (remaining <= 0) {
    return `You've reached your ${limitType.replace(/_/g, " ")} limit for this month. Upgrade your plan for more.`
  }

  return `You have ${remaining} ${limitType.replace(/_/g, " ")} remaining this month.`
}
