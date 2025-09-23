import { Suspense } from "react"
import { ThankYouPageContent } from "@/components/auth/thank-you-page"
import { ForestLayout } from "@/components/layout/forest-layout"
import { Loader2 } from "lucide-react"

function ThankYouPageFallback() {
  return (
    <ForestLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    </ForestLayout>
  )
}

export default function ThankYou() {
  return (
    <Suspense fallback={<ThankYouPageFallback />}>
      <ThankYouPageContent />
    </Suspense>
  )
}
