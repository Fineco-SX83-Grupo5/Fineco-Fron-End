"use client"

import Image from 'next/image';
import React, { useState } from 'react'

export default function Login () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      // Here you can handle form submission, like sending data to an API
      console.log("Email:", email);
      console.log("Password:", password);
    };
  
    return (
      <div className='w-full h-screen flex justify-center items-center login-bg'>
        <div className='login-container'>
            <Image
              src={`/sign-in.svg`}
              alt="Best Trip Planner"
              width={300} height={300}
              style={{ objectFit: 'contain' }}
              className='w-3/4 xl:w-3/4'
            />
        
        <form onSubmit={handleSubmit}>   
            <input
            placeholder='Username'
            autoComplete='off'
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
         

            <input
            autoComplete='off'
              placeholder='Password'
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
        
          <button type="submit">Login</button>
        </form>
      </div>
      </div>
    );
}

