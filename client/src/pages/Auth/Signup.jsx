import React, { useEffect, useRef } from "react";
import { useAuth } from "../../context/authContenxt";
import { useNavigate } from "react-router-dom";

function Signup() {
  const auth = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const firstNameRef = useRef()
  const lastNameRef = useRef()

  const handleSignup = async (e) => {
    e.preventDefault();

    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    const firstName = firstNameRef.current.value
    const lastName = lastNameRef.current.value

    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      alert("All fields are required.");
      return;
    }

    if (password.length < 7) {
      alert("Password should be longer than 7 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await auth.CreateUser(email, password, confirmPassword, firstName, lastName);
    } catch (error) {
      console.error(`Error during registration: ${error}`);
      alert("An error occurred during signup. Please try again.");
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      navigate("/private/dashboard");
    }
  }, [auth.currentUser, navigate]); 

  return (
    <form
      className="h-screen w-full flex flex-col justify-center items-center gap-5 [&_input]:border-solid [&_input]:border-2 [&_input]:border-green-900 [&_input]:rounded-md"
      onSubmit={handleSignup}
    >
      <h1 className="text-[28px] text-green-950">Signup</h1>
      <div className="group flex flex-col items-center">
        <label htmlFor="firstname">First Name</label>
        <input id="firstname" type="text" name="firstname" ref={firstNameRef} />
      </div>
      <div className="group flex flex-col items-center">
        <label htmlFor="lastName">Last Name</label>
        <input id="lastName" type="text" name="lastName" ref={lastNameRef} />
      </div>
      <div className="group flex flex-col items-center">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" ref={emailRef} required />
      </div>
      <div className="group flex flex-col items-center">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          ref={passwordRef}
          required
        />
      </div>
      <div className="group flex flex-col items-center">
        <label htmlFor="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          name="confirm-password"
          ref={confirmPasswordRef}
          required
        />
      </div>
      <button
        type="submit"
        className="text-white rounded-md px-10 py-3 bg-green-600"
      >
        Signup
      </button>
    </form>
  );
}

export default Signup;
