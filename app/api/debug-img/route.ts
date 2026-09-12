import { NextResponse } from 'next/server'
import { buscarImagem } from '@/app/lib/imagem'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FB = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
const DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

async function passo(url: string, ua: string, extra: Record<string, string>, redirect: RequestRedirect) {
  try {
    const r = await fetch(url, {
      redirect,
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': ua, 'Accept-Language': 'pt-BR,pt;q=0.9', ...extra },
    })
    const html = redirect === 'manual' ? '' : await r.text()
    return {
      status: r.status,
      location: r.headers.get('location')?.slice(0, 90) ?? null,
      len: html.length,
      temOg: /og:image/.test(html),
    }
  } catch (e) {
    return { erro: String(e).slice(0, 160) }
  }
}

export async function GET() {
  const id = '1005011792432203'
  const item = `https://pt.aliexpress.com/item/${id}.html`
  const accept = { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' }
  const [sclick, fbSem, fbCom, final] = await Promise.all([
    passo('https://s.click.aliexpress.com/e/_mL9CMUj', DESKTOP, accept, 'manual'),
    passo(item, FB, {}, 'follow'),
    passo(item, FB, accept, 'follow'),
    buscarImagem('https://s.click.aliexpress.com/e/_mL9CMUj'),
  ])
  return NextResponse.json({ v: 4, sclick, fbSem, fbCom, final })
}
