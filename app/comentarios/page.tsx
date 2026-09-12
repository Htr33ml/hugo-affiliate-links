'use client'

import { Grade, Pagina, useProdutos } from '../components/ProductList'

export default function ComentariosPage() {
  const { products, status } = useProdutos()
  return (
    <Pagina titulo="Comentários" subtitulo="O que a galera pediu">
      <Grade products={products.filter((p) => p.secao === 'comentarios')} status={status} />
    </Pagina>
  )
}
