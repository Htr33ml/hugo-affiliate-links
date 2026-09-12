import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UA = {
  desktop:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  fb: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  whatsapp: 'WhatsApp/2.23.20.0',
  google: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
}

async function teste(url: string, ua: string) {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': ua, Accept: 'text/html,application/json,*/*', 'Accept-Language': 'pt-BR,pt;q=0.9' },
    })
    const body = await r.text()
    return {
      status: r.status,
      final: r.url.slice(0, 80),
      len: body.length,
      og: body.match(/og:image"\s+content="([^"]{0,60})/)?.[1] ?? null,
      img: body.match(/https:\/\/ae-pic[^"\\]{0,60}\.jpg/)?.[0] ?? null,
      trecho: body.length < 5000 ? body.replace(/\s+/g, ' ').slice(0, 300) : null,
    }
  } catch (e) {
    return { erro: String(e).slice(0, 120) }
  }
}

export async function GET() {
  const id = '1005011792432203'
  const casos: [string, string, string][] = [
    ['pt_desktop', `https://pt.aliexpress.com/item/${id}.html`, UA.desktop],
    ['pt_fb', `https://pt.aliexpress.com/item/${id}.html`, UA.fb],
    ['www_google', `https://www.aliexpress.com/item/${id}.html`, UA.google],
    ['m_iphone', `https://m.aliexpress.com/item/${id}.html`, UA.iphone],
    ['msite_api', `https://www.aliexpress.com/aeglodetailweb/api/msite/item/detail?productId=${id}`, UA.iphone],
    ['sclick_whatsapp', 'https://s.click.aliexpress.com/e/_mL9CMUj', UA.whatsapp],
    ['sclick_fb', 'https://s.click.aliexpress.com/e/_mL9CMUj', UA.fb],
  ]
  const out: Record<string, unknown> = { v: 5 }
  for (const [nome, url, ua] of casos) out[nome] = await teste(url, ua)
  return NextResponse.json(out)
}
