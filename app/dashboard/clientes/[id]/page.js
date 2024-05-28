"use client"

import NavBar from '@/components/navbar'
import React, { useEffect, useState } from 'react'
import { collection, doc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useRouter } from 'next/router';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';


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

function transformarFrecuencia(frecuencia) {
  const frecuenciaMap = {
    1: "diaria",
    30: "mensual",
    120: "cuatrimestral",
    90: "trimestral",
    60: "bimestral",
    15: "quincenal",
    180: "semestral",
    365: "anual"
    // Agrega más mapeos según tus necesidades
  };

  return frecuenciaMap[frecuencia];
}


const Clientes = () => {

    const [Clientes, setClientes] = useState([])
    const [filteredClientes, setFilteredClientes] = useState([])
    const [SearchValue, setSearchValue] = useState("")
    const {userData} = useAuth()

    const handleSearchChange = (event) => {
      const val = event.target.value;
      setSearchValue(val);
    
      if (val.length) {
        const filterClientes = Clientes?.filter((cliente) => {
          `${cliente.Nombre} ${cliente.Apellido}`.toLowerCase().includes(val.toLowerCase()) ||
          cliente.Nombre.toLowerCase().includes(val.toLowerCase()) ||
          cliente.Apellido.toLowerCase().includes(val.toLowerCase())
      });
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
    <h1 className='text-4xl my-10'>Mantenimiento de clientes</h1>
    <div className='w-full px-[5vw] flex flex-row items-center justify-between mb-5'>
    <input type="search" value={SearchValue} onChange={handleSearchChange} placeholder="Buscar por DNI o nombre" className='bg-gray text-center p-4 text-xl w-[300px] rounded-lg mb-10'/>
       {
        userData ?  <Link href={`/dashboard/clientes/${userData.uid}/nuevo-cliente`} className='text-lg bg-gray p-4 rounded-md'>
        Registrar nuevo cliente
      </Link>
      : ""
       }
    </div>
  {
    Clientes.length > 0 ?
    <>
     
    <table className='w-[90vw] text-center'>
        <thead className='text-xl'>
            <tr>
                <th>Nombre</th>
                <th>Tasa de interés</th>
                <th>Tipo de tasa de interés</th>
                <th>Día de pago</th>
                <th>Configuración</th>
            </tr>
        </thead>
        {
          filteredClientes && filteredClientes.length > 0 && 
          <tbody className='text-xl'>
          {
            filteredClientes.map((info, idx) => {
              return <tr key={idx} className=''>
                <td>{info.Nombre}</td>
                <td>{info.Valor_tasa}%</td>
                <td>{info.Tipo_tasa ? "Efectiva" : "Nominal "} {transformarFrecuencia(info.Frecuencia_pago)} {info.Tipo_tasa ? "" : " con capitalización " + transformarFrecuencia(info.Capitalizacion_nominal)}</td>
                <td>{info.Dia_pago}</td>
                <td>
                    <Link href={`/dashboard/clientes/${userData.uid}/${info.id}`}>👁️</Link>
                    <button>✏️</button>
                    <button>🗑️</button>
                </td>
                </tr>
            })
          }
      </tbody>
        }
    </table>
    </>
    : <p className='text-center text-2xl mt-5'>
    No hay clientes registrados
    </p>
  }
    </div>
  </>
}

export default Clientes
