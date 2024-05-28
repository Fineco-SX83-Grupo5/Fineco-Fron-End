"use client"
import Login from "@/components/login";
import NavBar from "@/components/navbar";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { FaUser } from "react-icons/fa6";

const Page = () => {

  const { userData } = useAuth()


  return (
    <>
      {/* <Login/> */}
      <NavBar />
      <div className="main-div flex justify-center items-center flex-col text-center">
        {
          userData ?
            <>
              <h2 className="font-righteous text-4xl my-10">{userData.Nombre_Establecimiento}</h2>
              <div className="flex flex-wrap items-center justify-center w-full gap-4 panel-inicial">
                <Link href={`/dashboard/clientes/${userData.uid}`}>
                  <Image src={"/clientes.png"} width={80} height={80} />
                  <h3>Clientes</h3>
                </Link>
                <Link href={`/dashboard/ventas/${userData.uid}`}>
                  <Image src={"/reporte.png"} width={80} height={80} />
                  <h3>Ventas</h3>
                </Link>
              </div>
            </>
            : ""
        }
      </div>

    </>
  );
}
export default Page
