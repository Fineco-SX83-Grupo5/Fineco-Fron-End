"use client"
import { db } from '@/app/firebase';
import NavBar from '@/components/navbar';
import { OpcionesTasa } from '@/consts/OpcionesTasa';
import { collection, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import moment from 'moment';
import { redirect, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

async function getCliente(pathname, id) {
    // Referencia al documento del cliente
    const clienteRef = doc(db, 'establecimientos', pathname, 'clientes', id);

    // Obtener el documento del cliente
    const clienteDoc = await getDoc(clienteRef);

    // Verificar si el documento existe
    if (clienteDoc.exists()) {
        // Devolver los datos del cliente
        return clienteDoc.data();
    } else {
        // Manejar el caso donde el documento no existe
        throw new Error("Cliente no encontrado");
    }
}


const Page = () => {

    const { id, cliente } = useParams()
    const [Cliente, setCliente] = useState({})
    const [Monto, setMonto] = useState("")
    const [DiaPago, setDiaPago] = useState(undefined)
    const [PagaPorCuotas, setPagaPorCuotas] = useState(false)
    const [Cuotas, setCuotas] = useState(2)
    const [R, setR] = useState(0)
    const [S, setS] = useState(0)
    const [comienzaMesActual, setcomienzaMesActual] = useState(true)
    const [CalendarioPagos, setCalendarioPagos] = useState([])
    const [TotalAPagar, setTotalAPagar] = useState(0)

    function obtenerTipoDeTasa(tiempoPago) {
        const opcion = OpcionesTasa.find(opcion => opcion.valor === tiempoPago);
        return opcion ? opcion.tipo.toLowerCase() : 'Valor no encontrado';
      }

    function obtenerCalendarioPago(dia_pago, r) {
        var mes = new Date().getMonth();
        var anio = new Date().getFullYear();

        var fechaActual = new Date();
        var fecha = new Date(anio, mes, dia_pago);
        if ((fecha - fechaActual) <= 0) {
            mes += 1;
            if (mes > 11) {
                mes = 0;
                anio += 1;
            }
        }

        if (!comienzaMesActual) {
            mes++
            if (mes == 13) {
                mes = 1
                anio++
            }
        }
        var ultimoDiaDelMes
        var diaObjetivo
        var Calendario = []
        var fecha
        for (let i = 0; i < Cuotas; i++) {
            ultimoDiaDelMes = new Date(anio, mes + 1, 0).getDate();
            diaObjetivo = Math.min(dia_pago, ultimoDiaDelMes);
            fecha = new Date(anio, mes, diaObjetivo);
            Calendario.push({
                monto_cuota: Number(r),
                cancelado: false,
                monto_pagado: 0,
                fecha: fecha.toLocaleDateString(),
                moras: 0
            })
            mes++
            if (mes == 13) {
                mes = 1
                anio++
            }
        }
        return Calendario
    }

    function obtenerDiaPago(dia_pago) {
        const anio = new Date().getFullYear();
        const mes = new Date().getMonth();
        const ultimoDiaDelMes = new Date(anio, mes + 1, 0).getDate();
        return Math.min(dia_pago, ultimoDiaDelMes);
    }

    function obtenerFechaPago(dia) {
        var anio = new Date().getFullYear();
        var mes = new Date().getMonth();
        var fechaActual = new Date();
        var fecha = new Date(anio, mes, dia);
        if ((fecha - fechaActual) <= 0) {
            // Incrementar el mes
            mes += 1;
            // Si el mes es mayor a 11 (diciembre), reiniciar a enero y incrementar el año
            if (mes > 11) {
                mes = 0;
                anio += 1;
            }
            fecha = new Date(anio, mes, dia);
        }
        return fecha.toLocaleDateString()
    }



    function calcularDiferenciaHastaDia(dia_pago) {
        var anio = new Date().getFullYear();
        var mes = new Date().getMonth();
        var diaObjetivo = obtenerDiaPago(dia_pago);

        // Crear la fecha objetivo
        var fechaObjetivo = new Date(anio, mes, diaObjetivo);
        var fechaActual = new Date();

        // Calcular la diferencia en milisegundos
        var diferenciaEnMilisegundos = fechaObjetivo - fechaActual;

        // Si la diferencia no es positiva, ajustar al siguiente mes
        if (diferenciaEnMilisegundos <= 0) {
            // Incrementar el mes
            mes += 1;
            // Si el mes es mayor a 11 (diciembre), reiniciar a enero y incrementar el año
            if (mes > 11) {
                mes = 0;
                anio += 1;
            }
            fechaObjetivo = new Date(anio, mes, diaObjetivo);
            diferenciaEnMilisegundos = fechaObjetivo - fechaActual;
        }

        // Convertir la diferencia de milisegundos a días
        const milisegundosEnUnDia = 1000 * 60 * 60 * 24;
        const diferenciaEnDias = diferenciaEnMilisegundos / milisegundosEnUnDia;

        return Math.round(diferenciaEnDias);
    }
    const verificarMinimo = (e) => {
        if (e.target.value < 2) {
            setCuotas(2);
        }
    };

    const registrarCompra = async () => {
        if (Cliente.Credito_consumido + Number(Monto) > Cliente.Limite_credito) {
          toast.error('El cliente ha excedido su límite de crédito')
          return;
        }
      
        try {
          // Referencia al documento de la colección 'establecimientos'
          const clienteRef = doc(db, 'establecimientos', id, "clientes", cliente);
          // Referencia a la subcolección 'clientes'
          const prestamosRef = collection(clienteRef, 'prestamos');
          // ID del sub-documento (puedes generar uno automáticamente)
          const nuevoPrestamoRef = doc(prestamosRef);
      
          const Data = {
            fechaEmision: new Date().toLocaleDateString(),
            monto: Number(Monto),
            cuotas: PagaPorCuotas ? Cuotas : 1,
            cuotasPagadas: 0,
            calendarioPagos: CalendarioPagos,
            totalAPagar: Number(TotalAPagar),
            mora: 0,
            totalPagado: 0,
            cancelado: false
          };
      
          await runTransaction(db, async (transaction) => {
            // Crear el nuevo sub-documento en 'prestamos'
            transaction.set(nuevoPrestamoRef, Data);
      
            // Actualizar el documento del cliente
            const nuevoCreditoConsumido = Cliente.Credito_consumido + Number(Monto);
            Cliente.Credito_consumido = nuevoCreditoConsumido;
            transaction.update(clienteRef, { Credito_consumido: Number(nuevoCreditoConsumido) });
          });
          toast.success('Compra registrada con éxito');
          setTimeout(() => {
            redirect("/dashboard/ventas")
          }, 2000);
        } catch (error) {
          toast.error('Error al registrar la compra');
        }
      };

    useEffect(() => {
        var Svalor = 0;
        var RValor = 0
        var TEP = 0
        var TEM = 0
        var Valortasa = 0

        if (!Cliente.Tipo_tasa) {
            var m = Cliente.Frecuencia_pago / Cliente.Capitalizacion_nominal
            var n = Cliente.Frecuencia_pago / Cliente.Capitalizacion_nominal
            Valortasa = Math.pow((1 + (Cliente.Valor_tasa / 100) / m), n) - 1;
        }
        else Valortasa = Cliente.Valor_tasa / 100

        TEP = (Math.pow((1 + Valortasa), calcularDiferenciaHastaDia(Cliente.Dia_pago) / Cliente.Frecuencia_pago)) - 1
        TEM = (Math.pow((1 + Valortasa), 30 / Cliente.Frecuencia_pago)) - 1
        Svalor = Monto * (1 + TEP)
        Svalor = Svalor.toFixed(2)
        setS(Svalor)



        RValor = Monto * TEM * Math.pow((1 + TEM), Number(Cuotas)) / (Math.pow((1 + TEM), Number(Cuotas)) - 1)
        RValor = RValor.toFixed(2)
        var ArrCalendario = []
        if (!PagaPorCuotas) {
            ArrCalendario.push({
                monto_cuota: Number(Svalor),
                fecha: obtenerFechaPago(Cliente.Dia_pago),
                cancelado: false,
                monto_pagado: 0,
                moras: 0
            })
            setTotalAPagar(Svalor)
        }
        else {
            ArrCalendario = obtenerCalendarioPago(Cliente.Dia_pago, RValor)
            var AuxTotal = 0
            for (let i = 0; i < ArrCalendario.length; i++) {
                AuxTotal += Number(ArrCalendario[i].monto_cuota)
            }
            setTotalAPagar(AuxTotal.toFixed(2))
            setR(RValor)
        
        }
        setCalendarioPagos(ArrCalendario)
    }, [Monto, Cuotas, PagaPorCuotas, comienzaMesActual]);

    const cambioMonto = (e) => {
        setMonto(e.target.value);
    }

    useEffect(() => {
        getCliente(id, cliente).then((data) => {
            setCliente(data)
            setDiaPago(obtenerDiaPago(data.Dia_pago));
        })
    }, []);




    return <>
        <NavBar />
        {
            Cliente.Nombre && <div className='flex flex-col items-center justify-center w-full'>
                <h1 className='text-4xl mt-10 mb-4'>Registra una compra de {Cliente.Nombre} {Cliente.Apellido}</h1>
                <p className='text-xl my-5'>
                    Fecha actual: {new Date().toLocaleDateString()}
                </p>
                <p className='text-xl mb-5'>
                    Fecha de pago de {Cliente.Nombre} {Cliente.Apellido}: {Cliente.Dia_pago} de cada mes
                </p>
                {/* <p className='text-xl mb-5'>
                    Límite de crédito del cliente: S/. {Cliente.Limite_credito}
                </p>
                <p className='text-xl mb-5'>
                    Saldo de credito del cliente: {Cliente.Credito_consumido}
                </p> */}
                <p className='text-xl mb-5'>
                    Tasa de {Cliente.Nombre} {Cliente.Apellido}: {Cliente.Valor_tasa}% {Cliente.Tipo_tasa ? "efectiva" : "nominal"} {obtenerTipoDeTasa(Cliente.Frecuencia_pago)} {!Cliente.Tipo_tasa ? "con capitalización " + obtenerTipoDeTasa(Cliente.Capitalizacion_nominal) : ""}
                </p>
                {/* {
        Cliente.Dia_pago != obtenerDiaPago(DiaPago) ?
        <p className='text-xl mb-5'> 
        Este mes, la fecha de pago es el {obtenerDiaPago(DiaPago)}
    </p>
    : ""
    } */}
                <input type='number' placeholder='Ingresa el monto de la compra' className='bg-gray text-center p-5 text-xl rounded-xl p-2 w-96' value={Monto} onChange={cambioMonto} />
                {
                    DiaPago != undefined &&
                    <>
                        <p className='text-xl mt-5'>Selecciona el método de pago:</p>
                        <div className='flex flex-row gap-4'>
                            <button className={`text-xl my-5 p-5 rounded-xl border-4 border-gray ${!PagaPorCuotas ? "bg-gray" : "bg-gray/25"}`} onClick={() => setPagaPorCuotas(false)}>
                                Paga el {obtenerFechaPago(DiaPago)}
                            </button>
                            <button className={`text-xl my-5 p-5 rounded-xl border-4 border-gray  ${PagaPorCuotas ? "bg-gray" : "bg-gray/25"}`} onClick={() => setPagaPorCuotas(true)}>
                                Paga por cuotas
                            </button>
                        </div>
                        {
                            PagaPorCuotas ?
                                <div className='flex flex-col items-center'>
                                    <p className='text-xl mb-3'>Selecciona la cantidad de cuotas:</p>
                                    <input type='number'
                                        min={2} placeholder='Ingresa la cantidad de cuotas'
                                        className='bg-gray mb-5 text-center p-5 text-xl rounded-xl p-2 w-96'
                                        value={Cuotas} onChange={(e) => setCuotas(e.target.value)} onBlur={verificarMinimo} />

                                    <p className='text-xl mb-5'>
                                        Monto a pagar por cuota: <strong>s/.{R}</strong>
                                    </p>
                                    <p className='text-xl mb-3'>
                                        ¿Cuándo será la primera cuota?
                                    </p>
                                    <div className='flex flex-row gap-4'>
                                        <button className={`text-xl my-2 p-5 rounded-xl border-4 border-gray ${comienzaMesActual ? "bg-gray" : "bg-gray/25"}`} onClick={() => setcomienzaMesActual(true)}>
                                            Comienza en la fecha de pago
                                        </button>
                                        <button className={`text-xl my-2 p-5 rounded-xl border-4 border-gray ${!comienzaMesActual ? "bg-gray" : "bg-gray/25"}`} onClick={() => setcomienzaMesActual(false)}>
                                            Comienza el siguiente mes
                                        </button>
                                    </div>
                                    <h3 className='text-2xl my-3'>
                                        Calendario de pagos:
                                    </h3>
                                    <table className='w-96 mb-5 rounded-xl text-center border-2 border-gray border-collapse'>
                                        <th className='grid grid-cols-3 gap-5 justify-between items-center py-5 border-2 border-gray border-collapse'>
                                            <td>Cuota</td>
                                            <td className='w-full'>Fecha</td>
                                            <td>Monto</td>
                                        </th>
                                        <tbody>
                                            {
                                                CalendarioPagos.map((pago, index) => {
                                                    return <tr className='grid grid-cols-3 gap-5 justify-between items-center py-5 border-2 border-gray border-collapse' key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{pago.fecha}</td>
                                                        <td>{pago.monto_cuota}</td>
                                                    </tr>
                                                })
                                            }
                                            <tr className='flex flex-row justify-between p-5 border-2 border-gray border-collapse font-bold'>
                                                <td>Total a pagar</td>
                                                <td>S/. {TotalAPagar}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div> :
                                S > 0 ?
                                    <p className='text-xl mb-3'>
                                        Valor a pagar el {obtenerFechaPago(DiaPago)}: <strong>s/.{S}</strong>
                                    </p> : ""
                        }
                    </>
                }
                <button onClick={registrarCompra} className='p-5 rounded-xl bg-gray text-xl mb-10'>
                    Registrar compra
                </button>
            </div>
        }
    </>
}

export default Page
