import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hugo - Links de Afiliados',
  description: 'Produtos que eu recomendo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
