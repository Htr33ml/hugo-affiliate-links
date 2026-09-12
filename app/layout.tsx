import type { Metadata } from 'next'
import { Archivo_Black } from 'next/font/google'
import './globals.css'

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HUGO | CORRIDA',
  description: 'Produtos que eu recomendo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={archivoBlack.variable}>
      <body className="bg-white text-black">{children}</body>
    </html>
  )
}
