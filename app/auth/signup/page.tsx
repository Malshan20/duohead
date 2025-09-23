import { ForestLayout } from "@/components/layout/forest-layout"
import { SignUpForm } from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <ForestLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <SignUpForm />
      </div>
    </ForestLayout>
  )
}
