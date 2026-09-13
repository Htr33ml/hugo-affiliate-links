'use client'

import { useState } from 'react'
import { CATEGORIAS, SECOES, type Categoria, type Product, type Secao } from '../lib/types'

interface Form {
  nome: string
  link_afiliado: string
  secao: Secao
  categoria: Categoria | ''
  imagem_url: string
  imagem_data: string
}

interface Analytics {
  id: number
  nome: string
  clicks: number
  clicks_7d: number
  clicks_hoje: number
}

const FORM_VAZIO: Form = {
  nome: '',
  link_afiliado: '',
  secao: 'gerais',
  categoria: '',
  imagem_url: '',
  imagem_data: '',
}

async function reduzirFoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const escala = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.82)
}

const input = 'w-full border-2 border-black bg-white p-2'
const botao =
  'border-2 border-black p-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-40'
const botaoPreto =
  'w-full border-2 border-black bg-black p-2 font-display uppercase text-white disabled:opacity-50'

function Miniatura({ src, tamanho }: { src: string | null; tamanho: string }) {
  return (
    <div className={`${tamanho} flex shrink-0 items-center justify-center overflow-hidden border-2 border-black bg-white`}>
      {src ? (
        <img src={src} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
      ) : (
        <span className="text-[10px] uppercase text-neutral-400">sem foto</span>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [periodo, setPeriodo] = useState<'clicks' | 'clicks_7d' | 'clicks_hoje'>('clicks')
  const [form, setForm] = useState<Form>(FORM_VAZIO)
  const [busy, setBusy] = useState(false)
  const [ocupados, setOcupados] = useState<Record<number, boolean>>({})
  const [msg, setMsg] = useState('')

  const api = (method: string, url: string, body?: unknown) =>
    fetch(url, {
      method,
      headers: { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

  const erroDe = async (res: Response, padrao: string) =>
    ((await res.json().catch(() => null))?.error as string | undefined) ?? padrao

  const loadData = async () => {
    const [pRes, aRes] = await Promise.all([fetch('/api/products'), api('GET', '/api/clicks')])
    if (pRes.ok) setProducts(await pRes.json())
    if (aRes.ok) setAnalytics(await aRes.json())
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setBusy(true)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
      await loadData()
    } else {
      setMsg('Senha incorreta')
    }
    setBusy(false)
  }

  const buscarFotoDoForm = async () => {
    setMsg('')
    setBusy(true)
    const res = await api('POST', '/api/imagem/buscar', { link: form.link_afiliado })
    if (res.ok) {
      const { imagem_url } = await res.json()
      setForm((f) => ({ ...f, imagem_url, imagem_data: '' }))
    } else {
      setMsg(await erroDe(res, 'Não achei foto nesse link'))
    }
    setBusy(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setBusy(true)
    const res = await api('POST', '/api/products', { ...form, categoria: form.categoria || null })
    if (res.ok) {
      const criado: Product = await res.json()
      setForm(FORM_VAZIO)
      setMsg(criado.imagem_url ? 'Produto adicionado ✓' : 'Adicionado, mas não achei foto — envie uma manualmente')
      await loadData()
    } else {
      setMsg(await erroDe(res, 'Erro ao adicionar produto'))
    }
    setBusy(false)
  }

  const atualizar = async (id: number, dados: Record<string, unknown>) => {
    setMsg('')
    setOcupados((o) => ({ ...o, [id]: true }))
    const res = await api('PATCH', '/api/products', { id, ...dados })
    if (res.ok) {
      const atualizado: Product = await res.json()
      setProducts((ps) => ps.map((p) => (p.id === id ? atualizado : p)))
    } else {
      setMsg(await erroDe(res, 'Erro ao atualizar'))
    }
    setOcupados((o) => ({ ...o, [id]: false }))
    return res.ok
  }

  const buscarFotosQueFaltam = async () => {
    const semFoto = products.filter((p) => !p.imagem_url)
    let achou = 0
    for (const p of semFoto) {
      if (await atualizar(p.id, { buscar_imagem: true })) achou++
    }
    setMsg(`Achei ${achou} de ${semFoto.length} fotos`)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza?')) return
    setMsg('')
    const res = await api('DELETE', '/api/products', { id })
    if (res.ok) await loadData()
    else setMsg('Erro ao deletar produto')
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm border-2 border-black p-6">
          <h1 className="mb-4 font-display text-xl uppercase">Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mb-4 ${input}`}
            />
            {msg && <p className="mb-3 text-sm">{msg}</p>}
            <button type="submit" disabled={busy} className={botaoPreto}>
              {busy ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  const fotoPreview = form.imagem_data || form.imagem_url || null
  const semFoto = products.filter((p) => !p.imagem_url).length
  const clicksPorId = Object.fromEntries(analytics.map((a) => [a.id, a.clicks]))
  const soma = (campo: keyof Omit<Analytics, 'id' | 'nome'>) => analytics.reduce((t, a) => t + a[campo], 0)
  const ranking = [...analytics].sort((a, b) => b[periodo] - a[periodo]).filter((a) => a[periodo] > 0)
  const maior = ranking[0]?.[periodo] ?? 0

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4">
      <div className="mb-6 flex items-center justify-between border-b-2 border-black py-6">
        <h1 className="font-display text-2xl uppercase">Admin</h1>
        <button
          onClick={() => {
            setAuthed(false)
            setPassword('')
          }}
          className="text-xs uppercase tracking-widest underline"
        >
          Sair
        </button>
      </div>

      {msg && <p className="mb-4 border-2 border-black p-3 text-sm">{msg}</p>}

      <section className="mb-6 border-2 border-black p-4">
        <h2 className="mb-4 font-display text-sm uppercase tracking-widest">Cliques</h2>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {(
            [
              ['clicks_hoje', 'Hoje'],
              ['clicks_7d', '7 dias'],
              ['clicks', 'Total'],
            ] as const
          ).map(([campo, label]) => (
            <button
              key={campo}
              onClick={() => setPeriodo(campo)}
              className={`border-2 border-black p-3 text-center ${periodo === campo ? 'bg-black text-white' : 'bg-white'}`}
            >
              <div className="font-display text-2xl">{soma(campo)}</div>
              <div className="text-xs uppercase tracking-widest">{label}</div>
            </button>
          ))}
        </div>
        {ranking.length === 0 ? (
          <p className="text-sm">Sem cliques nesse período.</p>
        ) : (
          <div className="space-y-3">
            {ranking.map((item, i) => (
              <div key={item.id}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="truncate">
                    {i + 1}. {item.nome}
                  </span>
                  <span className="shrink-0 font-display">{item[periodo]}</span>
                </div>
                <div className="mt-1 h-2 w-full border border-black">
                  <div className="h-full bg-black" style={{ width: `${(item[periodo] / maior) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6 border-2 border-black p-4">
        <h2 className="mb-4 font-display text-sm uppercase tracking-widest">Adicionar Produto</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            type="text"
            placeholder="Nome do produto"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className={input}
          />
          <input
            type="url"
            placeholder="Link de afiliado"
            value={form.link_afiliado}
            onChange={(e) => setForm({ ...form, link_afiliado: e.target.value })}
            className={input}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs uppercase tracking-widest">
              Aparece em
              <select
                value={form.secao}
                onChange={(e) => setForm({ ...form, secao: e.target.value as Secao })}
                className={`mt-1 ${input} text-sm normal-case tracking-normal`}
              >
                {SECOES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-widest">
              Categoria
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value as Categoria | '' })}
                className={`mt-1 ${input} text-sm normal-case tracking-normal`}
              >
                <option value="">Sem categoria</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-neutral-600">Todo produto aparece também em “Todos os Produtos”.</p>

          <div className="flex gap-3">
            <Miniatura src={fotoPreview} tamanho="h-24 w-24" />
            <div className="flex flex-1 flex-col gap-2">
              <button
                type="button"
                onClick={buscarFotoDoForm}
                disabled={busy || !form.link_afiliado}
                className={botao}
              >
                Buscar foto do link
              </button>
              <label className={`${botao} cursor-pointer text-center`}>
                Enviar foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) {
                      const imagem_data = await reduzirFoto(file)
                      setForm((f) => ({ ...f, imagem_data, imagem_url: '' }))
                    }
                  }}
                />
              </label>
              {fotoPreview && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imagem_url: '', imagem_data: '' })}
                  className="text-xs uppercase tracking-widest underline"
                >
                  Tirar foto
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-600">Se deixar sem foto, eu tento puxar do link sozinho.</p>

          <button type="submit" disabled={busy} className={botaoPreto}>
            {busy ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
      </section>

      <section className="mb-10 border-2 border-black p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-sm uppercase tracking-widest">Produtos ({products.length})</h2>
          {semFoto > 0 && (
            <button onClick={buscarFotosQueFaltam} className={botao}>
              Buscar {semFoto} {semFoto === 1 ? 'foto' : 'fotos'}
            </button>
          )}
        </div>
        {products.length === 0 ? (
          <p className="text-sm">Nenhum produto cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className={`border-2 border-black p-3 ${ocupados[p.id] ? 'opacity-50' : ''}`}>
                <div className="flex gap-3">
                  <Miniatura src={p.imagem_url} tamanho="h-16 w-16" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display uppercase">{p.nome}</div>
                    <div className="text-xs text-neutral-600">{clicksPorId[p.id] ?? 0} cliques</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <select
                    value={p.secao}
                    onChange={(e) => atualizar(p.id, { secao: e.target.value })}
                    className="border-2 border-black bg-white p-2 text-sm"
                  >
                    {SECOES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={p.categoria ?? ''}
                    onChange={(e) => atualizar(p.id, { categoria: e.target.value || null })}
                    className="border-2 border-black bg-white p-2 text-sm"
                  >
                    <option value="">Sem categoria</option>
                    {CATEGORIAS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => atualizar(p.id, { buscar_imagem: true })}
                    disabled={ocupados[p.id]}
                    className={botao}
                  >
                    Buscar foto
                  </button>
                  <label className={`${botao} cursor-pointer text-center`}>
                    Enviar foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        if (file) atualizar(p.id, { imagem_data: await reduzirFoto(file) })
                      }}
                    />
                  </label>
                  <button onClick={() => handleDelete(p.id)} className={botao}>
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
