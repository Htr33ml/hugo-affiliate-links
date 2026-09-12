'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import type { Product } from '../lib/types'

export default function TenisPage() {
  const [shoes, setShoes] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    fetch('/api/products')
      .then((r) => {
        if (!r.ok) throw new Error('falhou')
        return r.json()
      })
      .then((data: Product[]) => {
        const aliexpressShoes = data.filter((p) => p.link_afiliado.includes('aliexpress'))
        setShoes(aliexpressShoes)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4">
      <header className="border-b-2 border-black py-8 text-center">
        <h1 className="font-display text-3xl uppercase">Tênis 🇨🇳</h1>
        <p className="mt-2 text-xs tracking-widest text-neutral-600">
          Os melhores da China direto pra casa
        </p>
      </header>

      {status === 'loading' && <p className="py-10 text-center text-sm">Carregando...</p>}

      {status === 'error' && (
        <p className="py-10 text-center text-sm">Não deu pra carregar os tênis agora.</p>
      )}

      {status === 'ready' && shoes.length === 0 && (
        <p className="py-10 text-center text-sm">Nenhum tênis por aqui ainda.</p>
      )}

      {status === 'ready' && shoes.length > 0 && (
        <section className="py-6">
          {shoes.map((p) => (
            <ProductCard key={p.id} product={p} showFlag={true} />
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
