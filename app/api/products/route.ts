import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/app/lib/db'
import { isAuthorized } from '@/app/lib/auth'
import { buscarImagem } from '@/app/lib/imagem'
import { isCategoria, isSecao, type Product } from '@/app/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FOTO = 1_500_000

const SELECT = `
  SELECT id, nome, link_afiliado, secao, categoria,
    CASE WHEN imagem_data IS NOT NULL
      THEN '/api/products/' || id || '/imagem?v=' || substr(md5(imagem_data), 1, 8)
      ELSE imagem_url
    END AS imagem_url
  FROM products
`

const naoAutorizado = () => NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
const invalido = (error: string) => NextResponse.json({ error }, { status: 400 })

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function urlHttp(v: string): boolean {
  try {
    return /^https?:$/.test(new URL(v).protocol)
  } catch {
    return false
  }
}

function fotoValida(v: string): boolean {
  return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length <= MAX_FOTO
}

async function buscarProduto(id: number): Promise<Product | undefined> {
  const { rows } = await query<Product>(`${SELECT} WHERE id = $1`, [id])
  return rows[0]
}

export async function GET() {
  try {
    const { rows } = await query<Product>(`${SELECT} ORDER BY ordem, id DESC`)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/products', error)
    return NextResponse.json({ error: 'Falha ao carregar produtos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req.headers.get('Authorization'))) return naoAutorizado()

  try {
    const body = await req.json().catch(() => null)
    const nome = texto(body?.nome)
    const link = texto(body?.link_afiliado)
    const secao = body?.secao
    const categoria = body?.categoria || null
    let imagemUrl = texto(body?.imagem_url) || null
    const imagemData = texto(body?.imagem_data) || null

    if (!nome || !link) return invalido('Preencha nome e link')
    if (!urlHttp(link)) return invalido('Link inválido')
    if (!isSecao(secao)) return invalido('Seção inválida')
    if (categoria !== null && !isCategoria(categoria)) return invalido('Categoria inválida')
    if (imagemUrl && !urlHttp(imagemUrl)) return invalido('URL da foto inválida')
    if (imagemData && !fotoValida(imagemData)) return invalido('Foto inválida ou muito grande')

    if (!imagemUrl && !imagemData) imagemUrl = await buscarImagem(link)

    const { rows } = await query<{ id: number }>(
      `INSERT INTO products (nome, link_afiliado, secao, categoria, imagem_url, imagem_data)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [nome, link, secao, categoria, imagemUrl, imagemData],
    )
    return NextResponse.json(await buscarProduto(rows[0].id))
  } catch (error) {
    console.error('POST /api/products', error)
    return NextResponse.json({ error: 'Falha ao criar produto' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req.headers.get('Authorization'))) return naoAutorizado()

  try {
    const body = await req.json().catch(() => null)
    const id = Number(body?.id)
    if (!Number.isInteger(id)) return invalido('ID inválido')

    const sets: string[] = []
    const params: unknown[] = []
    const set = (coluna: string, valor: unknown) => {
      params.push(valor)
      sets.push(`${coluna} = $${params.length}`)
    }

    if ('nome' in body) {
      const nome = texto(body.nome)
      if (!nome) return invalido('Nome vazio')
      set('nome', nome)
    }
    if ('link_afiliado' in body) {
      const link = texto(body.link_afiliado)
      if (!urlHttp(link)) return invalido('Link inválido')
      set('link_afiliado', link)
    }
    if ('secao' in body) {
      if (!isSecao(body.secao)) return invalido('Seção inválida')
      set('secao', body.secao)
    }
    if ('categoria' in body) {
      const categoria = body.categoria || null
      if (categoria !== null && !isCategoria(categoria)) return invalido('Categoria inválida')
      set('categoria', categoria)
    }

    if (body.buscar_imagem === true) {
      const { rows } = await query<{ link_afiliado: string }>(
        'SELECT link_afiliado FROM products WHERE id = $1',
        [id],
      )
      if (!rows[0]) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      const encontrada = await buscarImagem(texto(body.link_afiliado) || rows[0].link_afiliado)
      if (!encontrada) return NextResponse.json({ error: 'Não achei foto nesse link' }, { status: 422 })
      set('imagem_url', encontrada)
      set('imagem_data', null)
    } else if ('imagem_data' in body && body.imagem_data) {
      if (!fotoValida(body.imagem_data)) return invalido('Foto inválida ou muito grande')
      set('imagem_data', body.imagem_data)
    } else if ('imagem_url' in body) {
      const url = texto(body.imagem_url) || null
      if (url && !urlHttp(url)) return invalido('URL da foto inválida')
      set('imagem_url', url)
      set('imagem_data', null)
    }

    if (sets.length === 0) return invalido('Nada pra atualizar')

    params.push(id)
    const res = await query(`UPDATE products SET ${sets.join(', ')} WHERE id = $${params.length}`, params)
    if (res.rowCount === 0) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    return NextResponse.json(await buscarProduto(id))
  } catch (error) {
    console.error('PATCH /api/products', error)
    return NextResponse.json({ error: 'Falha ao atualizar produto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req.headers.get('Authorization'))) return naoAutorizado()

  try {
    const body = await req.json().catch(() => null)
    const id = Number(body?.id)
    if (!Number.isInteger(id)) return invalido('ID inválido')

    await query('DELETE FROM products WHERE id = $1', [id])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/products', error)
    return NextResponse.json({ error: 'Falha ao deletar produto' }, { status: 500 })
  }
}
