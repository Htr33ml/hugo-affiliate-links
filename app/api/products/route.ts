import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/app/lib/db'
import { isAuthorized } from '@/app/lib/auth'
import { isSecao, type Product } from '@/app/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { rows } = await query<Product>(
      'SELECT id, nome, link_afiliado, secao FROM products ORDER BY secao, ordem, id',
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/products', error)
    return NextResponse.json({ error: 'Falha ao carregar produtos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req.headers.get('Authorization'))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => null)
    const nome = typeof body?.nome === 'string' ? body.nome.trim() : ''
    const link = typeof body?.link_afiliado === 'string' ? body.link_afiliado.trim() : ''
    const secao = body?.secao

    if (!nome || !link) {
      return NextResponse.json({ error: 'Preencha nome e link' }, { status: 400 })
    }
    if (!isSecao(secao)) {
      return NextResponse.json({ error: 'Seção inválida' }, { status: 400 })
    }

    const { rows } = await query<{ id: number }>(
      'INSERT INTO products (nome, link_afiliado, secao) VALUES ($1, $2, $3) RETURNING id',
      [nome, link, secao],
    )
    return NextResponse.json({ id: rows[0].id })
  } catch (error) {
    console.error('POST /api/products', error)
    return NextResponse.json({ error: 'Falha ao criar produto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req.headers.get('Authorization'))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => null)
    const id = Number(body?.id)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    await query('DELETE FROM products WHERE id = $1', [id])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/products', error)
    return NextResponse.json({ error: 'Falha ao deletar produto' }, { status: 500 })
  }
}
