'use client'

import type { Product } from '../lib/types'

export function ProductGridCard({ product, showFlag }: { product: Product; showFlag?: boolean }) {
  const track = () => {
    fetch('/api/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id }),
      keepalive: true,
    }).catch(() => {})
  }

  const isAliexpress = product.link_afiliado.includes('aliexpress')
  const flag = isAliexpress ? ' 🇨🇳' : ''
  const bgColor = ['bg-blue-50', 'bg-red-50', 'bg-yellow-50', 'bg-green-50', 'bg-purple-50', 'bg-pink-50', 'bg-indigo-50'][
    product.id % 7
  ]

  return (
    <div className="flex flex-col gap-2">
      <div className={`${product.imagem_url ? '' : bgColor} aspect-square w-full border-2 border-black overflow-hidden`}>
        {product.imagem_url ? (
          <img
            src={product.imagem_url}
            alt={product.nome}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100">
            <span className="text-xs text-neutral-400">sem imagem</span>
          </div>
        )}
      </div>
      <a
        href={product.link_afiliado}
        onClick={track}
        rel="noopener noreferrer sponsored"
        className="block w-full border-2 border-black bg-white p-3 font-display text-sm uppercase leading-tight transition-colors hover:bg-black hover:text-white"
      >
        {product.nome}
        {showFlag && flag}
      </a>
    </div>
  )
}
