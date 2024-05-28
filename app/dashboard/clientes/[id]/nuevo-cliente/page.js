"use client"
import { db } from '@/app/firebase'
import NavBar from '@/components/navbar'
import { OpcionesTasa } from '@/consts/OpcionesTasa'
import { collection, doc, setDoc } from 'firebase/firestore'
import { redirect, useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const NuevoCliente = () => {

  const [DatosFormulario, setDatosFormulario] = useState({
    Nombre: "",
    Apellido: "",
    Direccion: "",
    Identificacion: "",
    Telefono: "",
    Credito_consumido: 0,
    Dia_pago: 31,
    Morador: false,
    Limite_credito: 1000,
    Tipo_tasa: false,
    Frecuencia_pago: 30,
    Valor_tasa: 10,
    Capitalizacion_nominal: 1,
    Tipo_tasa_moratoria: false,
    Frecuencia_pago_moratoria: 30,
    Valor_tasa_moratoria: 10,
    Capitalizacion_nominal_moratoria: 1,

  })

  const [PasoProcedimiento, setPasoProcedimiento] = useState(0)



  const cambioRadio = (e) => {
    setDatosFormulario({ ...DatosFormulario, Tipo_tasa: e.target.value === "efectiva" });
  };
  const cambioTasa = (e) => {
    // Remueve el símbolo % si está presente
    const valor = e.target.value.replace('%', '');
    if (!isNaN(valor)) {
      setDatosFormulario({ ...DatosFormulario, Valor_tasa: valor });
    }
    else {
      alert("El valor ingresado debe ser numérico, para los decimales utilice punto")
    }
  };

  const cambioFrecuenciaPago = (e) => {
    const valor = Number(e.target.value);
    setDatosFormulario({ ...DatosFormulario, Frecuencia_pago: valor });
  };

  const cambioFrecuenciaPagoMoratoria = (e) => {
    const valor = Number(e.target.value);
    setDatosFormulario({ ...DatosFormulario, Frecuencia_pago_moratoria: valor });
  };


  const cambioCapitalizacion = (e) => {
    const valor = Number(e.target.value);
    setDatosFormulario({ ...DatosFormulario, Capitalizacion_nominal: valor });
  };

  const cambioCapitalizacionMoratoria = (e) => {
    const valor = Number(e.target.value);
    setDatosFormulario({ ...DatosFormulario, Capitalizacion_nominal_moratoria: valor });
  };


  const { id } = useParams()

  const Subir = async (e) => {
    e.preventDefault();

    try {
      // Referencia al documento de la colección 'establecimientos'
      const establecimientoRef = doc(db, 'establecimientos', id);

      // Referencia a la subcolección 'clientes'
      const clientesRef = collection(establecimientoRef, 'clientes');

      // ID del sub-documento (puedes generar uno automáticamente)
      const nuevoClienteRef = doc(clientesRef);

      // Sube los datos del formulario como un nuevo sub-documento en 'clientes'
      await setDoc(nuevoClienteRef, DatosFormulario);
      toast.success('Cliente registrado con éxito');
      setTimeout(() => {
        redirect("/dashboard/clientes/" + id)
      }, 2000);
    } catch (error) {
      console.error('Error al subir los datos:', error);
    }
  };

  const IncrementarPasoProcedimiento = () => {
    var x = PasoProcedimiento
    if (PasoProcedimiento === 0) {
      if (DatosFormulario.Nombre === "" || DatosFormulario.Apellido === "" || DatosFormulario.Direccion === "" || DatosFormulario.Identificacion === "" || DatosFormulario.Telefono === "") {
        alert("Por favor llene todos los campos")
        return
      }
      if (DatosFormulario.Identificacion.length < 8 || isNaN(DatosFormulario.Identificacion)) {
        alert("El número de identificación debe tener al menos 8 dígitos")
        return
      }
      if (DatosFormulario.Telefono.length < 9 || isNaN(DatosFormulario.Telefono)) {
        alert("El número de teléfono debe tener al menos 9 dígitos")
        return
      }
    }
    if (PasoProcedimiento === 1) {
      if (DatosFormulario.Dia_pago < 1 || DatosFormulario.Dia_pago > 31 || isNaN(DatosFormulario.Dia_pago)) {
        alert("El día de pago debe ser un número entre 1 y 31")
        return
      }
      if (DatosFormulario.Limite_credito < 0 || isNaN(DatosFormulario.Limite_credito)) {
        alert("El límite de crédito debe ser un número positivo")
        return
      }
    }
    if (PasoProcedimiento === 2) {
      if (DatosFormulario.Valor_tasa < 0 || isNaN(DatosFormulario.Valor_tasa)) {
        alert("La tasa de interés debe ser un número positivo")
        return
      }

    }

    setPasoProcedimiento(x + 1)
  }





  return <>
    <NavBar />
    <div className='flex flex-col items-center justify-center'>
      <h2 className="font-righteous text-4xl my-10">Creación de cliente</h2>
      <form onSubmit={Subir} className='flex flex-col items-center justify-center'>
        {
          PasoProcedimiento === 0 ?
            <>
              <div className='flex flex-row gap-5 mt-4'>
                <article className='flex flex-col gap-2 '>
                  <label>Nombre</label>
                  <input className='p-2 bg-gray rounded-lg' type="text" name="Nombre" value={DatosFormulario.Nombre} onChange={(e) => setDatosFormulario({ ...DatosFormulario, Nombre: e.target.value })} />
                </article>
                <article className='flex flex-col gap-2'>
                  <label>Apellido</label>
                  <input className='p-2 bg-gray rounded-lg' type="text" name="Apellido" value={DatosFormulario.Apellido} onChange={(e) => setDatosFormulario({ ...DatosFormulario, Apellido: e.target.value })} />
                </article>
              </div>
              <div className='flex flex-row gap-5 mt-4'>
                <article className='flex flex-col gap-2'>
                  <label>Documento</label>
                  <input className='p-2 bg-gray rounded-lg' type="text" name="Identificacion" value={DatosFormulario.Identificacion} onChange={(e) => setDatosFormulario({ ...DatosFormulario, Identificacion: e.target.value })} />
                </article>
                <article className='flex flex-col gap-2'>
                  <label>Dirección</label>
                  <input className='p-2 bg-gray rounded-lg' type="text" name="Direccion" value={DatosFormulario.Direccion} onChange={(e) => setDatosFormulario({ ...DatosFormulario, Direccion: e.target.value })} />
                </article>
              </div>
              <div className='flex flex-row gap-5 mt-4'>
                <article className='flex flex-col gap-2 mx-auto'>
                  <label>Teléfono</label>
                  <input className='p-2 bg-gray rounded-lg' type="text" name="Telefono" value={DatosFormulario.Telefono} onChange={(e) => setDatosFormulario({ ...DatosFormulario, Telefono: e.target.value })} />
                </article>
              </div>
            </>
            : PasoProcedimiento === 1 ?
              <>
                <div className='flex flex-row gap-5 mt-4'>
                  <article className='flex flex-col gap-2'>
                    <label>Dia de pago</label>
                    <input className='p-2 bg-gray rounded-lg' type="text" name="Dia pago" value={DatosFormulario.Dia_pago} onChange={(e) => setDatosFormulario({ ...DatosFormulario, Dia_pago: e.target.value })} />
                  </article>
                  <article className='flex flex-col gap-2'>
                    <label>Límite de crédito</label>
                    <input className='p-2 bg-gray rounded-lg' type="text" name="Direccion" value={DatosFormulario.Limite_credito} onChange={(e) => setDatosFormulario({ ...DatosFormulario, Limite_credito: e.target.value })} />
                  </article>
                </div>
              </>
              : PasoProcedimiento === 2 ?
                <>
                  <div className='flex flex-col gap-2 mt-4'>
                    <label>Valor de la tasa de interés</label>
                    <input className='p-2 bg-gray rounded-lg mb-5' name="Tasa" value={DatosFormulario.Valor_tasa + "%"} onChange={cambioTasa} />
                    <label>Tipo de tasa</label>
                    <div className='flex flex-row gap-5 mb-5'>
                      <button className={`p-3 rounded-xl border-4 border-gray ${!DatosFormulario.Tipo_tasa ? "bg-gray" : "bg-gray/25"}`} type='button' onClick={() => setDatosFormulario({ ...DatosFormulario, Tipo_tasa: false })}>
                        Nominal
                      </button>
                      <button className={`p-3 rounded-xl border-4 border-gray ${DatosFormulario.Tipo_tasa ? "bg-gray" : "bg-gray/25"}`} type='button' onClick={() => setDatosFormulario({ ...DatosFormulario, Tipo_tasa: true })}>
                        Efectiva
                      </button>
                    </div>
                    <label htmlFor="capitalizacion">Frecuencia de pago</label>
                    <select
                      id="capitalizacion"
                      value={DatosFormulario.Frecuencia_pago}
                      onChange={cambioFrecuenciaPago}
                      className='p-2 bg-gray rounded-lg mb-5'
                    >
                      {OpcionesTasa.filter(opcion => opcion.valor >= 30).map(opcion => (
                        <option key={opcion.valor} value={opcion.valor}>
                          {opcion.tipo}
                        </option>
                      ))}
                    </select>
                   {
                      DatosFormulario.Tipo_tasa === false ?
                      <>
                      <label htmlFor="capitalizacion">Capitalización</label>
                      <select
                        id="capitalizacion"
                        value={DatosFormulario.Capitalizacion_nominal}
                        onChange={cambioCapitalizacion}
                        className='p-2 bg-gray rounded-lg mb-5'
                      >
                        {OpcionesTasa.map(opcion => (
                          <option key={opcion.valor} value={opcion.valor}>
                            {opcion.tipo}
                          </option>
                        ))}
                      </select>
                      </>
                      : ""
                   }
                  </div>
                </>
                : 
                <>
                  <div className='flex flex-col gap-2 mt-4'>
                    <label>Valor de la tasa de interés moratoria</label>
                    <input className='p-2 bg-gray rounded-lg mb-5' name="Tasa" value={DatosFormulario.Valor_tasa + "%"} onChange={cambioTasa} />
                    <label>Tipo de tasa moratoria</label>
                    <div className='flex flex-row gap-5 mb-5'>
                      <button className={`p-3 rounded-xl border-4 border-gray ${!DatosFormulario.Tipo_tasa_moratoria ? "bg-gray" : "bg-gray/25"}`} type='button' onClick={() => setDatosFormulario({ ...DatosFormulario, Tipo_tasa_moratoria: false })}>
                        Nominal
                      </button>
                      <button className={`p-3 rounded-xl border-4 border-gray ${DatosFormulario.Tipo_tasa_moratoria ? "bg-gray" : "bg-gray/25"}`} type='button' onClick={() => setDatosFormulario({ ...DatosFormulario, Tipo_tasa_moratoria: true })}>
                        Efectiva
                      </button>
                    </div>
                    <label htmlFor="capitalizacion">Frecuencia de pago de la tasa moratoria</label>
                    <select
                      id="capitalizacion"
                      value={DatosFormulario.Frecuencia_pago_moratoria}
                      onChange={cambioFrecuenciaPagoMoratoria}
                      className='p-2 bg-gray rounded-lg mb-5'
                    >
                      {OpcionesTasa.filter(opcion => opcion.valor >= 30).map(opcion => (
                        <option key={opcion.valor} value={opcion.valor}>
                          {opcion.tipo}
                        </option>
                      ))}
                    </select>
                   {
                      DatosFormulario.Tipo_tasa_moratoria === false ?
                      <>
                      <label htmlFor="capitalizacion">Capitalización de la tasa moratoria</label>
                      <select
                        id="capitalizacion"
                        value={DatosFormulario.Capitalizacion_nominal_moratoria}
                        onChange={cambioCapitalizacionMoratoria}
                        className='p-2 bg-gray rounded-lg mb-5'
                      >
                        {OpcionesTasa.map(opcion => (
                          <option key={opcion.valor} value={opcion.valor}>
                            {opcion.tipo}
                          </option>
                        ))}
                      </select>
                      </>
                      : ""
                   }
                  </div>
                </>
        }
        <div className='flex flex-row gap-5 mb-10'>
          {
            PasoProcedimiento > 0 ?
              <button className='mt-5 p-3 rounded-xl text-xl border-4 border-gray bg-gray/25' type="button" onClick={() => setPasoProcedimiento(PasoProcedimiento - 1)}>
                Regresar
              </button>
              : ""
          }
          {
            PasoProcedimiento < 3 ?
              <button className='mt-5 p-3 bg-gray rounded-xl text-xl' type='button' onClick={IncrementarPasoProcedimiento}>
                Siguiente paso
              </button>
              : ""
          }
          {
            PasoProcedimiento === 3 ?
              <button className='mt-5 p-3 bg-gray rounded-xl text-xl' type="submit">
                Registrar cliente
              </button>
              : ""
          }
        </div>
      </form>
    </div>
  </>
}

export default NuevoCliente
