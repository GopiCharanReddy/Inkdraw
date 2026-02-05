import { Suspense } from "react"
import { AuthPage } from "../../components/auth/AuthComponent"
import { LoaderFour } from "@/components/ui/loader"

const Signin = () => {
  return (
    <>
      <Suspense fallback={<LoaderFour />}>
        <AuthPage isSignin={true} />
      </Suspense>
    </>
  )
}
export default Signin