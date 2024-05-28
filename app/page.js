"use client"
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import React from 'react'

const Page = () => {

  const {userData}  = useAuth()

  useEffect(() => {
    if(userData) redirect("/dashboard")
}, [userData]);


  return <div className='flex flex-col h-screen w-screen items-center justify-center gap-10'>
    <h1 className='text-4xl'>¡Bienvenido a Te Fío!</h1>
   <div className='flex flex-row gap-5'>
   <Link href={"/iniciar-sesion"} className='bg-gray p-4 rounded-xl '>
        Inicia sesión
    </Link>
    <Link href={"/registro"} className='bg-gray p-4 rounded-xl '>
        Regístrate
    </Link>
   </div>
  </div>
}

export default Page
