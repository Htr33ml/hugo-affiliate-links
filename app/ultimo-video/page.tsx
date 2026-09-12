'use client'

import { useEffect, useState } from 'react'
import { ProductGridCard } from '../components/ProductGridCard'
import type { Product } from '../lib/types'

export default function UltimoVideoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    fetch('/api/products')
      .then((r) => {
        if (!r.ok) throw new Error('falhou')
        return r.json()
      })
      .then((data: Product[]) => {
        const filtered = data.filter((p) => p.secao === 'ultimo_video')
        setProducts(filtered)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4">
      <header className="border-b-2 border-black py-8 text-center">
        <h1 className="font-display text-3xl uppercase">Último Vídeo</h1>
      </header>

      {status === 'loading' && <p className="py-10 text-center text-sm">Carregando...</p>}

      {status === 'error' && (
        <p className="py-10 text-center text-sm">Não deu pra carregar agora.</p>
      )}

      {status === 'ready' && products.length === 0 && (
        <p className="py-10 text-center text-sm">Nenhum produto por aqui ainda.</p>
      )}

      {status === 'ready' && products.length > 0 && (
        <section className="grid grid-cols-2 gap-4 py-6">
          {products.map((p) => (
            <ProductGridCard key={p.id} product={p} />
          ))}
        </section>
      )}

      <footer className="border-t-2 border-black py-8 text-center">
        <a href="/" className="text-xs tracking-widest underline">
          ← voltar
        </a>
      </footer>
    </main>
  )
}
