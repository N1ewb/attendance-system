import React, { useState } from 'react';
import { useAuth } from '../../context/authContenxt';

export default function UserIcon() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, Logout } = useAuth();

  const handleLogout = async () => {
    await Logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prevState => !prevState);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center w-10 h-10 bg-green-700 rounded-full hover:bg-green-800 focus:outline-none"
      >
        <span className="text-white text-lg capitalize">{currentUser.displayName.charAt(0)}</span>
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200">
          <ul className="py-2">
            <li className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">Profile</li>
            <li className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">Settings</li>
            <li className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">Logout</li>
          </ul>
        </div>
      )}
    </div>
  );
}
