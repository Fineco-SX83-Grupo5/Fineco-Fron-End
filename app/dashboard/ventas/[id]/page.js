"use client"
import { db } from '@/app/firebase';
import NavBar from '@/components/navbar'
import { collection, doc, getDocs, query } from 'firebase/firestore';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'

async function getClientes(pathname) {
    const clientes = [];
    // Referencia al documento del establecimiento
    const establecimientoRef = doc(db, 'establecimientos', pathname);
    // Referencia a la subcolección 'clientes'
    const clientesRef = collection(establecimientoRef, 'clientes');

    // Consulta para obtener todos los documentos de la subcolección 'clientes'
    const clientesQuery = query(clientesRef);
    const querySnapshot = await getDocs(clientesQuery);

    // Recorrer los documentos obtenidos y agregarlos al array 'clientes'
    querySnapshot.forEach((doc) => {
      clientes.push({ id: doc.id, ...doc.data() });
    });

    return clientes;
}


const Page = () => {

    const [Clientes, setClientes] = useState([])
    const [filteredClientes, setFilteredClientes] = useState([])
    const [SearchValue, setSearchValue] = useState("")
    const pathname = usePathname()

    const handleSearchChange = (event) => {
      const val = event.target.value;
      setSearchValue(val);
    
      if (val.length) {
        const filterClientes = Clientes?.filter((cliente) => 
          `${cliente.Nombre} ${cliente.Apellido}`.toLowerCase().includes(val.toLowerCase()) ||
          cliente.Nombre.toLowerCase().includes(val.toLowerCase()) ||
          cliente.Apellido.toLowerCase().includes(val.toLowerCase())
      );
        setFilteredClientes(filterClientes);
      } else {
        setFilteredClientes(Clientes);
      }
    };

    const {id} = useParams()

    useEffect(() => {
      getClientes(id).then((data) => {
        setClientes(data)
        setFilteredClientes(data)
      })
  
    }, [id]); 


  return <>
    <NavBar/>
    <div className='flex flex-col items-center justify-center w-full'>
    <h1 className='text-4xl mt-10 mb-4'>Clientes registrados</h1>
    <p className='text-xl mb-10'>Selecciona al cliente que ha realizado una compra</p>
    <input type='text' placeholder='Buscar cliente' value={SearchValue} onChange={handleSearchChange} className='w-96 text-center p-3 rounded-xl mb-10 mx-auto bg-gray'/>
    {
        Clientes.length > 0 ?
       <div className='flex flex-col items-center justify-center lg:w-1/2 w-full max-lg:px-[5vw] gap-8'>
        {
            filteredClientes.length > 0 ? filteredClientes.map((cliente) => {
                return <div key={cliente.id} className='flex bg-white items-center shadow-[0_0_60px] shadow-gray justify-between w-full p-3 rounded-xl'>
                    <p className='text-xl'>{cliente.Nombre} {cliente.Apellido}</p>
                    <Link href={pathname + "/" + cliente.id} className='bg-gray p-5 rounded-xl'>
                        Seleccionar cliente
                    </Link>
                </div>
            }) : 
            <p className='text-center m-auto text-xl'>
            No hay clientes con ese nombre
        </p>
        }
        </div>
        : <p className='text-center m-auto text-xl'>
            No hay clientes registrados
        </p>
    }
    </div>
  </>
}

export default Page
