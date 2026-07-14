import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import Cirlce1 from "../../images/Circle1.png";
import Cirlce2 from "../../images/Circle2.png";
import Cirlce3 from "../../images/Circle3.png";
import "./Login.css";

function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailRef.current?.value || !passwordRef.current?.value) return;

    setSubmitting(true);
    await auth.Login(emailRef.current.value, passwordRef.current.value);
    setSubmitting(false);
  };

  useEffect(() => {
    if (auth.currentUser && !auth.loading) {
      navigate("/private/dashboard");
    }
  }, [auth.currentUser, auth.loading, navigate]);

  return (
    <>
      <div className="bgs">
        <div className="form-container">
          <div className="leftpage">
            <div className="dots">
              <img src={Cirlce1} alt="Circle" />
              <img src={Cirlce2} alt="Circle" />
              <img src={Cirlce3} alt="Circle" />
            </div>
            <h1 className="rtext">
              BRINGING <span>IOT</span> TO LIFE.
            </h1>
          </div>
          <div className="rightpage">
            <div className="dots">
              <p></p>
            </div>
            <form onSubmit={handleLogin}>
              <h1 className="login">Log In</h1>
              <div className="inputs">
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  ref={emailRef}
                />
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  ref={passwordRef}
                />
              </div>
              <button type="submit" className="bttn" disabled={submitting}>
                {submitting ? "Logging in..." : "Log In"}
              </button>
              <p>
                Don&apos;t have an account?{" "}
                <span>
                  <Link to="/auth/Signup">Sign up</Link>
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
