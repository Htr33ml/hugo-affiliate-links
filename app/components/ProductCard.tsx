export interface Product {
  id: number
  nome: string
  link_afiliado: string
  secao: 'ultimo_video' | 'comentarios' | 'gerais'
  clicks?: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const handleClick = async () => {
    // Registra clique e redireciona
    await fetch('/api/clicks', {
      method: 'POST',
      body: JSON.stringify({ product_id: product.id }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {})
    
    window.location.href = product.link_afiliado
  }

  return (
    <button
      onClick={handleClick}
      className="w-full p-4 mb-3 text-left bg-white border-2 border-black hover:bg-gray-50 transition-all"
      style={{ fontFamily: 'Archivo Black, sans-serif' }}
    >
      <div className="text-lg font-bold">{product.nome}</div>
      {product.clicks !== undefined && (
        <div className="text-xs text-gray-600 mt-1">{product.clicks} cliques</div>
      )}
    </button>
  )
}
