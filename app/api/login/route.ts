import { NextRequest, NextResponse } from 'next/server'
import { checkPassword } from '@/app/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
