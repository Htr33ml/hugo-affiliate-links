import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/app/lib/auth'
import { buscarImagem } from '@/app/lib/imagem'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!isAuthorized(req.headers.get('Authorization'))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const link = typeof body?.link === 'string' ? body.link.trim() : ''
  if (!link) return NextResponse.json({ error: 'Cole o link primeiro' }, { status: 400 })

  const imagem_url = await buscarImagem(link)
  if (!imagem_url) return NextResponse.json({ error: 'Não achei foto nesse link' }, { status: 422 })
  return NextResponse.json({ imagem_url })
}
