'use client'

import type { Product } from '../lib/types'

export function ProductCard({ product, showFlag }: { product: Product; showFlag?: boolean }) {
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

  return (
    <a
      href={product.link_afiliado}
      onClick={track}
      rel="noopener noreferrer sponsored"
      className="mb-3 block w-full border-2 border-black bg-white p-4 font-display text-lg uppercase leading-tight transition-colors hover:bg-black hover:text-white"
    >
      {product.nome}
      {showFlag && flag}
    </a>
  )
}
