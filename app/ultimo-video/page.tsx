'use client'

import { Grade, Pagina, useProdutos } from '../components/ProductList'

export default function UltimoVideoPage() {
  const { products, status } = useProdutos()
  return (
    <Pagina titulo="Último Vídeo" subtitulo="O que apareceu no vídeo">
      <Grade products={products.filter((p) => p.secao === 'ultimo_video')} status={status} />
    </Pagina>
  )
}
