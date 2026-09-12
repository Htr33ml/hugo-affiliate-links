import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/app/lib/db'
import { isAuthorized } from '@/app/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const productId = Number(body?.product_id)
    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      null

    await query('INSERT INTO clicks (product_id, ip) VALUES ($1, $2)', [productId, ip])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/clicks', error)
    return NextResponse.json({ error: 'Falha ao registrar clique' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req.headers.get('Authorization'))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { rows } = await query<{ id: number; nome: string; clicks: number }>(`
      SELECT p.id, p.nome, COUNT(c.id)::int AS clicks
      FROM products p
      LEFT JOIN clicks c ON c.product_id = p.id
      GROUP BY p.id, p.nome
      ORDER BY clicks DESC, p.nome
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/clicks', error)
    return NextResponse.json({ error: 'Falha ao carregar analytics' }, { status: 500 })
  }
}
