import { Pool, type QueryResult, type QueryResultRow } from 'pg'

let pool: Pool | undefined
let schemaReady: Promise<void> | undefined

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL não configurada')
    }
    const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString)
    pool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 10_000,
      ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
    })
  }
  return pool
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    link_afiliado TEXT NOT NULL,
    imagem_url TEXT,
    secao TEXT NOT NULL CHECK (secao IN ('ultimo_video', 'comentarios', 'gerais')),
    ordem INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS imagem_url TEXT;

  CREATE TABLE IF NOT EXISTS clicks (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_clicks_product_id ON clicks(product_id);
  CREATE INDEX IF NOT EXISTS idx_products_secao ON products(secao);
`

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(SCHEMA)
      .then(() => undefined)
      .catch((err) => {
        schemaReady = undefined
        throw err
      })
  }
  return schemaReady
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: any[] = [],
): Promise<QueryResult<T>> {
  await ensureSchema()
  return getPool().query<T>(text, params)
}
