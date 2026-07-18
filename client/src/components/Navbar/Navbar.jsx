import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import logo from "../../images/logo.png";
import UserIcon from "../usericon/UserIcon";

export const Navbar = () => {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex flex-row items-center justify-between h-[80px] w-full px-4 md:px-10 lg:px-20 py-5 bg-[#1F1E1E] fixed z-40">
      <div className="logo-wrapper shrink-0">
        <img src={logo} alt="logo" className="w-[75px] md:w-[90px]" />
      </div>

      <button
        className="lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <div
        ref={menuRef}
        className={`${
          menuOpen ? "flex" : "hidden"
        } lg:flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10 absolute lg:static top-[80px] left-0 right-0 bg-[#1F1E1E] lg:bg-transparent px-4 py-6 lg:p-0 text-white z-50`}
      >
        <Link
          to="/private/dashboard"
          onClick={closeMenu}
          className="min-h-[44px] flex items-center hover:text-gray-300 transition-colors text-sm lg:text-base"
        >
          HOME
        </Link>
        <a
          href="#about"
          onClick={closeMenu}
          className="min-h-[44px] flex items-center hover:text-gray-300 transition-colors text-sm lg:text-base"
        >
          ABOUT US
        </a>
        <a
          href="#contact"
          onClick={closeMenu}
          className="min-h-[44px] flex items-center hover:text-gray-300 transition-colors text-sm lg:text-base"
        >
          CONTACT US
        </a>
        {currentUser ? (
          <div className="min-h-[44px] flex items-center">
            <UserIcon />
          </div>
        ) : (
          <Link
            to="/auth/Login"
            onClick={closeMenu}
            className="min-h-[44px] flex items-center border border-white px-6 py-2 rounded-lg hover:bg-white hover:text-[#1F1E1E] transition-colors text-sm lg:text-base"
          >
            LOG IN
          </Link>
        )}
      </div>
    </div>
  );
};
