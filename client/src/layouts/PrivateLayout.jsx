import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContenxt'

function PrivateLayout() {
  const {currentUser} = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if(!currentUser){
      navigate('/')
    }
  },[currentUser])
  return (
    <div><Outlet /></div>
  )
}

export default PrivateLayout