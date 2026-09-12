'use client'

import { useEffect, useState } from 'react'
import { ProductGridCard } from './ProductGridCard'
import type { Product } from '../lib/types'

export function useProdutos() {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    fetch('/api/products')
      .then((r) => {
        if (!r.ok) throw new Error('falhou')
        return r.json()
      })
      .then((data: Product[]) => {
        setProducts(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return { products, status }
}

export function Pagina({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string
  subtitulo?: string
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4">
      <header className="border-b-2 border-black py-8 text-center">
        <h1 className="font-display text-3xl uppercase">{titulo}</h1>
        {subtitulo && (
          <p className="mt-2 text-xs uppercase tracking-widest text-neutral-600">{subtitulo}</p>
        )}
      </header>
      {children}
      <footer className="border-t-2 border-black py-8 text-center">
        <a href="/" className="text-xs uppercase tracking-widest underline">
          ← voltar
        </a>
      </footer>
    </main>
  )
}

export function Grade({
  products,
  status,
}: {
  products: Product[]
  status: 'loading' | 'ready' | 'error'
}) {
  if (status === 'loading') return <p className="py-10 text-center text-sm">Carregando...</p>
  if (status === 'error') return <p className="py-10 text-center text-sm">Não deu pra carregar agora.</p>
  if (products.length === 0) return <p className="py-10 text-center text-sm">Nenhum produto por aqui ainda.</p>

  return (
    <section className="grid grid-cols-2 gap-3 py-6">
      {products.map((p) => (
        <ProductGridCard key={p.id} product={p} />
      ))}
    </section>
  )
}
