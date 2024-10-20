import React, { useEffect, useRef } from "react";
import { useAuth } from "../../context/authContenxt";
import { useNavigate } from "react-router-dom";


function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleLogin = async (e) => {
    e.preventDefault()
    
    const email = emailRef.current.value
    const password = passwordRef.current.value

    if(email, password){
      await auth.Login(email, password)
    }
  };

  useEffect(() => {
      if(auth.currentUser){
        navigate('/private/dashboard')
      }
  },[auth.currentUser])

  return (
    <form
      className=" h-screen w-full flex flex-col justify-center items-center gap-5 [&_input]:border-solid [&_input]:border-2 [&_input]:border-green-900 [&_input]:rounded-md"
      action=""
      onSubmit={handleLogin}
    >
      <h1 className="text-[28px] text-green-950">Login</h1>
      <div className="group flex flex-col items-center">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" ref={emailRef} />
      </div>
      <div className="group flex flex-col items-center">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          ref={passwordRef}
        />
      </div>
      <button type="submit" className="text-white rounded-md px-10 py-3 bg-green-600">
        Login
      </button>
    </form>
  );
}

export default Login;
