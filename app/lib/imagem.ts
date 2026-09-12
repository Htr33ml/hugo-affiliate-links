const UA_NAVEGADOR =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

// AliExpress manda captcha pra "navegador" vindo de datacenter (Vercel), mas libera os robôs de preview de link
const UAS_PAGINA = [
  UA_NAVEGADOR,
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'WhatsApp/2.23.20.0',
]

async function get(url: string, init: RequestInit = {}, ua = UA_NAVEGADOR): Promise<Response> {
  return fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
    ...init,
    headers: { 'User-Agent': ua, 'Accept-Language': 'pt-BR,pt;q=0.9', ...init.headers },
  })
}

// mais.app redireciona via JS, então consulta a API do encurtador direto
async function resolverMaisApp(url: URL): Promise<string | null> {
  const codigo = url.pathname.replace(/^\//, '')
  if (!/^[A-Za-z0-9]{6}$/.test(codigo)) return null
  const res = await get(`https://api-encurtador.mais.network/Conversion/ConvertUrl/${codigo}`, {
    headers: { 'x-server-origin': 'mais.app' },
  })
  const data = await res.json().catch(() => null)
  return data?.success && typeof data.url === 'string' ? data.url : null
}

function metaImagem(html: string): string | null {
  const metas = html.match(/<meta[^>]+>/gi) ?? []
  for (const prop of ['og:image:secure_url', 'og:image', 'twitter:image']) {
    for (const tag of metas) {
      if (new RegExp(`(property|name)=["']${prop}["']`, 'i').test(tag)) {
        const content = tag.match(/content=["']([^"']+)["']/i)?.[1]
        if (content) return content.replace(/&amp;/g, '&')
      }
    }
  }
  return null
}

// Lojas VTEX (Olympikus e várias outras) montam a página no navegador; o catálogo público tem a foto
async function imagemVtex(url: URL): Promise<string | null> {
  const slug = url.pathname.match(/^\/([^/]+)\/p\/?$/)?.[1]
  if (!slug) return null
  const res = await get(`${url.origin}/api/catalog_system/pub/products/search/${slug}/p`)
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  const img = data?.[0]?.items?.[0]?.images?.[0]?.imageUrl
  return typeof img === 'string' ? img : null
}

export async function buscarImagem(link: string): Promise<string | null> {
  try {
    let url = new URL(link)
    if (!/^https?:$/.test(url.protocol)) return null

    if (url.hostname.endsWith('mais.app')) {
      const destino = await resolverMaisApp(url)
      if (!destino) return null
      url = new URL(destino)
    }

    let final = url
    for (const ua of UAS_PAGINA) {
      const res = await get(url.toString(), {}, ua).catch(() => null)
      if (!res) continue
      final = new URL(res.url || url.toString())
      const meta = metaImagem(res.ok ? await res.text() : '')
      if (meta) return new URL(meta, final).toString()
      const vtex = await imagemVtex(final).catch(() => null)
      if (vtex) return vtex
    }
    return null
  } catch {
    return null
  }
}
