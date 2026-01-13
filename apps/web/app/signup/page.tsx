import { Suspense } from "react"
import { AuthPage } from "../../components/AuthComponent"

const Signup = () => {
  return (
    <>
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPage isSignin={false} />
    </Suspense>
    </>
  )
}

export default Signup