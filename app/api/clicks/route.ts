import { NextRequest, NextResponse } from 'next/server'
import db, { initDb } from '@/app/lib/db'

initDb()

export async function POST(req: NextRequest) {
  try {
    const { product_id } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    
    const stmt = db.prepare('INSERT INTO clicks (product_id, ip) VALUES (?, ?)')
    stmt.run(product_id, ip)
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('Authorization')
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stmt = db.prepare(`
      SELECT p.id, p.nome, COUNT(c.id) as clicks
      FROM products p
      LEFT JOIN clicks c ON p.id = c.product_id
      GROUP BY p.id
      ORDER BY clicks DESC
    `)
    const data = stmt.all()
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
