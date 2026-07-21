import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../context/authContext"
import { useNavigate, Link } from "react-router-dom"
import Cirlce1 from "../../images/Circle1.png"
import Cirlce2 from "../../images/Circle2.png"
import Cirlce3 from "../../images/Circle3.png"
import backgroundImg from "../../images/background.png"
import handImg from "../../images/hand.png"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const emailRef = useRef()
  const passwordRef = useRef()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!emailRef.current?.value || !passwordRef.current?.value) return

    setSubmitting(true)
    await auth.Login(emailRef.current.value, passwordRef.current.value)
    setSubmitting(false)
  }

  useEffect(() => {
    if (auth.currentUser && !auth.loading) {
      navigate("/private/dashboard")
    }
  }, [auth.currentUser, auth.loading, navigate])

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${backgroundImg})` }}>
      <div className="flex w-full max-w-4xl border-8 border-[#1F1E1E] rounded-lg overflow-hidden shadow-2xl">
        <div className="flex-1 bg-black bg-cover bg-center bg-no-repeat relative hidden md:block" style={{ backgroundImage: `url(${handImg})` }}>
          <div className="flex gap-2 p-3 bg-[#1F1E1E]">
            <img src={Cirlce1} alt="" className="w-5 h-5" />
            <img src={Cirlce2} alt="" className="w-5 h-5" />
            <img src={Cirlce3} alt="" className="w-5 h-5" />
          </div>
          <h1 className="text-white text-5xl lg:text-6xl font-bold text-center px-4 mt-28">
            BRINGING <span className="text-[#701515]">IOT</span> TO LIFE.
          </h1>
        </div>

        <div className="flex-1 bg-black flex flex-col">
          <div className="flex gap-2 p-3 bg-[#1F1E1E]">
            <span className="w-5 h-5" />
          </div>

          <Card className="bg-transparent border-0 shadow-none text-white flex-1 flex flex-col justify-center">
            <CardContent className="pt-0">
              <form onSubmit={handleLogin} className="space-y-5">
                <h1 className="text-5xl lg:text-6xl font-bold text-center text-white mb-8">
                  Log In
                </h1>

                <div className="space-y-1.5 w-3/5 mx-auto">
                  <Label htmlFor="email" className="text-white text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    ref={emailRef}
                    className="bg-white text-black border-0 text-base h-11 rounded-md"
                  />
                </div>

                <div className="space-y-1.5 w-3/5 mx-auto">
                  <Label htmlFor="password" className="text-white text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    ref={passwordRef}
                    className="bg-white text-black border-0 text-base h-11 rounded-md"
                  />
                </div>

                <div className="w-3/5 mx-auto pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#701515] hover:bg-[#661414] text-white font-bold text-lg h-12 rounded-md"
                  >
                    {submitting ? "Logging in..." : "Log In"}
                  </Button>
                </div>

                <p className="text-center text-white">
                  Don&apos;t have an account?{" "}
                  <Link to="/auth/Signup" className="hover:underline cursor-pointer">
                    Sign up
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login
