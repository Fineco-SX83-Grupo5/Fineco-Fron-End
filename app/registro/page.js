"use client"
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { auth, db } from '../firebase';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const Page = () => {


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {userData} = useAuth()


    const handleSignUp = async () => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          await setDoc(doc(db, "establecimientos", user.uid), {
            Nombre_Establecimiento: DatosFormulario.Nombre_Establecimiento,
            Telefono: DatosFormulario.Telefono,
            Direccion: DatosFormulario.Direccion,
            Correo: user.email,
          });
          toast.success('Cuenta creada con éxito');
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            toast.error('El correo ya está en uso. Redirigiendo al inicio de sesión...');
            setTimeout(() => {
              redirect('/iniciar-sesion');
            }, 2000); // Espera 2 segundos antes de redirigir
          } else {
            toast.error('Error al crear la cuenta');
            console.log(error);
          }
        }
      };


    const [ProcedimientoRegistro, setProcedimientoRegistro] = useState(0)
    const [DatosFormulario, setDatosFormulario] = useState({
        Nombre_Establecimiento: "",
        Telefono: "",
        Direccion: ""
    })

    const VerificarSiguienteProcedimientoRegistro = () => {
        if (ProcedimientoRegistro === 0) {
            if(email === "" || password === "") {
                alert("Por favor, llene todos los campos")
                return
            }
            if(password.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres")
                return
            }
            if (!validateEmail(email)) {
                alert("Por favor, ingrese un correo válido  ")
                return;
              }
            setProcedimientoRegistro(1)
        } else {
            if(DatosFormulario.Nombre_Establecimiento === "" || DatosFormulario.Telefono === "" || DatosFormulario.Direccion === "") {
                alert("Por favor, llene todos los campos")
                return
            }
            if(DatosFormulario.Telefono.length < 9) {
                alert("Por favor, ingrese un número de teléfono válido")
                return
            }
            handleSignUp()
        }
    }

    // const handleSignInGoogle = async () => {
    //     const provider = new GoogleAuthProvider();
    //     try {
    //         const result = await signInWithPopup(auth, provider);
    //         console.log(result.user);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    useEffect(() => {
        if(userData) redirect("/dashboard")
    }, [userData]);


    return (
        <div className='h-screen w-screen flex flex-col items-center justify-center'>
            <article className='p-8 flex flex-col gap-4 text-center bg-gray rounded-xl'>
                {
                    ProcedimientoRegistro === 0 ?
                    <>
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
                </> :
                 <>
                    <input
                        type="text"
                        value={DatosFormulario.Nombre_Establecimiento}
                        onChange={(e) => setDatosFormulario({...DatosFormulario, Nombre_Establecimiento: e.target.value})}
                        placeholder="Nombre del establecimiento"
                        className='p-2 text-center w-full rounded-xl'
                    />
                    <input
                        type="text"
                        value={DatosFormulario.Telefono}
                        onChange={(e) => setDatosFormulario({...DatosFormulario, Telefono: e.target.value})}
                        placeholder="Telefono"
                        className='p-2 text-center w-full rounded-xl'
                    />
                    <input
                        type="text"
                        value={DatosFormulario.Direccion}
                        onChange={(e) => setDatosFormulario({...DatosFormulario, Direccion: e.target.value})}
                        placeholder="Direccion"
                        className='p-2 text-center w-full rounded-xl'
                    />
                 </>    
                }
         
                    <button onClick={VerificarSiguienteProcedimientoRegistro}>
                        {
                            ProcedimientoRegistro === 0 ? "Siguiente" : "Registrarse"
                        }
                    </button>
      
            </article>
        </div>
    )
}

export default Page
