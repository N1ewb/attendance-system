import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContenxt";
import logo from "../../images/logo.png";
import "./Navbar.css";
import UserIcon from "../usericon/UserIcon";

export const Navbar = () => {
  const { currentUser } = useAuth();
  return (
    <div className="flex flex-row items-center justify-between h-[80px] w-full px-20 py-5 bg-[#1F1E1E] fixed">
      <div className="logo-wrapper w-1/2">
        <img src={logo} alt="logo" />
      </div>
      <div className="nav-links w-1/2 flex flex-row items-center justify-around text-white">
        <Link to="/private/dashboard">HOME</Link>
        <a href="#about">ABOUT US</a>
        <a href="#contact">CONTACT US</a>
        {currentUser ? (
          <>
            <UserIcon />
          </>
        ) : (
          <>
            <Link to="/auth/Login" className="link-Login">
              LOG IN
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
