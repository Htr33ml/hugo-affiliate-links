'use client'

import { useEffect, useState } from 'react'
import { ProductCard, type Product } from './components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState<Record<string, Product[]>>({
    ultimo_video: [],
    comentarios: [],
    gerais: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        const grouped: Record<string, Product[]> = { ultimo_video: [], comentarios: [], gerais: [] }
        data.forEach((p: Product) => {
          grouped[p.secao as keyof typeof grouped].push(p)
        })
        setProducts(grouped)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-4">Carregando...</div>

  return (
    <div style={{ fontFamily: 'Archivo Black, system-ui, sans-serif' }} className="min-h-screen bg-white">
      <div className="max-w-md mx-auto p-4">
        {/* Topo */}
        <div className="text-center py-6 border-b-2 border-black">
          <h1 className="text-2xl font-bold">Hugo</h1>
          <p className="text-xs text-gray-600 mt-1">Produtos que eu recomendo</p>
        </div>

        {/* Último Vídeo */}
        {products.ultimo_video.length > 0 && (
          <section className="py-6">
            <h2 className="text-sm font-bold mb-4 uppercase tracking-widest">Último Vídeo</h2>
            {products.ultimo_video.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>
        )}

        {/* Comentários */}
        {products.comentarios.length > 0 && (
          <section className="py-6">
            <h2 className="text-sm font-bold mb-4 uppercase tracking-widest">Comentários</h2>
            {products.comentarios.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>
        )}

        {/* Gerais */}
        {products.gerais.length > 0 && (
          <section className="py-6">
            <h2 className="text-sm font-bold mb-4 uppercase tracking-widest">Gerais</h2>
            {products.gerais.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>
        )}

        {/* Rodapé */}
        <div className="py-6 text-center border-t-2 border-black text-xs text-gray-600">
          <a href="/admin" className="underline">Admin</a>
        </div>
      </div>
    </div>
  )
}
