'use client'

import { useState } from 'react'
import { isChines, type Product } from '../lib/types'

export function ProductGridCard({ product }: { product: Product }) {
  const [imagemQuebrou, setImagemQuebrou] = useState(false)

  const track = () => {
    fetch('/api/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id }),
      keepalive: true,
    }).catch(() => {})
  }

  const temImagem = product.imagem_url && !imagemQuebrou

  return (
    <a
      href={product.link_afiliado}
      onClick={track}
      rel="noopener noreferrer sponsored"
      className="group flex flex-col border-2 border-black bg-white"
    >
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden border-b-2 border-black bg-white">
        {temImagem ? (
          <img
            src={product.imagem_url!}
            alt={product.nome}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImagemQuebrou(true)}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="px-3 text-center font-display text-2xl uppercase leading-none text-neutral-300">
            {product.nome.slice(0, 2)}
          </span>
        )}
      </div>
      <span className="flex flex-1 items-center justify-center p-3 text-center font-display text-sm uppercase leading-tight transition-colors group-hover:bg-black group-hover:text-white">
        {product.nome}
        {isChines(product) && ' 🇨🇳'}
      </span>
    </a>
  )
}
