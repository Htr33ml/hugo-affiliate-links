import { NextResponse } from 'next/server'
import { query } from '@/app/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id)) return new NextResponse(null, { status: 404 })

  const { rows } = await query<{ imagem_data: string | null }>(
    'SELECT imagem_data FROM products WHERE id = $1',
    [id],
  )
  const match = rows[0]?.imagem_data?.match(/^data:(image\/[a-z]+);base64,(.+)$/)
  if (!match) return new NextResponse(null, { status: 404 })

  return new NextResponse(Buffer.from(match[2], 'base64'), {
    headers: {
      'Content-Type': match[1],
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
