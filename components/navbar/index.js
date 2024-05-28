"use client"
import { useAuth } from '@/context/AuthContext'
import React from 'react'
import { FaUser } from 'react-icons/fa6'

const NavBar = () => {
  const { userData } = useAuth()
  return <nav className="heading flex flex-row items-center justify-between text-text bg-gray">
    <h1 className='text-3xl'>Te fío</h1>
    {
      userData ?
        <button className='flex flex-row items-center justify-center gap-4'>
          {userData.Nombre_Establecimiento}
          <FaUser />
        </button>
        : ""
    }
  </nav>
}

export default NavBar
