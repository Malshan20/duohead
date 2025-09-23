import { ForestLayout } from "@/components/layout/forest-layout"
import { SignInForm } from "@/components/auth/signin-form"

export default function SignInPage() {
  return (
    <ForestLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <SignInForm />
      </div>
    </ForestLayout>
  )
}
