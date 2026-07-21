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

function Signup() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const emailRef = useRef()
  const passwordRef = useRef()
  const confirmPasswordRef = useRef()
  const firstNameRef = useRef()
  const lastNameRef = useRef()

  const validate = () => {
    const errs = {}
    if (!emailRef.current?.value) errs.email = "Email is required"
    if (!passwordRef.current?.value) errs.password = "Password is required"
    else if (passwordRef.current.value.length < 7) errs.password = "Password must be at least 7 characters"
    if (!confirmPasswordRef.current?.value) errs.confirmPassword = "Please confirm your password"
    else if (passwordRef.current?.value !== confirmPasswordRef.current?.value) errs.confirmPassword = "Passwords do not match"
    if (!firstNameRef.current?.value) errs.firstName = "First name is required"
    if (!lastNameRef.current?.value) errs.lastName = "Last name is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const user = await auth.CreateUser(
      emailRef.current.value,
      passwordRef.current.value,
      firstNameRef.current.value,
      lastNameRef.current.value
    )
    setSubmitting(false)

    if (user) {
      navigate("/private/dashboard")
    }
  }

  useEffect(() => {
    if (auth.currentUser && !auth.loading) {
      navigate("/private/dashboard")
    }
  }, [auth.currentUser, auth.loading, navigate])

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${backgroundImg})` }}>
      <div className="flex w-full max-w-4xl border-8 border-[#1F1E1E] rounded-lg overflow-hidden shadow-2xl">
        <div className="flex-1 bg-black flex flex-col">
          <div className="flex gap-2 p-3 bg-[#1F1E1E]">
            <img src={Cirlce1} alt="" className="w-5 h-5" />
            <img src={Cirlce2} alt="" className="w-5 h-5" />
            <img src={Cirlce3} alt="" className="w-5 h-5" />
          </div>

          <Card className="bg-transparent border-0 shadow-none text-white flex-1 flex flex-col justify-center">
            <CardContent className="pt-0">
              <form onSubmit={handleSignup} className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-center text-white mb-6">
                  Signup
                </h1>

                <div className="space-y-1 w-3/5 mx-auto">
                  <Label htmlFor="firstname" className="text-white text-sm">First Name</Label>
                  <Input
                    id="firstname"
                    type="text"
                    placeholder="Enter your first name"
                    ref={firstNameRef}
                    className="bg-white text-black border-0 text-sm h-10 rounded-md"
                  />
                  {errors.firstName && <p className="text-red-400 text-xs">{errors.firstName}</p>}
                </div>

                <div className="space-y-1 w-3/5 mx-auto">
                  <Label htmlFor="lastName" className="text-white text-sm">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    ref={lastNameRef}
                    className="bg-white text-black border-0 text-sm h-10 rounded-md"
                  />
                  {errors.lastName && <p className="text-red-400 text-xs">{errors.lastName}</p>}
                </div>

                <div className="space-y-1 w-3/5 mx-auto">
                  <Label htmlFor="email" className="text-white text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    ref={emailRef}
                    className="bg-white text-black border-0 text-sm h-10 rounded-md"
                  />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                </div>

                <div className="space-y-1 w-3/5 mx-auto">
                  <Label htmlFor="password" className="text-white text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    ref={passwordRef}
                    className="bg-white text-black border-0 text-sm h-10 rounded-md"
                  />
                  {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                </div>

                <div className="space-y-1 w-3/5 mx-auto">
                  <Label htmlFor="confirm-password" className="text-white text-sm">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    ref={confirmPasswordRef}
                    className="bg-white text-black border-0 text-sm h-10 rounded-md"
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
                </div>

                <div className="w-3/5 mx-auto pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#701515] hover:bg-[#661414] text-white font-bold text-base h-11 rounded-md"
                  >
                    {submitting ? "Creating account..." : "Sign Up"}
                  </Button>
                </div>

                <p className="text-center text-white mt-4">
                  Already have an account?{" "}
                  <Link to="/auth/Login" className="underline cursor-pointer">Log in</Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 bg-black bg-cover bg-center bg-no-repeat relative hidden md:block" style={{ backgroundImage: `url(${handImg})` }}>
          <div className="flex gap-2 p-3 bg-[#1F1E1E]">
            <span className="w-5 h-5" />
          </div>
          <h1 className="text-white text-5xl lg:text-6xl font-bold text-center px-4 mt-28">
            BRINGING <span className="text-[#701515]">IOT</span> TO LIFE.
          </h1>
        </div>
      </div>
    </div>
  )
}

export default Signup
