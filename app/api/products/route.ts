import { NextRequest, NextResponse } from 'next/server'
import db, { initDb } from '@/app/lib/db'

initDb()

export async function GET() {
  try {
    const stmt = db.prepare('SELECT id, nome, link_afiliado, secao FROM products ORDER BY secao, ordem')
    const products = stmt.all()
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('Authorization')
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { nome, link_afiliado, secao } = await req.json()
    if (!nome || !link_afiliado || !secao) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const stmt = db.prepare(
      'INSERT INTO products (nome, link_afiliado, secao) VALUES (?, ?, ?)'
    )
    const result = stmt.run(nome, link_afiliado, secao)
    
    return NextResponse.json({ id: result.lastInsertRowid })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get('Authorization')
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()
    const stmt = db.prepare('DELETE FROM products WHERE id = ?')
    stmt.run(id)
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
