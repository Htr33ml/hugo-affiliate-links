export type Secao = 'ultimo_video' | 'comentarios' | 'gerais'

export interface Product {
  id: number
  nome: string
  link_afiliado: string
  imagem_url?: string
  secao: Secao
}

export const SECOES: { value: Secao; label: string }[] = [
  { value: 'ultimo_video', label: 'Último Vídeo' },
  { value: 'comentarios', label: 'Comentários' },
  { value: 'gerais', label: 'Gerais' },
]

export function isSecao(value: unknown): value is Secao {
  return SECOES.some((s) => s.value === value)
}
