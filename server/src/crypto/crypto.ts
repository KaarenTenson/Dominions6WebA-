// src/crypto/crypto.ts
import { randomBytes, createHash, timingSafeEqual } from "crypto"

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex")
}

export function safeCompare(a: string, b: string): boolean {
  return timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  )
}
