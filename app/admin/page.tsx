'use client'

import { useState, useEffect } from 'react'
import type { Product } from '../components/ProductCard'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<any[]>([])
  const [form, setForm] = useState({ nome: '', link_afiliado: '', secao: 'gerais' })
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'hugo123'
    if (password === envPassword) {
      setAuthenticated(true)
      loadData()
    } else {
      alert('Senha incorreta')
    }
  }

  const loadData = async () => {
    const token = `Bearer ${password}`
    const [productsRes, analyticsRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/clicks', { headers: { Authorization: token } }).catch(() => null)
    ])
    
    if (productsRes.ok) {
      setProducts(await productsRes.json())
    }
    if (analyticsRes?.ok) {
      setAnalytics(await analyticsRes.json())
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.link_afiliado) {
      alert('Preencha todos os campos')
      return
    }

    setLoading(true)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      setForm({ nome: '', link_afiliado: '', secao: 'gerais' })
      loadData()
    } else {
      alert('Erro ao adicionar produto')
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza?')) return

    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    })

    if (res.ok) loadData()
  }

  if (!authenticated) {
    return (
      <div style={{ fontFamily: 'Archivo Black, system-ui' }} className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="border-2 border-black p-6 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border-2 border-black mb-4"
            />
            <button
              type="submit"
              className="w-full p-2 bg-black text-white font-bold"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Archivo Black, system-ui' }} className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={() => { setAuthenticated(false); setPassword('') }}
            className="text-sm underline"
          >
            Sair
          </button>
        </div>

        {/* Form Add */}
        <div className="border-2 border-black p-4 mb-6">
          <h2 className="text-lg font-bold mb-4">Adicionar Produto</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              type="text"
              placeholder="Nome do produto"
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              className="w-full p-2 border-2 border-black"
            />
            <input
              type="url"
              placeholder="Link de afiliado"
              value={form.link_afiliado}
              onChange={e => setForm({ ...form, link_afiliado: e.target.value })}
              className="w-full p-2 border-2 border-black"
            />
            <select
              value={form.secao}
              onChange={e => setForm({ ...form, secao: e.target.value })}
              className="w-full p-2 border-2 border-black"
            >
              <option value="ultimo_video">Último Vídeo</option>
              <option value="comentarios">Comentários</option>
              <option value="gerais">Gerais</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full p-2 bg-black text-white font-bold disabled:opacity-50"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
        </div>

        {/* Analytics */}
        <div className="border-2 border-black p-4 mb-6">
          <h2 className="text-lg font-bold mb-4">Analytics</h2>
          <div className="space-y-2 text-sm">
            {analytics.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.nome}</span>
                <span className="font-bold">{item.clicks || 0} cliques</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="border-2 border-black p-4">
          <h2 className="text-lg font-bold mb-4">Produtos</h2>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 border-2 border-black">
                <div>
                  <div className="font-bold">{p.nome}</div>
                  <div className="text-xs text-gray-600">{p.secao}</div>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs border-2 border-black p-2 hover:bg-gray-100"
                >
                  Deletar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
