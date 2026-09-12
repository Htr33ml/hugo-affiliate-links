export type Secao = 'ultimo_video' | 'comentarios' | 'gerais'
export type Categoria = 'tenis' | 'geis' | 'acessorios' | 'suplementos' | 'eletrolitos'

export interface Product {
  id: number
  nome: string
  link_afiliado: string
  imagem_url: string | null
  secao: Secao
  categoria: Categoria | null
}

export const SECOES: { value: Secao; label: string }[] = [
  { value: 'ultimo_video', label: 'Último Vídeo' },
  { value: 'comentarios', label: 'Comentários' },
  { value: 'gerais', label: 'Só em Todos' },
]

export const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'tenis', label: 'Tênis' },
  { value: 'geis', label: 'Géis' },
  { value: 'acessorios', label: 'Acessórios de corrida' },
  { value: 'suplementos', label: 'Suplementos' },
  { value: 'eletrolitos', label: 'Repositor de eletrólito' },
]

export function isSecao(value: unknown): value is Secao {
  return SECOES.some((s) => s.value === value)
}

export function isCategoria(value: unknown): value is Categoria {
  return CATEGORIAS.some((c) => c.value === value)
}

export function isChines(p: Pick<Product, 'link_afiliado'>): boolean {
  return /aliexpress/i.test(p.link_afiliado)
}
