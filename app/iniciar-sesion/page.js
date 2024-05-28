"use client"
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { auth } from '../firebase';
import { useAuth } from '@/context/AuthContext';
import {redirect} from "next/navigation"
import toast from 'react-hot-toast';

const Page = () => {


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { userData } = useAuth()

    const handleSignUp = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log(userCredential.user);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSignIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Inicio de sesión exitoso');
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if(userData) redirect("/dashboard")
    }, [userData]);



    return (
        <div className='h-screen w-screen flex flex-col items-center justify-center'>
            <article className='p-8 flex flex-col gap-4 text-center bg-gray rounded-xl'>
                <input
                    className='p-2 text-center w-full rounded-xl'
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />
                <input
                    type="password"
                    className='p-2 text-center w-full rounded-xl'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button onClick={handleSignIn}>Sign In</button>
                {/* <button onClick={handleSignInGoogle}>Google</button> */}
            </article>
        </div>
    )
}

export default Page
