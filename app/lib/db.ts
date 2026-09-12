import Database from 'better-sqlite3'
import type { Database as BetterSqlite3Database } from 'better-sqlite3'
import path from 'path'

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data.db')
const db: BetterSqlite3Database = new Database(dbPath)

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      link_afiliado TEXT NOT NULL,
      secao TEXT NOT NULL CHECK (secao IN ('ultimo_video', 'comentarios', 'gerais')),
      ordem INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_product_id ON clicks(product_id);
    CREATE INDEX IF NOT EXISTS idx_secao ON products(secao);
  `)
}

export default db
