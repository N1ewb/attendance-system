import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/authContenxt'


export const Navbar = () => {
  const {currentUser, Logout} = useAuth()

  const handleLogout = async () => {
    await Logout()
  }

  return (
    <div className='flex flex-row items-center justify-between h-[80px] w-full px-20 py-5 bg-[#323232] fixed'>
        <div className="logo-wrapper w-1/2">
            <img src='' alt='logo' />
        </div>
        <div className="nav-links w-1/2 flex flex-row justify-around">
            <Link to='/private/dashboard'>Dashboard</Link>
            <Link to='#'>About US</Link>
            <Link to='#'>Contact US</Link>
            {currentUser? <><button onClick={handleLogout}>Logout</button></> : <><Link to='/auth/Login'>Login</Link><Link to='/auth/Signup'>Sign Up</Link></>}
        </div>
    </div>
  )
}
