import {
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config";

/**
 * Password hashing using Node's built-in scrypt (no native build deps).
 * Format stored: scrypt$<saltHex>$<hashHex>
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = scryptSync(password, salt, expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export interface AccessClaims {
  sub: string;
  email: string;
  roles: string[];
}

export function signAccessToken(claims: AccessClaims): string {
  const options = { expiresIn: config.jwt.accessTtl } as jwt.SignOptions;
  return jwt.sign(claims, config.jwt.accessSecret, options);
}

export function signRefreshToken(sub: string): string {
  const options = { expiresIn: config.jwt.refreshTtl } as jwt.SignOptions;
  return jwt.sign({ sub }, config.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): AccessClaims {
  return jwt.verify(token, config.jwt.accessSecret) as AccessClaims;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, config.jwt.refreshSecret) as { sub: string };
}
