"use client"
import { db } from '@/app/firebase';
import Modal from '@/components/ModalCalendario';
import NavBar from '@/components/navbar';
import { collection, doc, getDoc, getDocs, query, runTransaction, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

async function getPrestamos(id, clientes) {
  const prestamos = [];
  // Referencia al documento del establecimiento
  const clienteRef = doc(db, 'establecimientos', id, "clientes", clientes);
  // Referencia a la subcolección 'clientes'
  const prestamosRef = collection(clienteRef, 'prestamos');

  // Consulta para obtener todos los documentos de la subcolección 'clientes'
  const prestamosQuery = query(prestamosRef);
  const querySnapshot = await getDocs(prestamosQuery);

  // Recorrer los documentos obtenidos y agregarlos al array 'clientes'
  querySnapshot.forEach((doc) => {
    prestamos.push({ id: doc.id, ...doc.data() });
  });

  return prestamos;
}

async function getCliente(id, cliente) {
  const clienteRef = doc(db, 'establecimientos', id, "clientes", cliente);
  try {
    const clienteSnap = await getDoc(clienteRef);
    if (clienteSnap.exists()) {
      return clienteSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
}

const Page = () => {

  const [Prestamos, setPrestamos] = useState([])
  const { id, cliente } = useParams()
  const [verModalPago, setVerModalPago] = useState(false)
  const [IndiceModalPago, setIndiceModalPago] = useState(0)
  const [PrestamoModal, setPrestamoModal] = useState({})
  const [Cliente, setCliente] = useState({})

  function calcularDiferenciaDias(fechaString) {

    // Convertir la fecha string a un objeto Date
    const partes = fechaString.split('/');
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Los meses en JavaScript van de 0 a 11
    const anio = parseInt(partes[2], 10);
    const fecha = new Date(anio, mes, dia);

    // Obtener la fecha actual
    const hoy = new Date();

    // Calcular la diferencia en milisegundos
    var diferenciaMilisegundos = hoy - fecha;

    if (diferenciaMilisegundos <= 0) return 0

    // Convertir la diferencia a días
    const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

    return diferenciaDias;
  }

  const AbrirModalPago = (prestamo) => {

    setVerModalPago(true)
    var indice = 0
    for (let i = 0; i < prestamo.calendarioPagos.length; i++) {
      if (prestamo.calendarioPagos[i].cancelado == false) {
        indice = i
        break
      }
    }
    setIndiceModalPago(indice)
    setPrestamoModal(prestamo)
  }
  const nuevoPago = async (nuevo) => {
    setVerModalPago(false);

    // Referencia al documento del préstamo
    const PrestamodDoc = doc(db, 'establecimientos', id, 'clientes', cliente, 'prestamos', nuevo.id);
    // Referencia al documento del cliente
    const clienteDocRef = doc(db, 'establecimientos', id, 'clientes', cliente);

    try {
      await runTransaction(db, async (transaction) => {
        // Leer el documento del cliente primero
        const clienteSnapshot = await transaction.get(clienteDocRef);

        if (!clienteSnapshot.exists()) {
          throw new Error('Cliente no encontrado');
        }

        const clienteData = clienteSnapshot.data();
        const nuevoCreditoConsumido = nuevo.cancelado
          ? clienteData.Credito_consumido - Number(nuevo.monto)
          : clienteData.Credito_consumido;

        // Actualizar el documento del préstamo
        transaction.update(PrestamodDoc, {
          calendarioPagos: nuevo.calendarioPagos,
          totalPagado: Number(nuevo.totalPagado),
          cuotasPagadas: Number(nuevo.cuotasPagadas),
          monto: Number(nuevo.monto),
          totalAPagar: Number(nuevo.totalAPagar),
          cancelado: nuevo.cancelado,
          mora: nuevo.mora
        });

        // Si nuevo.cancelado es true, actualizar el documento del cliente
        if (nuevo.cancelado) {
          transaction.update(clienteDocRef, { Credito_consumido: nuevoCreditoConsumido });
        }
      });

      console.log('Pago actualizado y cliente modificado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el pago o modificar el cliente:', error);
    }
  };

  const Actualizar = async (nuevo, i) => {
    try {
      Prestamos[i] = nuevo
      const PrestamodDoc = doc(db, 'establecimientos', id, 'clientes', cliente, 'prestamos', nuevo.id);
      await updateDoc(PrestamodDoc, {
        calendarioPagos: nuevo.calendarioPagos,
        totalPagado: Number(nuevo.totalPagado),
        cuotasPagadas: Number(nuevo.cuotasPagadas),
        monto: Number(nuevo.monto),
        totalAPagar: Number(nuevo.totalAPagar),
        cancelado: nuevo.cancelado,
        mora: nuevo.mora
      }
      )
      console.log('Pago actualizado exitosamente')
    } catch (error) {
      console.log(error)
    }
  }

  const VerificarMoras = (data, arregloMoras) => {
    var aux = data
    var difDias = 0
    var mora = 0
    var TEP = 0
    var Valortasa = 0
    for (let i = 0; i < aux.length; i++) {
      if (!aux[i].cancelado) {
        for (let j = 0; j < aux[i].calendarioPagos.length; j++) {
          difDias = calcularDiferenciaDias(aux[i].calendarioPagos[j].fecha)
          if (difDias > 0 && !aux[i].calendarioPagos[j].cancelado) {
            if (!Cliente.Tipo_tasa_moratoria) {
              var m = Cliente.Frecuencia_pago_moratoria / Cliente.Capitalizacion_nominal_moratoria
              var n = Cliente.Frecuencia_pago_moratoria / Cliente.Capitalizacion_nominal_moratoria
              Valortasa = Math.pow((1 + (Cliente.Valor_tasa_moratoria / 100) / m), n) - 1;
            }
            else Valortasa = Cliente.Valor_tasa_moratoria / 100
            TEP = (Math.pow((1 + Valortasa), difDias / Cliente.Frecuencia_pago_moratoria)) - 1
            mora = aux[i].calendarioPagos[j].monto_cuota * (1 + TEP)
            mora = mora.toFixed(2)
            aux[i].calendarioPagos[j].mora = Number(mora)
          }
          else aux[i].calendarioPagos[j].mora = 0
        }
        var m = 0
        for (let c = 0; c < aux[i].calendarioPagos.length; c++) {
          m += Number(aux[i].calendarioPagos[c].mora)
        }
        if (m != aux[i].mora) {
          aux[i].mora = m
          aux[i].totalAPagar += m
        }
      }
    }
    var nuevasMoras = []
    for (let b = 0; b < aux.length; b++) {
      nuevasMoras.push(aux[b].mora)
    }
    console.log(nuevasMoras)
    console.log(arregloMoras)
    if (nuevasMoras != arregloMoras) {
      for (let i = 0; i < nuevasMoras.length; i++) {
        if(nuevasMoras[i] != arregloMoras[i]) {
          Actualizar(aux[i], i)
        }
      }
    }
  }

  useEffect(() => {
    getCliente(id, cliente).then((data) => {
      setCliente(data)
    })

  }, []);

  useEffect(() => {
    if (Object.keys(Cliente).length > 0) {
      getPrestamos(id, cliente).then((data) => {
        setPrestamos(data)
        var arregloMoras = []
        for (let a = 0; a < data.length; a++) {
          arregloMoras.push(data[a].mora)
        }
        VerificarMoras(data, arregloMoras);
      })
    }
  }, [Cliente]);


  return <>
    <NavBar />
    <div className='flex flex-col items-center justify-center w-full'>
      <h1 className='text-4xl my-10'>Préstamos por cobrar - {Cliente.Nombre} {Cliente.Apellido}</h1>
      {verModalPago ? <Modal prestamo={PrestamoModal} cerrar={() => setVerModalPago(false)} indice={IndiceModalPago} registrarNuevo={nuevoPago} /> : ""}

      <div className='w-1/2 flex flex-col items-center justify-center'>
        {
          Prestamos.length > 0 && Prestamos.filter(prestamo => !prestamo.cancelado).length ?  Prestamos.filter(prestamo => !prestamo.cancelado).map((prestamo) => (
            <div key={prestamo.id} className={`flex flex-row items-center justify-between w-full mb-5 p-8 rounded-xl ${prestamo.mora ? "bg-red-300" : "bg-gray"} `}>
              <div className='text-xl'>
                <p className='mb-5'>Fecha de emisión: <strong>{prestamo.fechaEmision}</strong></p>
                <p className='mb-5'>Monto prestado: <strong>s/.{prestamo.monto}</strong></p>
                <p className='mb-5'>Monto prestado + intereses y moras: <strong>s/.{prestamo.totalAPagar}</strong></p>
                {prestamo.mora ? <p className='mb-5 font-bold'>Mora: <strong>s/.{prestamo.mora}</strong></p> : ""}

              </div>
              <div className='text-xl'>
                <p className='mb-5'>Total pagado: <strong>s/.{prestamo.totalPagado}</strong></p>
                <p className='mb-5'>Cuotas pagadas: <strong>{prestamo.cuotasPagadas}</strong></p>
                <p className='mb-5'>Cuotas restantes: <strong>{prestamo.cuotas - prestamo.cuotasPagadas}</strong></p>
              </div>
              {
                !prestamo.cancelado ? <button onClick={() => AbrirModalPago(prestamo)} className='bg-blue-500 bg-white p-2 rounded-xl'>Pagar cuota</button> : ""

              }
            </div>
          ))
          : <p>No hay prestamos por cobrar</p>
        }
      </div>
      <h1 className='text-4xl my-10'>Préstamos cobrados - {Cliente.Nombre} {Cliente.Apellido}</h1>
      {verModalPago ? <Modal prestamo={PrestamoModal} cerrar={() => setVerModalPago(false)} indice={IndiceModalPago} registrarNuevo={nuevoPago} /> : ""}

      <div className='w-1/2 flex flex-col items-center justify-center'>
        {
          Prestamos.length > 0 && Prestamos.filter(prestamo => prestamo.cancelado).length ? Prestamos.filter(prestamo => prestamo.cancelado).map((prestamo) => (
            <div key={prestamo.id} className={'flex flex-row items-center justify-between w-full mb-5 p-8 rounded-xl bg-gray '}>
              <div className='text-xl'>
                <p className='mb-5'>Fecha de emisión: <strong>{prestamo.fechaEmision}</strong></p>
                <p className='mb-5'>Monto prestado: <strong>s/.{prestamo.monto}</strong></p>
                <p className='mb-5'>Monto prestado + intereses y moras: <strong>s/.{prestamo.totalAPagar}</strong></p>

              </div>
              <div className='text-xl'>
                <p className='mb-5'>Total pagado: <strong>s/.{prestamo.totalPagado}</strong></p>
                <p className='mb-5'>Cuotas pagadas: <strong>{prestamo.cuotasPagadas}</strong></p>
                <p className='mb-5'>Cuotas restantes: <strong>{prestamo.cuotas - prestamo.cuotasPagadas}</strong></p>
              </div>
              {
                !prestamo.cancelado ? <button onClick={() => AbrirModalPago(prestamo)} className='bg-blue-500 bg-white p-2 rounded-xl'>Pagar cuota</button> : ""

              }
            </div>
          ))
          : <p>El cliente no tiene préstamos pagados</p>
        }
      </div>
    </div>
  </>
}

export default Page
