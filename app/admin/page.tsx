'use client'

import { useState } from 'react'
import { SECOES, type Product, type Secao } from '../lib/types'

interface Analytics {
  id: number
  nome: string
  clicks: number
}

const FORM_VAZIO: { nome: string; link_afiliado: string; secao: Secao } = {
  nome: '',
  link_afiliado: '',
  secao: 'gerais',
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')

  const loadData = async (pwd: string) => {
    const [pRes, aRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/clicks', { headers: { Authorization: `Bearer ${pwd}` } }),
    ])
    if (pRes.ok) setProducts(await pRes.json())
    if (aRes.ok) setAnalytics(await aRes.json())
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setBusy(true)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
      await loadData(password)
    } else {
      setErro('Senha incorreta')
    }
    setBusy(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setBusy(true)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm(FORM_VAZIO)
      await loadData(password)
    } else {
      const data = await res.json().catch(() => null)
      setErro(data?.error ?? 'Erro ao adicionar produto')
    }
    setBusy(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza?')) return
    setErro('')
    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      await loadData(password)
    } else {
      setErro('Erro ao deletar produto')
    }
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
              className="mb-4 w-full border-2 border-black p-2"
            />
            {erro && <p className="mb-3 text-sm">{erro}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full border-2 border-black bg-black p-2 font-display uppercase text-white disabled:opacity-50"
            >
              {busy ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>
    )
  }

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

      {erro && <p className="mb-4 border-2 border-black p-3 text-sm">{erro}</p>}

      <section className="mb-6 border-2 border-black p-4">
        <h2 className="mb-4 font-display text-sm uppercase tracking-widest">Adicionar Produto</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            type="text"
            placeholder="Nome do produto"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full border-2 border-black p-2"
          />
          <input
            type="url"
            placeholder="Link de afiliado"
            value={form.link_afiliado}
            onChange={(e) => setForm({ ...form, link_afiliado: e.target.value })}
            className="w-full border-2 border-black p-2"
          />
          <select
            value={form.secao}
            onChange={(e) => setForm({ ...form, secao: e.target.value as Secao })}
            className="w-full border-2 border-black bg-white p-2"
          >
            {SECOES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="w-full border-2 border-black bg-black p-2 font-display uppercase text-white disabled:opacity-50"
          >
            {busy ? 'Adicionando...' : 'Adicionar'}
          </button>
        </form>
      </section>

      <section className="mb-6 border-2 border-black p-4">
        <h2 className="mb-4 font-display text-sm uppercase tracking-widest">Cliques</h2>
        {analytics.length === 0 ? (
          <p className="text-sm">Sem cliques ainda.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {analytics.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.nome}</span>
                <span className="font-display">{item.clicks}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10 border-2 border-black p-4">
        <h2 className="mb-4 font-display text-sm uppercase tracking-widest">Produtos</h2>
        {products.length === 0 ? (
          <p className="text-sm">Nenhum produto cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 border-2 border-black p-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-display uppercase">{p.nome}</div>
                  <div className="text-xs text-neutral-600">
                    {SECOES.find((s) => s.value === p.secao)?.label ?? p.secao}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="shrink-0 border-2 border-black p-2 text-xs uppercase hover:bg-black hover:text-white"
                >
                  Deletar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
