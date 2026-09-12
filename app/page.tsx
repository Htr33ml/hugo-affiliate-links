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
        <h1 className="font-display text-3xl uppercase">HUGO | CORRIDA</h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-neutral-600">
          Produtos que eu recomendo
        </p>
      </header>

      <a
        href="https://strava.app.link/JshIIU3y22b"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-3 border-2 border-black bg-black p-4 font-display text-base text-white transition-colors hover:bg-white hover:text-black"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 fill-current">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        meu Strava, segue aee
      </a>

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

      <footer className="border-t-2 border-black py-8 text-center">
        <p className="font-display text-sm leading-relaxed">
          corrida TRU, sem MIMIMI, SIGA Hugo Tremmel
        </p>
      </footer>
    </main>
  )
}
