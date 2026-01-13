import { Suspense } from "react"
import { AuthPage } from "../../components/AuthComponent"

const Signin = () => {
  return (
    <>
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPage isSignin={true} />
    </Suspense>
    </>
  )
}
export default Signin