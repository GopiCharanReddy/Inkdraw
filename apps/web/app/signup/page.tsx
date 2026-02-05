import { Suspense } from "react"
import { AuthPage } from "../../components/auth/AuthComponent"
import { LoaderFour } from "@/components/ui/loader"

const Signup = () => {
  return (
    <>
      <Suspense fallback={<LoaderFour />}>
        <AuthPage isSignin={false} />
      </Suspense>
    </>
  )
}

export default Signup