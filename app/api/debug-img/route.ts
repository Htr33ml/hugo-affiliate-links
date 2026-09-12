import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const UAS: Record<string, string> = {
  desktop: DESKTOP,
  mobile: MOBILE,
  facebook: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  whatsapp: 'WhatsApp/2.23.20.0',
  google: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  twitter: 'Twitterbot/1.0',
}

async function probe(url: string, ua: string, redirect: RequestRedirect = 'follow') {
  const t = Date.now()
  try {
    const r = await fetch(url, {
      redirect,
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': ua, 'Accept-Language': 'pt-BR,pt;q=0.9', Accept: 'text/html,*/*' },
    })
    const html = redirect === 'manual' ? '' : await r.text()
    return {
      status: r.status,
      final: r.url.slice(0, 120),
      location: r.headers.get('location')?.slice(0, 160),
      len: html.length,
      og: html.match(/og:image"?\s+content="([^"]+)/)?.[1] ?? html.match(/content="([^"]+)"\s+property="og:image/)?.[1] ?? null,
      imagePathList: html.match(/"imagePathList":\["([^"]+)/)?.[1] ?? null,
      title: html.match(/<title>([^<]*)/)?.[1]?.slice(0, 80) ?? null,
      ms: Date.now() - t,
    }
  } catch (e) {
    return { erro: String(e).slice(0, 120), ms: Date.now() - t }
  }
}

export async function GET() {
  const id = '1005011792432203'
  const out: Record<string, unknown> = {}
  out.sclick_manual = await probe('https://s.click.aliexpress.com/e/_mL9CMUj', DESKTOP, 'manual')
  const alvos: Record<string, string> = {
    pt: `https://pt.aliexpress.com/item/${id}.html`,
    www: `https://www.aliexpress.com/item/${id}.html`,
    m: `https://m.aliexpress.com/item/${id}.html`,
    us: `https://www.aliexpress.us/item/${id}.html`,
    ru: `https://aliexpress.ru/item/${id}.html`,
  }
  await Promise.all(
    Object.entries(alvos).flatMap(([nome, url]) =>
      Object.entries(UAS).map(async ([uaNome, ua]) => {
        out[`${nome}_${uaNome}`] = await probe(url, ua)
      }),
    ),
  )
  return NextResponse.json(out)
}
