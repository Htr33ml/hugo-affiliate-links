'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from './components/ProductCard'
import { SECOES, type Product } from './lib/types'

export default function Home() {
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

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4">
      <header className="border-b-2 border-black py-8 text-center">
        <h1 className="font-display text-3xl uppercase">Hugo</h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-neutral-600">
          Produtos que eu recomendo
        </p>
      </header>

      {status === 'loading' && <p className="py-10 text-center text-sm">Carregando...</p>}

      {status === 'error' && (
        <p className="py-10 text-center text-sm">Não deu pra carregar os produtos agora.</p>
      )}

      {status === 'ready' && products.length === 0 && (
        <p className="py-10 text-center text-sm">Nenhum produto por aqui ainda.</p>
      )}

      {status === 'ready' &&
        SECOES.map(({ value, label }) => {
          const items = products.filter((p) => p.secao === value)
          if (items.length === 0) return null
          return (
            <section key={value} className="py-6">
              <h2 className="mb-4 font-display text-xs uppercase tracking-[0.2em]">{label}</h2>
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </section>
          )
        })}

      <footer className="border-t-2 border-black py-6 text-center">
        <a href="/admin" className="text-xs uppercase tracking-widest underline">
          Admin
        </a>
      </footer>
    </main>
  )
}
