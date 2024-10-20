import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="h-screen w-full p-24 flex flex-col items-center">
      <header>This is Landing Page</header>
      <main className="">
        <div className="auth-buttons flex flex-row gap-10">
          <Link to="/auth/Login">Login</Link>
          <Link to="/auth/Signup">Signup</Link>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
