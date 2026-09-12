import { NextResponse } from 'next/server'
import { buscarImagem } from '@/app/lib/imagem'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LINKS = [
  'https://s.click.aliexpress.com/e/_mL9CMUj',
  'https://s.click.aliexpress.com/e/_mOi2zPH',
  'https://s.click.aliexpress.com/e/_mq8XlUX',
  'https://s.click.aliexpress.com/e/_mK2WmaX',
  'https://mais.app/lOD4sF',
  'https://mais.app/m6Dcsg',
  'https://mais.app/DMMn5L',
]

export async function GET() {
  const t = Date.now()
  const out = await Promise.all(LINKS.map(async (l) => ({ l, img: await buscarImagem(l) })))
  return NextResponse.json({ v: 3, ms: Date.now() - t, out })
}
