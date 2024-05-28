import { Lexend, Righteous } from "next/font/google"
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";


export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const righteous = Righteous({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-righteous',
  weight: ["400"]
})

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster/>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
