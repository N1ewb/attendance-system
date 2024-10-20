import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar";
import { useAuth } from "../context/authContenxt";

export const Layout = () => {
  const {currentUser} = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if(currentUser){
      navigate('/private/dashboard')
    }
  },[currentUser])
  return (
    <div className="flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
};
