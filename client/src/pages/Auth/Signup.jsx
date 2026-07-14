import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import Cirlce1 from "../../images/Circle1.png";
import Cirlce2 from "../../images/Circle2.png";
import Cirlce3 from "../../images/Circle3.png";
import "./Signup.css";

function Signup() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();

  const validate = () => {
    const errs = {};
    if (!emailRef.current?.value) errs.email = "Email is required";
    if (!passwordRef.current?.value) errs.password = "Password is required";
    else if (passwordRef.current.value.length < 7) errs.password = "Password must be at least 7 characters";
    if (!confirmPasswordRef.current?.value) errs.confirmPassword = "Please confirm your password";
    else if (passwordRef.current?.value !== confirmPasswordRef.current?.value) errs.confirmPassword = "Passwords do not match";
    if (!firstNameRef.current?.value) errs.firstName = "First name is required";
    if (!lastNameRef.current?.value) errs.lastName = "Last name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const user = await auth.CreateUser(
      emailRef.current.value,
      passwordRef.current.value,
      firstNameRef.current.value,
      lastNameRef.current.value
    );
    setSubmitting(false);

    if (user) {
      navigate("/private/dashboard");
    }
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
                />
                {errors.firstName && <span className="text-red-500 text-sm mx-10">{errors.firstName}</span>}
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  ref={lastNameRef}
                />
                {errors.lastName && <span className="text-red-500 text-sm mx-10">{errors.lastName}</span>}
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  ref={emailRef}
                />
                {errors.email && <span className="text-red-500 text-sm mx-10">{errors.email}</span>}
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  ref={passwordRef}
                />
                {errors.password && <span className="text-red-500 text-sm mx-10">{errors.password}</span>}
                <input
                  id="confirm-password"
                  type="password"
                  name="confirm-password"
                  placeholder="Confirm password"
                  ref={confirmPasswordRef}
                />
                {errors.confirmPassword && <span className="text-red-500 text-sm mx-10">{errors.confirmPassword}</span>}
              </div>
              <button type="submit" className="bttns" disabled={submitting}>
                {submitting ? "Creating account..." : "Sign Up"}
              </button>
              <p className="text-center text-white mt-4">
                Already have an account?{" "}
                <Link to="/auth/Login" className="underline cursor-pointer">Log in</Link>
              </p>
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
