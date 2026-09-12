'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Grade, Pagina, useProdutos } from '../components/ProductList'
import { CATEGORIAS, isChines, type Product } from '../lib/types'

const FILTROS: { value: string; label: string; aplica: (p: Product) => boolean }[] = [
  { value: '', label: 'Todos', aplica: () => true },
  { value: 'china', label: 'Chineses 🇨🇳', aplica: isChines },
  ...CATEGORIAS.map((c) => ({
    value: c.value,
    label: c.label,
    aplica: (p: Product) => p.categoria === c.value,
  })),
]

function Todos() {
  const router = useRouter()
  const params = useSearchParams()
  const { products, status } = useProdutos()

  const atual = FILTROS.find((f) => f.value === (params.get('c') ?? '')) ?? FILTROS[0]
  const visiveis = FILTROS.filter(
    (f) => f === atual || f.value === '' || status !== 'ready' || products.some(f.aplica),
  )

  return (
    <Pagina titulo={atual.value ? atual.label : 'Todos os Produtos'}>
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-6 [scrollbar-width:none]">
        {visiveis.map((f) => (
          <button
            key={f.value}
            onClick={() => router.replace(f.value ? `/todos?c=${f.value}` : '/todos', { scroll: false })}
            className={`shrink-0 border-2 border-black px-3 py-2 text-xs uppercase tracking-widest ${
              f === atual ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            {f.label}
          </button>
        ))}
      </nav>
      <Grade products={products.filter(atual.aplica)} status={status} />
    </Pagina>
  )
}

export default function TodosPage() {
  return (
    <Suspense>
      <Todos />
    </Suspense>
  )
}
