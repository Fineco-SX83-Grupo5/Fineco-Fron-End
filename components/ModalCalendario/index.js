import React, { useEffect, useState } from 'react'

const Modal = ({prestamo, cerrar, indice, registrarNuevo}) => {

    const [Valor, setValor] = useState(0)

    const registrar = () => {
        var aux = prestamo
        console.log(Number(Valor))
        var x = Number(aux.calendarioPagos[indice].monto_cuota) + Number(aux.calendarioPagos[indice].mora) - Number(aux.calendarioPagos[indice].monto_pagado)
        console.log(x)
        if(Valor <= x){
            var v = Number(Valor).toFixed(2)
            aux.calendarioPagos[indice].monto_pagado = Number(aux.calendarioPagos[indice].monto_pagado) + Number(v)
            aux.calendarioPagos[indice].monto_pagado = Number(aux.calendarioPagos[indice].monto_pagado).toFixed(2)
            aux.calendarioPagos[indice].monto_pagado = Number(aux.calendarioPagos[indice].monto_pagado)
            aux.totalPagado = Number(aux.totalPagado)
            aux.totalPagado += Number(v)
            aux.totalPagado = Number(aux.totalPagado).toFixed(2)
            if(aux.calendarioPagos[indice].monto_pagado == (aux.calendarioPagos[indice].monto_cuota + aux.calendarioPagos[indice].mora)){
                aux.calendarioPagos[indice].cancelado = true
                aux.cuotasPagadas += 1
                if(aux.cuotasPagadas == aux.cuotas){
                    aux.cancelado = true
                    aux.mora -= aux.calendarioPagos[indice].mora
                }
                console.log(aux.cuotasPagadas, aux.cuotas)
            }
            return registrarNuevo(aux)
        }
        else alert("El monto ingresado es mayor al monto de la cuota")
        console.log(Valor, aux.calendarioPagos[indice].monto_cuota, aux.calendarioPagos[indice].monto_pagado, Valor === aux.calendarioPagos[indice].monto_cuota)
    }


  return <div className='fixed top-0 left-0 w-screen h-screen z-10 bg-sky-500/25 flex flex-col items-center justify-center' onClick={cerrar}>
        <article onClick={(e) => e.stopPropagation()} className='bg-white p-5 min-w-96 w-1/3 rounded-xl flex flex-col gap-4 items-center justify-center'>
            <h1 className='text-3xl mb-3'>Registrar pago de la cuota {indice+1}</h1>
            <p className='text-lg'>Fecha de vencimiento: {prestamo.calendarioPagos[indice].fecha}</p>
            <p className='text-lg'>Monto por pagar: S/.{prestamo.calendarioPagos[indice].monto_cuota} + <span className='text-red-700 font-bold'>{prestamo.calendarioPagos[indice].mora}</span></p>
            <p className='text-lg'>Monto ya cancelado de la cuota: S/.{prestamo.calendarioPagos[indice].monto_pagado}</p>
            <p className='text-lg'>Ingresa el monto en soles que ha depositado el cliente:</p>
            <input className='p-3 bg-gray text-center rounded-xl' type='number' value={Valor} onChange={(e) => setValor(e.target.value)}/>
            <button onClick={registrar} className='bg-gray p-5 text-xl rounded-xl'>
                Registrar pago
            </button>
        </article>
  </div>
}

export default Modal
