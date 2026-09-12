import { timingSafeEqual } from 'crypto'

export function checkPassword(provided: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false

  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function isAuthorized(authHeader: string | null): boolean {
  if (!authHeader?.startsWith('Bearer ')) return false
  return checkPassword(authHeader.slice('Bearer '.length))
}
