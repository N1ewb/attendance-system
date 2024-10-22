import React, { useEffect, useRef } from "react";
import { useAuth } from "../../context/authContenxt";
import { useNavigate } from "react-router-dom";
import Cirlce1 from "../../images/Circle1.png";
import Cirlce2 from "../../images/Circle2.png";
import Cirlce3 from "../../images/Circle3.png";
import "./Signup.css";

function Signup() {
  const auth = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();

  const handleSignup = async (e) => {
    e.preventDefault();

    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    const firstName = firstNameRef.current.value;
    const lastName = lastNameRef.current.value;

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
      await auth.CreateUser(
        email,
        password,
        confirmPassword,
        firstName,
        lastName
      );
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
    <>
      <div className="bgs">
        <div className="form-container">
          <div className="rightpage">
            <div className="dots">
              <img src={Cirlce1} alt="Circle" />
              <img src={Cirlce2} alt="Circle" />
              <img src={Cirlce3} alt="Circle" />
            </div>
            <form onSubmit={handleSignup}>
              <h1 className="signup">Signup</h1>
              <div className="inputl">
                <input
                  id="firstname"
                  type="text"
                  name="firstname"
                  placeholder="Enter your first name"
                  ref={firstNameRef}
                  required
                />
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  ref={lastNameRef}
                  required
                />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  ref={emailRef}
                  required
                />
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  ref={passwordRef}
                  required
                />
                <input
                  id="confirm-password"
                  type="password"
                  name="confirm-password"
                  placeholder="Confirm password"
                  ref={confirmPasswordRef}
                  required
                />
              </div>
              <button type="submit" className="bttns">
                Sign Up
              </button>
            </form>
          </div>
          <div className="leftpage">
            <div className="dots">
              <p></p>
            </div>
            <h1 className="rtext">
              BRINGING <span>IOT</span> TO LIFE.
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
